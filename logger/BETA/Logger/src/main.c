#include <stdio.h>
#include <string.h>
#include <stdint.h>

#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"
#include "hardware/irq.h"

#include "config.h"
#include "uart_bus.h"
#include "net_time.h"
#include "mqtt_app.h"
#include "support.h"
#include "version.h"

#define FRAME_LEN                   16
#define DEV_ADDR                    0xB2

#define STATUS_OK                   0x40
#define STATUS_ERR                  0x7F

#define CMD_SERIAL                  0x01
#define CMD_BME280                  0x05
#define CMD_RTC                     0x09

#define RTC_SET                     0x00
#define RTC_READ                    0x01
#define SERIAL_READ                 0x00
#define FW_HW_VERSION_READ          0x01
#define FW_BUILD_READ               0x02
#define PRODUCTION_DATE_READ        0x03
typedef struct {
    uint8_t year, month, day;
    uint8_t hour, min, sec;
    uint8_t weekday;
    uint8_t vl;
} stm32_time_t;

typedef struct {
    float temp_c;
    float hum_pct;
    float press_hpa;
} bme_data_t;

typedef struct{
    uint32_t serial_number;
    uint8_t fw_major, fw_minor, fw_patch;
    uint8_t hw_major, hw_minor;
    char fw_build[12];
    char production_date[12];
} stm32_data_t;

static volatile uint8_t rx_frame[FRAME_LEN];
static volatile uint8_t rx_idx = 0;
static volatile uint8_t rx_ready = 0;

static stm32_time_t g_time;
static bme_data_t   g_bme;
static stm32_data_t g_stm32_data;

static volatile uint8_t wait_rtc = 0;
static volatile uint8_t wait_bme = 0;
static volatile uint8_t wait_serial = 0;
static volatile uint8_t wait_fw_hw_version = 0;
static volatile uint8_t wait_fw_build = 0;
static volatile uint8_t wait_production_date = 0;


static void uart_irq_handler(void)
{
    while (uart_is_readable(UART_PORT)) {
        uint8_t b = uart_getc(UART_PORT);

        if (rx_idx == 0 && b != DEV_ADDR)
            continue;

        rx_frame[rx_idx++] = b;

        if (rx_idx == FRAME_LEN) {
            rx_ready = 1;
            rx_idx = 0;
        }
    }
}

static void uart_send(uint8_t cmd, uint8_t param,
                      const uint8_t *payload, uint8_t len)
{
    uint8_t frame[FRAME_LEN] = {0};

    frame[0] = DEV_ADDR;
    frame[1] = 0x00;
    frame[2] = cmd;
    frame[3] = param;

    if (payload && len) {
        if (len > 12) len = 12;
        memcpy(&frame[4], payload, len);
    }

    frame[15] = crc8_atm(frame, 15);

    uart_write_blocking(UART_PORT, frame, FRAME_LEN);
}

static void stm32_read_serial(void) {
    uart_send(CMD_SERIAL, SERIAL_READ, NULL, 0);
    wait_serial = 1;
}

static void stm32_read_fw_hw_version(void) {
    uart_send(CMD_SERIAL, FW_HW_VERSION_READ, NULL, 0);
    wait_fw_hw_version = 1;
}

static void stm32_read_fw_date(void) {
    uart_send(CMD_SERIAL, FW_BUILD_READ, NULL, 0);
    wait_fw_build = 1;
}


static void stm32_read_production_date(void) {
    uart_send(CMD_SERIAL, PRODUCTION_DATE_READ, NULL, 0);
    wait_production_date = 1;
}

static void stm32_rtc_set(const ntp_time_t *t)
{
    uint8_t p[7] = {
        t->sec, t->min, t->hour,
        t->day, 0,
        t->month, t->year
    };
    uart_send(CMD_RTC, RTC_SET, p, 7);
}

static void stm32_rtc_read(void)
{
    uart_send(CMD_RTC, RTC_READ, NULL, 0);
    wait_rtc = 1;
}

static void stm32_bme_read(void)
{
    uart_send(CMD_BME280, 0x00, NULL, 0);
    wait_bme = 1;
}

static uint8_t parse_rtc(const volatile uint8_t *f, stm32_time_t *t)
{
    if (f[1] != STATUS_OK || f[2] != CMD_RTC || f[3] != RTC_READ)
        return 0;

    t->sec     = f[4];
    t->min     = f[5];
    t->hour    = f[6];
    t->day     = f[7];
    t->weekday = f[8];
    t->month   = f[9];
    t->year    = f[10];
    t->vl      = f[11];
    return 1;
}

static uint8_t parse_bme(const volatile uint8_t *f, bme_data_t *b)
{
    if (f[1] != STATUS_OK || f[2] != CMD_BME280)
        return 0;

    int32_t tr =
        ((uint32_t)f[4] << 24) |
        ((uint32_t)f[5] << 16) |
        ((uint32_t)f[6] << 8)  |
        f[7];

    uint32_t hr =
        ((uint32_t)f[8]  << 24) |
        ((uint32_t)f[9]  << 16) |
        ((uint32_t)f[10] << 8)  |
        f[11];

    uint16_t pr_hpa =
        ((uint16_t)f[12] << 8) |
        f[13];

    b->temp_c    = tr / 100.0f;
    b->hum_pct   = hr / 1024.0f;
    b->press_hpa = (float)pr_hpa;
    return 1;
}

static uint8_t wifi_connect(void)
{
    if (cyw43_arch_init()) return 0;
    cyw43_arch_enable_sta_mode();
    return cyw43_arch_wifi_connect_timeout_ms(
        WIFI_SSID, WIFI_PASSWORD,
        CYW43_AUTH_WPA2_AES_PSK, 30000) == 0;
}

static inline uint8_t frame_crc_ok(const volatile uint8_t *f) {
    uint8_t tmp[15];
    for (int i = 0; i < 15; i++) tmp[i] = f[i];
    return (crc8_atm(tmp, 15) == f[15]);
}

int main(void)
{
    stdio_init_all();
    sleep_ms(500);

    uart_bus_init(UART_PORT, UART_TX_PIN, UART_RX_PIN, UART_BAUD);
    int irq = (UART_PORT == uart0) ? UART0_IRQ : UART1_IRQ;
    irq_set_exclusive_handler(irq, uart_irq_handler);
    irq_set_enabled(irq, true);
    uart_set_irq_enables(UART_PORT, true, false);

    if (!wifi_connect())
        printf("WiFi FAIL\n");

    ntp_time_t ntp;
    if (ntp_sync(10000) && ntp_get_time(&ntp)) {
        stm32_rtc_set(&ntp);
    }


    mqtt_init(NULL);

    absolute_time_t next = make_timeout_time_ms(5000);

    while (1) {

        if (rx_ready) {
            rx_ready = 0;

            if (!frame_crc_ok(rx_frame)) {
                printf("CRC FAIL\n");
                continue;
            }

            if (wait_rtc && rx_frame[2] == CMD_RTC && rx_frame[3] == RTC_READ && parse_rtc(rx_frame, &g_time)) {
                wait_rtc = 0;

                if (g_time.vl) {
                    printf("RTC VL=1, time invalid\n");
                }

                stm32_read_serial();
            }

            if (wait_serial && rx_frame[2] == CMD_SERIAL && rx_frame[3] == SERIAL_READ) {
                wait_serial = 0;

                g_stm32_data.serial_number =
                    ((uint32_t)rx_frame[4] << 24) |
                    ((uint32_t)rx_frame[5] << 16) |
                    ((uint32_t)rx_frame[6] << 8)  |
                    rx_frame[7];

                stm32_read_fw_hw_version();
            }

           if (wait_fw_hw_version && rx_frame[2] == CMD_SERIAL && rx_frame[3] == FW_HW_VERSION_READ) {
                wait_fw_hw_version = 0;

                g_stm32_data.fw_major = rx_frame[4];
                g_stm32_data.fw_minor = rx_frame[5];
                g_stm32_data.fw_patch = rx_frame[6];
                g_stm32_data.hw_major = rx_frame[7];
                g_stm32_data.hw_minor = rx_frame[8];

                stm32_read_fw_date();
            }

            if (wait_fw_build && rx_frame[2] == CMD_SERIAL && rx_frame[3] == FW_BUILD_READ) {
                wait_fw_build = 0;

                memcpy(g_stm32_data.fw_build, (const void *)&rx_frame[4], 8);
                g_stm32_data.fw_build[8] = '\0';

                stm32_read_production_date();
            }

            if (wait_production_date && rx_frame[2] == CMD_SERIAL && rx_frame[3] == PRODUCTION_DATE_READ) {
                wait_production_date = 0;

                memcpy(g_stm32_data.production_date, (const void *)&rx_frame[4], 8);
                g_stm32_data.production_date[8] = '\0';

                stm32_bme_read();
            }
            if (wait_bme && parse_bme(rx_frame, &g_bme)) {
                wait_bme = 0;

                if (mqtt_ready()) {
                    char msg[320];
                    int n = snprintf(msg, sizeof(msg),
                        "{\"ts\":\"20%02u-%02u-%02uT%02u:%02u:%02uZ\","
                        "\"t\":%.2f,\"h\":%.2f,\"p\":%.2f,"
                        "\"sn_contr\":%lu,\"fw_contr\":\"%u.%u.%u\",\"hw_contr\":\"%u.%u\","
                        "\"build_contr\":\"%s\",\"prod_contr\":\"%s\",\"sn_pico\":%s,\"fw_pico\":\"%s\",\"hw_pico\":\"%s\","
                        "\"build_pico\":\"%s\",\"prod_pico\":\"%s\"}",
                        g_time.year, g_time.month, g_time.day,
                        g_time.hour, g_time.min, g_time.sec,
                        g_bme.temp_c, g_bme.hum_pct, g_bme.press_hpa,
                        (unsigned long)g_stm32_data.serial_number,
                        g_stm32_data.fw_major, g_stm32_data.fw_minor, g_stm32_data.fw_patch,
                        g_stm32_data.hw_major, g_stm32_data.hw_minor,
                        g_stm32_data.fw_build, g_stm32_data.production_date, SERIAL_NUMBER, FW_VERSION_STRING, HW_VERSION_STRING, BUILD_DATE, PRODUCTION_DATE);

                    mqtt_send(MQTT_TOPIC_PUB,
                              (uint8_t *)msg, (uint16_t)n);
                }
            }
        }

        if (time_reached(next)) {
            next = make_timeout_time_ms(5000);
            stm32_rtc_read();
        }

#if PICO_CYW43_ARCH_POLL
        cyw43_arch_poll();
#endif
        sleep_ms(10);
    }
}