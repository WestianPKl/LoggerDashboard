#ifndef __BME280_HPP__
#define __BME280_HPP__

#pragma once

#include <stdio.h>
#include <string.h>
#include <math.h>
#include "pico/stdlib.h"
#include "pico/binary_info.h"
#include "hardware/i2c.h"

class BME280 {
public:
    enum MODE { MODE_SLEEP = 0b00,
                MODE_FORCED = 0b01,
                MODE_NORMAL = 0b11};
private:
    const uint READ_BIT = 0x80;
    uint8_t     addr = 0x76;
    int32_t     t_fine;
    uint16_t    dig_T1;
    int16_t     dig_T2, dig_T3;
    uint16_t    dig_P1;
    int16_t     dig_P2, dig_P3, dig_P4, dig_P5, dig_P6, dig_P7, dig_P8, dig_P9;
    uint8_t     dig_H1, dig_H3;
    int8_t      dig_H6;
    int16_t     dig_H2, dig_H4, dig_H5;
    int32_t     adc_T, adc_P, adc_H;
    uint8_t     buffer[26];
    uint8_t     chip_id;
    MODE        mode;

struct MeasurementControl_t {
    // temperature oversampling
    // 000 = skipped
    // 001 = x1
    // 010 = x2
    // 011 = x4
    // 100 = x8
    // 101 and above = x16
    unsigned int osrs_t : 3; ///< temperature oversampling

    // pressure oversampling
    // 000 = skipped
    // 001 = x1
    // 010 = x2
    // 011 = x4
    // 100 = x8
    // 101 and above = x16
    unsigned int osrs_p : 3; ///< pressure oversampling

    // device mode
    // 00       = sleep
    // 01 or 10 = forced
    // 11       = normal
    unsigned int mode : 2; ///< device mode

    /// @return
    unsigned int get() { return (osrs_t << 5) | (osrs_p << 2) | mode; }
}   measurement_reg;

public:
    struct Measurement_t {
        float temperature;
        float humidity;
        float pressure;
        float altitude;
    } measurement;

    BME280( MODE mode);

    Measurement_t measure();
    uint8_t get_chipID();
 


private:
    int32_t     compensate_temp(int32_t adc_T);
    uint32_t    compensate_pressure(int32_t adc_P); 
    uint32_t    compensate_humidity(int32_t adc_H);
    void        bme280_read_raw(int32_t *humidity, int32_t *pressure, int32_t *temperature);
    void        write_register(uint8_t reg, uint8_t data);
    void        read_registers(uint8_t reg, uint8_t *buf, uint16_t len);
    void        read_compensation_parameters(); 
};

#endif /* __BME280_HPP__ */