/**
 * @file program_main.hpp
 * @brief Main program class for the Pico_TH_Logger_SMD_PCF8563T project.
 *
 * This header defines the ProgramMain class, which manages the initialization and operation
 * of the BME280 sensor and TCP communication, as well as WiFi connectivity, RGB LED control,
 * and data display/transmission functionalities.
 *
 * Macros are provided for I2C port and pin configuration, as well as WiFi status codes.
 *
 * Classes:
 *  - ProgramMain: Handles equipment initialization, WiFi setup, RGB LED control, measurement display,
 *    and data transmission.
 *
 * Dependencies:
 *  - bme280.hpp: For BME280 sensor interaction.
 *  - tcp.hpp: For TCP communication.
 *
 * Macros:
 *  - I2C_PORT: I2C port used for sensor communication.
 *  - I2C_SDA: I2C data pin.
 *  - I2C_SCL: I2C clock pin.
 *  - WIFI_INIT_FAIL: WiFi initialization failure code.
 *  - WIFI_CONN_FAIL: WiFi connection failure code.
 *  - WIFI_OK: WiFi success code.
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