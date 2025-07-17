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