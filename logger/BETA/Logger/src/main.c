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


// TODO: podmień na realny odczyt
static void read_sensors(float *t, float *h) {
    *t = 23.50f;
    *h = 45.20f;
}

static void wifi_connect_blocking(void) {
    if (cyw43_arch_init()) {
        printf("cyw43 init failed\n");
        return;
    }
    cyw43_arch_enable_sta_mode();

    printf("Wi-Fi connect: %s\n", WIFI_SSID);
    int rc = cyw43_arch_wifi_connect_timeout_ms(
        WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000
    );
    printf("Wi-Fi rc=%d\n", rc);
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
    printf("Logger boot\n");

    i2c_bus_init(I2C_PORT, I2C_SDA_PIN, I2C_SCL_PIN, I2C_BAUD);

    wifi_connect_blocking();

    printf("Loading settings...\n");

    settings_t cfg;
    if (!settings_load(I2C_PORT, EEPROM_ADDR, &cfg)) {
        printf("Settings not found/invalid -> defaults\n");
        settings_defaults(&cfg);
        settings_save(I2C_PORT, EEPROM_ADDR, &cfg);
    }
    printf("sample_period_ms=%u pub=%s sub=%s\n", cfg.sample_period_ms, cfg.pub_topic, cfg.sub_topic);

    datetime_t now;
    bool rtc_ok = rtc_pcf8563_get_datetime(I2C_PORT, RTC_ADDR, &now);
    if (!rtc_ok || now.year < 2024) {
        printf("RTC invalid -> NTP sync\n");
        ntp_correct_rtc_blocking(I2C_PORT, RTC_ADDR, 12000);
        rtc_pcf8563_get_datetime(I2C_PORT, RTC_ADDR, &now);
    } else {
        printf("RTC OK: %04u-%02u-%02u %02u:%02u:%02u\n",
               now.year, now.month, now.day, now.hour, now.min, now.sec);
    }

    mqtt_app_start(&cfg);

    absolute_time_t next_sample = make_timeout_time_ms(cfg.sample_period_ms);

    while (true) {
        if (time_reached(next_sample)) {
            next_sample = make_timeout_time_ms(cfg.sample_period_ms);

            datetime_t dt;
            rtc_pcf8563_get_datetime(I2C_PORT, RTC_ADDR, &dt);

            float t, h;
            read_sensors(&t, &h);

            mqtt_publish_telemetry(cfg.pub_topic, &dt, t, h);

            printf("LOG %04u-%02u-%02u %02u:%02u:%02u  t=%.2f h=%.2f\n",
                   dt.year, dt.month, dt.day, dt.hour, dt.min, dt.sec, t, h);
        }

        sleep_ms(10);
    }
}