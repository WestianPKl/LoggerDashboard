#include <stdio.h>
#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"
#include "config.h"
#include "i2c_bus.h"
#include "rtc_pcf8563.h"
#include "net_time.h"
#include "eeprom_m24c32.h"
#include "settings.h"
#include "mqtt_app.h"
#include "uart_bus.h"

volatile uint8_t g_uart_flag = 0;

static void wifi_connect_blocking(void) {
    if (cyw43_arch_init()) {
        uart_puts(UART_PORT, "cyw43 init failed\n");
        return;
    }
    cyw43_arch_enable_sta_mode();

    uart_puts(UART_PORT, ("Wi-Fi connect: %s\n", WIFI_SSID));
    int rc = cyw43_arch_wifi_connect_timeout_ms(
        WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000
    );
    if (rc != 0) {
        uart_puts(UART_PORT, "Wi-Fi connection failed\n");
        return;
    }
}

void on_uart_irq() {
    while (uart_is_readable(UART_PORT)) {
        g_uart_flag = 1;
    }
}

int main() {
    stdio_init_all();

    gpio_init(RTC_ON);
    gpio_init(EEPROM_ON);

    gpio_set_dir(RTC_ON, GPIO_OUT);
    gpio_set_dir(EEPROM_ON, GPIO_OUT);

    gpio_put(RTC_ON, 1);
    gpio_put(EEPROM_ON, 1);

    sleep_ms(1500);

    uart_bus_init(UART_PORT, UART_TX_PIN, UART_RX_PIN, UART_BAUD);
    int UART_IRQ = UART_PORT == uart0 ? UART0_IRQ : UART1_IRQ;
    irq_set_exclusive_handler(UART_IRQ, on_uart_irq);
    irq_set_enabled(UART_IRQ, true);
    uart_set_irq_enables(UART_PORT, true, true);

    i2c_bus_init(I2C_PORT, I2C_SDA_PIN, I2C_SCL_PIN, I2C_BAUD);

    wifi_connect_blocking();

    uart_puts(UART_PORT, "Logger boot\n");

    settings_t cfg;
    if (!settings_load(I2C_PORT, EEPROM_ADDR, &cfg)) {
        uart_puts(UART_PORT, "Settings not found/invalid -> defaults\n");
        settings_defaults(&cfg);
        settings_save(I2C_PORT, EEPROM_ADDR, &cfg);
    }
    uart_puts(UART_PORT, ("sample_period_ms=%u pub=%s sub=%s\n", cfg.sample_period_ms, cfg.pub_topic, cfg.sub_topic));

    datetime_t now;
    bool rtc_ok = rtc_pcf8563_get_datetime(I2C_PORT, RTC_ADDR, &now);
    if (!rtc_ok || now.year < 2024) {
        uart_puts(UART_PORT, "RTC invalid -> NTP sync\n");
        ntp_correct_rtc_blocking(I2C_PORT, RTC_ADDR, 12000);
        rtc_pcf8563_get_datetime(I2C_PORT, RTC_ADDR, &now);
    } else {
        uint8_t data[7];
        data[0] = (uint8_t)(now.year >> 8);
        data[1] = (uint8_t)(now.year & 0xFF);
        data[2] = now.month;
        data[3] = now.day;
        data[4] = now.hour;
        data[5] = now.min;
        data[6] = now.sec;
        uart_puts(UART_PORT, ("RTC time: %d", data) );
    }

    mqtt_app_start(&cfg);

    absolute_time_t next_sample = make_timeout_time_ms(cfg.sample_period_ms);

    while (true) {
        tight_loop_contents();

        if(g_uart_flag) {
            g_uart_flag = 0;
            uint8_t c = uart_getc(UART_PORT);
            uart_puts(UART_PORT, "UART RX data\n");
            printf("Received char: %c (0x%02X)\n", c, c);
        }

        if (time_reached(next_sample)) {
            next_sample = make_timeout_time_ms(cfg.sample_period_ms);

            datetime_t dt;
            rtc_pcf8563_get_datetime(I2C_PORT, RTC_ADDR, &dt);

            int32_t t = 2235;
            uint32_t h = 5021;
            mqtt_publish_telemetry(cfg.pub_topic, &dt, t, h);


            uint8_t data[11];
            data[0] = (uint8_t)(now.year >> 8);
            data[1] = (uint8_t)(now.year & 0xFF);
            data[2] = now.month;
            data[3] = now.day;
            data[4] = now.hour;
            data[5] = now.min;
            data[6] = now.sec;
            data[7] = (uint8_t)(t >> 8);
            data[8] = (uint8_t)(t & 0xFF);
            data[9] = (uint8_t)(h >> 8);
            data[10] = (uint8_t)(h & 0xFF);
            uart_puts(UART_PORT, ("LOG %d\n",
                   data));
        }

        sleep_ms(10);
    }
}