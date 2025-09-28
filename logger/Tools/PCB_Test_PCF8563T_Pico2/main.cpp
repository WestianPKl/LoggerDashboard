#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/i2c.h"
#include "hardware/pwm.h"
#include <time.h>
#include <math.h>
#include "lcd_1602_i2c.hpp"
#include "rtc_clock.hpp"
#include "main.hpp"
#include "bme280.hpp"
#include "sht30.hpp"

// #define LED_BLUE    6
// #define LED_GREEN   8
// #define LED_RED     7
// #define BUZZER      11
// #define RELAY_1     12
// #define RELAY_2     13
// #define RELAY_3     14
// #define RELAY_4     15
// #define SWITCH_1    21
// #define SWITCH_2    20

#define LED_BLUE    18
#define LED_GREEN   20
#define LED_RED     19
#define BUZZER      11
#define SWITCH_1    17
#define SWITCH_2    16
#define RELAY_1     0
#define RELAY_2     0
#define RELAY_3     0
#define RELAY_4     0

using namespace std;

BME280* bme_sensor = nullptr;
SHT30* sht_sensor = nullptr;

void poll_buttons();
void setup_pwm(uint);
void set_pwm_duty(uint, uint16_t);
void set_rgb_color(uint8_t, uint8_t, uint8_t);
void set_system_time();
float get_temperature();
float get_humidity();
float get_pressure();
void play_note(uint, uint);
void buzzer_test();

int main() {
    stdio_init_all();
    sleep_ms(2000);

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

    i2c_init(i2c_default, 400 * 1000);
    gpio_set_function(I2C_SDA, GPIO_FUNC_I2C);
    gpio_set_function(I2C_SCL, GPIO_FUNC_I2C);
    gpio_pull_up(I2C_SDA);
    gpio_pull_up(I2C_SCL);
    bi_decl(bi_2pins_with_func(I2C_SDA, I2C_SCL, GPIO_FUNC_I2C));

    gpio_init(SWITCH_1);
    gpio_init(SWITCH_2);

    gpio_set_dir(SWITCH_1, GPIO_IN);
    gpio_set_dir(SWITCH_2, GPIO_IN);

    gpio_pull_up(SWITCH_1);
    gpio_pull_up(SWITCH_2);

    if (RELAY == 1) {
        gpio_init(RELAY_1);
        gpio_init(RELAY_2);
        gpio_init(RELAY_3);
        gpio_init(RELAY_4);

        gpio_set_dir(RELAY_1, GPIO_OUT);
        gpio_set_dir(RELAY_2, GPIO_OUT);
        gpio_set_dir(RELAY_3, GPIO_OUT);
        gpio_set_dir(RELAY_4, GPIO_OUT);

        gpio_put(RELAY_1, 0);
        gpio_put(RELAY_2, 0);
        gpio_put(RELAY_3, 0);
        gpio_put(RELAY_4, 0);
    };

    lcd_init();

    if (SHT == 1) {
        sht_sensor = new SHT30();
    } else {
        bme_sensor = new BME280(BME280::MODE::MODE_FORCED);
    }
        
    if (CLOCK == 1) {
        pcf8563t_init(I2C_PORT);
    }

    //## LED TEST ## 
    lcd_string("RGB TEST");
    sleep_ms(2000);
    lcd_clear();
    lcd_string("RED");
    set_rgb_color(255, 0, 0);
    sleep_ms(2000);
    lcd_clear();
    lcd_string("GREEN");
    set_rgb_color(0, 255, 0);
    sleep_ms(2000);
    lcd_clear();
    lcd_string("BLUE");
    set_rgb_color(0, 0, 255);
    sleep_ms(2000);
    lcd_clear();
    lcd_string("WHITE");
    set_rgb_color(255, 255, 255);
    sleep_ms(2000);
    set_rgb_color(0, 0, 0);
    lcd_clear();

    //## BUZZER TEST ##
    lcd_string("BUZZER TEST");
    buzzer_test();
    sleep_ms(1000);
    lcd_clear();

    //## RTC TEST ##
    lcd_string("RTC TEST");
    sleep_ms(2000);
    lcd_clear();
    if (SET_TIME == 1) {
        set_system_time();
    }
    uint16_t timev[7];
    if (CLOCK == 1) {
        pcf8563t_read_time(I2C_PORT, timev);
            char line1[17];
        snprintf(line1, sizeof(line1), "%04d-%02d-%02d %02d:%02d",
                timev[6], timev[5], timev[3], timev[2], timev[1]);
        lcd_set_cursor(0, 0);
        lcd_string(line1);
        sleep_ms(2000);
        lcd_clear();
    }

    //## SENSOR TEST ##
    lcd_string("SENSOR TEST");
    sleep_ms(2000);
    lcd_clear();
    float temperature = get_temperature();
    float humidity = get_humidity();
       
    char line2[17];
    snprintf(line2, sizeof(line2), "T:%.1fC H:%.1f%%", temperature, humidity);
    lcd_set_cursor(0, 0);
    lcd_string(line2);
    sleep_ms(2000);
    lcd_clear();

    //## RELAY TEST ## 
    if(RELAY == 1){
        gpio_put(RELAY_1, 1);
        gpio_put(RELAY_2, 0);
        gpio_put(RELAY_3, 0);
        gpio_put(RELAY_4, 0);
        sleep_ms(2000);
        gpio_put(RELAY_1, 0);
        gpio_put(RELAY_2, 1);
        gpio_put(RELAY_3, 0);
        gpio_put(RELAY_4, 0);
        sleep_ms(2000);
        gpio_put(RELAY_1, 0);
        gpio_put(RELAY_2, 0);
        gpio_put(RELAY_3, 1);
        gpio_put(RELAY_4, 0);
        sleep_ms(2000);
        gpio_put(RELAY_1, 0);
        gpio_put(RELAY_2, 0);
        gpio_put(RELAY_3, 0);
        gpio_put(RELAY_4, 1);
        sleep_ms(2000);
        gpio_put(RELAY_1, 0);
        gpio_put(RELAY_2, 0);
        gpio_put(RELAY_3, 0);
        gpio_put(RELAY_4, 0);
    }
    lcd_set_backlight(false);
    while (true) {
        poll_buttons();
    }
    return 0;
}

void setup_pwm(uint gpio) {
    gpio_set_function(gpio, GPIO_FUNC_PWM);
    uint slice_num = pwm_gpio_to_slice_num(gpio);
    pwm_set_enabled(slice_num, true);
}

void set_pwm_duty(uint gpio, uint16_t duty) {
    uint slice_num = pwm_gpio_to_slice_num(gpio);
    uint channel = pwm_gpio_to_channel(gpio);
    pwm_set_chan_level(slice_num, channel, duty);
}

void set_rgb_color(uint8_t red, uint8_t green, uint8_t blue) {
    set_pwm_duty(LED_RED, red);
    set_pwm_duty(LED_GREEN, green);
    set_pwm_duty(LED_BLUE, blue);
}

void set_system_time() {
    if (SET_TIME  == 1) {
        pcf8563t_set_time(I2C_PORT, 0, 0, 12, 2, 22, 12, 1992);
    }
}

void poll_buttons() {
    bool switch1_state = gpio_get(SWITCH_1);
    bool switch2_state = gpio_get(SWITCH_2);
    
    if (!switch1_state && btn21_prev) {
        btn21_pressed = true;
        set_rgb_color(255, 255, 255);
    } else if (switch1_state && !btn21_prev && btn21_pressed) {
        btn21_pressed = false;
        set_rgb_color(0, 0, 0);
    }
    btn21_prev = switch1_state;
    
    if (!switch2_state && btn20_prev) {
        btn20_pressed = true;
        set_rgb_color(255, 255, 255);
    } else if (switch2_state && !btn20_prev && btn20_pressed) {
        btn20_pressed = false;
        set_rgb_color(0, 0, 0);
    }
    btn20_prev = switch2_state;
}

float get_temperature() {
    if (SHT == 1 && sht_sensor != nullptr) {
        SHT30::Measurement_t values = sht_sensor->measure();
        return values.temperature;
    } else if (SHT == 0 && bme_sensor != nullptr) {
        BME280::Measurement_t values = bme_sensor->measure();
        return values.temperature;
    }
    return 0.0f;
}

float get_humidity() {
    if (SHT == 1 && sht_sensor != nullptr) {
        SHT30::Measurement_t values = sht_sensor->measure();
        return values.humidity;
    } else if (SHT == 0 && bme_sensor != nullptr) {
        BME280::Measurement_t values = bme_sensor->measure();
        return values.humidity;
    }
    return 0.0f;
}

float get_pressure() {
    if (SHT == 0 && bme_sensor != nullptr) {
        BME280::Measurement_t values = bme_sensor->measure();
        return values.pressure;
    }
    return 0.0f;
}

void play_note(uint frequency, uint duration_ms) {
    if (frequency == 0) {
        set_pwm_duty(BUZZER, 0);
    } else {
        uint slice_num = pwm_gpio_to_slice_num(BUZZER);
        uint32_t clock_freq = 125000000;
        uint32_t divider = clock_freq / (frequency * 4096);
        if (divider < 1) divider = 1;
        if (divider > 255) divider = 255;
        
        pwm_set_clkdiv(slice_num, (float)divider);
        pwm_set_wrap(slice_num, 4096);
        set_pwm_duty(BUZZER, 2048);
    }
    
    sleep_ms(duration_ms);
    set_pwm_duty(BUZZER, 0);
}

void buzzer_test() {
    const uint DO = 262;
    const uint RE = 294; 
    const uint MI = 330;
    const uint FA = 349;
    const uint SO = 392;
    const uint LA = 440;
    const uint SI = 494;
    const uint DO_HIGH = 523;

    const uint note_duration = 375;
    play_note(DO, note_duration);
    play_note(RE, note_duration);  
    play_note(MI, note_duration);
    play_note(FA, note_duration);
    play_note(SO, note_duration);
    play_note(LA, note_duration);
    play_note(SI, note_duration);
    play_note(DO_HIGH, note_duration);
}