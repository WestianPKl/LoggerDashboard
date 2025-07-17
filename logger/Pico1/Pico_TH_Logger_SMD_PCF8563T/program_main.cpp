#include "hardware/i2c.h"
#include "hardware/pwm.h"
#include "hardware/rtc.h"
#include "pico/cyw43_arch.h"
extern "C" {
    #include "lwip/apps/sntp.h"
    #include "lwip/dns.h"
    #include "lwip/ip_addr.h"
    #include "lwip/timeouts.h"
}
#include <time.h>
#include "program_main.hpp"
#include "lcd_1602_i2c.hpp"
#include "rtc_clock.hpp"
#include "main.hpp"

#define LED_BLUE    18
#define LED_GREEN   19
#define LED_RED     20
#define BUZZER      11

using namespace std;

volatile bool time_synced = false;
static volatile bool dns_resolved = false;
static ip_addr_t resolved_ip;

static void dns_callback(const char* name, const ip_addr_t* ipaddr, void* callback_arg) {
    if (ipaddr) {
        resolved_ip = *ipaddr;
        dns_resolved = true;
    }
}

void ProgramMain::setup_pwm(uint gpio) {
    gpio_set_function(gpio, GPIO_FUNC_PWM);
    uint slice_num = pwm_gpio_to_slice_num(gpio);
    pwm_set_enabled(slice_num, true);
}

void ProgramMain::set_pwm_duty(uint gpio, uint16_t duty) {
    uint slice_num = pwm_gpio_to_slice_num(gpio);
    uint channel = pwm_gpio_to_channel(gpio);
    pwm_set_chan_level(slice_num, channel, duty);
}

bool ProgramMain::synchronize_time() {
    setenv("TZ", "CET-1CEST,M3.5.0/2,M10.5.0/3", 1);
    tzset();

    err_t err = dns_gethostbyname("tempus1.gum.gov.pl", &resolved_ip, dns_callback, NULL);
    if (err == ERR_OK) {
        dns_resolved = true;
    } else if (err == ERR_INPROGRESS) {
        for (int i = 0; i < 100 && !dns_resolved; i++) {
            cyw43_arch_poll();
            sleep_ms(100);
        }
    } else {
        printf("❌ DNS error: %d\n", err);
        return false;
    }

    if (!dns_resolved) {
        printf("❌ DNS timeout\n");
        return false;
    }

    printf("🌐 NTP resolved to: %s\n", ipaddr_ntoa(&resolved_ip));

    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setserver(0, &resolved_ip);
    sntp_init();

    for (int i = 0; i < 30; ++i) {
        cyw43_arch_poll();
        if (time_synced) {
            printf("✅ SNTP time confirmed via callback\n");
            sntp_stop();
            return true;
        }
        sleep_ms(300);
    }

    printf("❌ SNTP timeout\n");
    return false;
}

void ProgramMain::init_equipment() {
    setup_pwm(LED_RED);
    setup_pwm(LED_GREEN);
    setup_pwm(LED_BLUE);
    setup_pwm(BUZZER);

    pwm_set_wrap(pwm_gpio_to_slice_num(LED_RED), 255);
    pwm_set_wrap(pwm_gpio_to_slice_num(LED_GREEN), 255);
    pwm_set_wrap(pwm_gpio_to_slice_num(LED_BLUE), 255);

    set_pwm_duty(LED_RED, 0);
    set_pwm_duty(LED_GREEN, 0);
    set_pwm_duty(LED_BLUE, 0);
    set_pwm_duty(BUZZER, 0);

    set_rgb_color(255, 255, 255);

    i2c_init(i2c_default, 400 * 1000);
    gpio_set_function(I2C_SDA, GPIO_FUNC_I2C);
    gpio_set_function(I2C_SCL, GPIO_FUNC_I2C);
    gpio_pull_up(I2C_SDA);
    gpio_pull_up(I2C_SCL);
    bi_decl(bi_2pins_with_func(I2C_SDA, I2C_SCL, GPIO_FUNC_I2C));

    lcd_init();
    lcd_clear();
    lcd_string("Starting...");

    myBME280 = new BME280(BME280::MODE::MODE_FORCED);
    myTCP = new TCP();

    if (CLOCK == 1){
        pcf8563t_init(I2C_PORT);
    } else {
        rtc_init();
    }

    set_rgb_color(0, 255, 0);
    printf("✅ Equipment initialized correctly\n");
}

uint8_t ProgramMain::init_wifi() {
    const char *SSID = "TP-Link_0A7B";
    const char *PASSWORD = "12345678";

    set_rgb_color(255, 255, 255);
    if (cyw43_arch_init()) {
        printf("❌ Wi-Fi init failed\n");
        lcd_set_cursor(0, 0);
        lcd_string("❌ WiFi init error\n");
        set_rgb_color(255, 0, 0);
        return WIFI_INIT_FAIL;
    }

    cyw43_arch_enable_sta_mode();
    if (cyw43_arch_wifi_connect_timeout_ms(SSID, PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000)) {
        lcd_set_cursor(0, 0);
        lcd_string("❌ WiFi conn error\n");
        set_rgb_color(255, 0, 0);
        return WIFI_CONN_FAIL;
    }

    set_rgb_color(0, 255, 0);
    printf("✅ WiFi conn OK\n");
    synchronize_time();
    return WIFI_OK;
}

void ProgramMain::set_rgb_color(uint8_t red, uint8_t green, uint8_t blue) {
    set_pwm_duty(LED_RED, red);
    set_pwm_duty(LED_GREEN, green);
    set_pwm_duty(LED_BLUE, blue);
}

void ProgramMain::display_measurement() {
    static uint8_t option = 0;
    bool time_ok = false;
    uint16_t time[7];
    if (CLOCK == 1) {
        time_ok = pcf8563t_read_time(I2C_PORT, time);
    } else {
        datetime_t t;
        time_ok = rtc_get_datetime(&t);
        time[6] = t.year;
        time[5] = t.month;
        time[3] = t.day;
        time[2] = t.hour;
        time[1] = t.min;
        time[0] = t.sec;
    }

    if (!time_ok) {
        printf("❌ Time could not be readed.\n");
        TCP().send_error_log("Time could not be readed.", CLOCK ? "PCF8563" : "RTC");
        return;
    }

    BME280::Measurement_t values = myBME280->measure();

    if (values.temperature < -100 || values.temperature > 100 ||
        values.humidity < 0 || values.humidity > 100) {
        printf("❌ Measurement out of range\n");
        myTCP->send_error_log("Sensor error", "Values out of range");
        return;
    }

    char line1[17];
    char line2[17];

    snprintf(line1, sizeof(line1), "%04d-%02d-%02d %02d:%02d",
             time[6], time[5], time[3], time[2], time[1]);

    if (option == 0) {
        set_rgb_color(0, 255, 0);
        snprintf(line2, sizeof(line2), "T:%.1fC H:%.1f%%", values.temperature, values.humidity);
        lcd_set_cursor(1, 0);
        lcd_string("                ");
        lcd_set_cursor(1, 0);
        lcd_string(line2);
    } else if (option == 3) {
        set_rgb_color(0, 0, 0);
        snprintf(line2, sizeof(line2), "P:%4.0fhPa", values.pressure);
        lcd_set_cursor(1, 0);
        lcd_string("                ");
        lcd_set_cursor(1, 0);
        lcd_string(line2);
    }
    lcd_set_cursor(0, 0);
    lcd_string(line1);
    option++;
	if(option > 6){
		option = 0;
	}
    printf("✅ Data OK\n");
}

void ProgramMain::send_data() {
    bool time_ok = false;
    uint16_t time[7];
    if (CLOCK == 1) {
        time_ok = pcf8563t_read_time(I2C_PORT, time);
    } else {
        datetime_t t;
        time_ok = rtc_get_datetime(&t);
        time[6] = t.year;
        time[5] = t.month;
        time[3] = t.day;
        time[2] = t.hour;
        time[1] = t.min;
        time[0] = t.sec;
    }
    if (!time_ok) {
        printf("❌ Time could not be readed.\n");
        TCP().send_error_log("Time could not be readed.", CLOCK ? "PCF8563" : "RTC");
        return;
    }
    char time_send[32];
    snprintf(time_send, sizeof(time_send), "%04d-%02d-%02d %02d:%02d:%02d",
             time[6], time[5], time[3], time[2], time[1], time[0]);
    BME280::Measurement_t values = myBME280->measure();
    if (values.temperature < -100 || values.temperature > 100 ||
        values.humidity < 0 || values.humidity > 100) {
        printf("❌ Invalid sensor values\n");
        myTCP->send_error_log("Invalid sensor data");
        return;
    }
    if (!myTCP->send_token_get_request()) {
        printf("❌ API communication error\n");
        myTCP->send_error_log("Token fetch failed");
        return;
    }
    if (strlen(myTCP->get_token()) == 0) {
        printf("❌ Token is incorrect\n");
        myTCP->send_error_log("Token is incorrect");
        return;
    }
    if (!myTCP->send_data_post_request(time_send, values.temperature, values.humidity, values.pressure)) {
        printf("❌ Data sending error\n");
        myTCP->send_error_log("Data sending error", time_send);
    }
}

extern "C" void sntp_set_system_time(uint32_t secs) {
    time_synced = true;
    time_t rawtime = secs;
    struct tm *lt = localtime(&rawtime);
    datetime_t dt = {
        .year  = (int16_t)(lt->tm_year + 1900),
        .month = (int8_t)(lt->tm_mon + 1),
        .day   = (int8_t)(lt->tm_mday),
        .dotw  = (int8_t)(lt->tm_wday),
        .hour  = (int8_t)(lt->tm_hour),
        .min   = (int8_t)(lt->tm_min),
        .sec   = (int8_t)(lt->tm_sec),
    };
    printf("🕒 [SNTP] System time set: %04d-%02d-%02d %02d:%02d:%02d\n",
           dt.year, dt.month, dt.day, dt.hour, dt.min, dt.sec);
    if (CLOCK == 1 && SET == 1) {
        pcf8563t_set_time(I2C_PORT, dt.sec, dt.min, dt.hour, dt.dotw, dt.day, dt.month, dt.year);
    } else if (CLOCK == 0 && SET == 1) {
        rtc_set_datetime(&dt);
    }
}