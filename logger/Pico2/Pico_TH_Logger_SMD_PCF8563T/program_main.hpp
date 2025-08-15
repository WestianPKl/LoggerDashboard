/**
 * @file program_main.hpp
 * @brief Main program class for the Pico_TH_Logger_SMD_PCF8563T project.
 *
 * This header defines the ProgramMain class, which manages the initialization and operation
 * of the BME280 sensor, TCP communication, PWM control, WiFi connectivity, RGB LED control,
 * measurement display, and data transmission.
 *
 * Dependencies:
 *  - bme280.hpp: BME280 sensor interface
 *  - tcp.hpp: TCP communication interface
 *
 * Macros:
 *  - I2C_PORT: I2C port used for sensor communication
 *  - I2C_SDA: I2C SDA pin number
 *  - I2C_SCL: I2C SCL pin number
 *  - WIFI_INIT_FAIL: WiFi initialization failure code
 *  - WIFI_CONN_FAIL: WiFi connection failure code
 *  - WIFI_OK: WiFi success code
 *
 * Class ProgramMain:
 *  - Handles sensor and TCP object management.
 *  - Provides methods for equipment initialization, WiFi setup, RGB LED control,
 *    measurement display, and data sending.
 *  - Contains private methods for PWM setup and time synchronization.
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

    private:
        void setup_pwm(uint);
        void set_pwm_duty(uint, uint16_t);
        bool synchronize_time();

    public:
        void init_equipment();
        uint8_t init_wifi();
        void set_rgb_color(uint8_t, uint8_t, uint8_t);
        void display_measurement();
        void send_data();
};

#endif /* __PROGRAM_MAIN_HPP__ */