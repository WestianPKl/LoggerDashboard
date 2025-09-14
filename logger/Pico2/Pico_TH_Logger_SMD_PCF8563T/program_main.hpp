/**
 * @file program_main.hpp
 * @brief Main program class for the Pico TH Logger with relay and PCF8563T RTC.
 *
 * This header defines the ProgramMain class, which manages the initialization and operation
 * of the BME280 sensor, TCP communication, WiFi connectivity, RGB LED control, measurement
 * display, and data transmission for the logger application.
 *
 * Macros are provided for I2C port and pin configuration, as well as WiFi status codes.
 *
 * Dependencies:
 *  - bme280.hpp: BME280 sensor interface
 *  - tcp.hpp: TCP communication interface
 *
 * Class ProgramMain:
 *  - Handles equipment initialization, WiFi setup, RGB LED color control, measurement display,
 *    and data sending.
 *  - Provides private methods for PWM setup and time synchronization.
 */
#ifndef __PROGRAM_MAIN_HPP__
#define __PROGRAM_MAIN_HPP__

#include "bme280.hpp"
#include "tcp.hpp"

#define I2C_PORT i2c0
#define I2C_SDA 0
#define I2C_SCL 1

#define WIFI_INIT_FAIL  255
#define WIFI_CONN_FAIL  1
#define WIFI_OK         0

class ProgramMain{
    BME280* myBME280 = nullptr;
    TCP* myTCP = nullptr;
    bool wifi_active = true;

    private:
        void setup_pwm(uint);
        void set_pwm_duty(uint, uint16_t);
        bool synchronize_time();

    public:
        void init_equipment();
        uint8_t init_wifi();
        uint8_t reconnect_wifi();
        void set_wifi_enabled(bool enabled) { wifi_active = enabled; }
        bool is_wifi_enabled() const { return wifi_active; }
        void set_rgb_color(uint8_t, uint8_t, uint8_t);
        void display_measurement();
        void send_data();
};

#endif /* __PROGRAM_MAIN_HPP__ */