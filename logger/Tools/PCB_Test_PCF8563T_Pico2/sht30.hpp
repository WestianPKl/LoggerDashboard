#ifndef __SHT30_HPP__
#define __SHT30_HPP__

#pragma once

#include <stdio.h>
#include <string.h>
#include <math.h>
#include "pico/stdlib.h"
#include "pico/binary_info.h"
#include "hardware/i2c.h"

class SHT30 {
private:
    uint8_t read_raw(uint32_t*, uint32_t*);
    void write_register(uint16_t);
    uint8_t read_register(uint8_t);
    uint8_t crc8(uint8_t*, int);
    float get_temperature();
    float get_humidity();

public:
    struct Measurement_t {
        float temperature;
        float humidity;
    } measurement{};

    Measurement_t measure();
    void soft_reset(void);
    void heater_enable_func(int8_t);
    uint16_t read_status(void);

};

#endif /* __SHT30_HPP__ */