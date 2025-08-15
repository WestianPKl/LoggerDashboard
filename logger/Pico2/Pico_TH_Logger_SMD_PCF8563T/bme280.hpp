/**
 * @file bme280.hpp
 * @brief BME280 sensor driver class for temperature, humidity, and pressure measurements using I2C on Raspberry Pi Pico.
 *
 * This header defines the BME280 class, which provides methods to initialize, configure, and read measurements from a BME280 environmental sensor.
 * The class supports reading temperature, humidity, pressure, and calculating altitude, as well as configuring oversampling and operation modes.
 *
 * @author
 * @date
 */

 /**
    * @class BME280
    * @brief Driver for the BME280 temperature, humidity, and pressure sensor.
    *
    * Provides methods for sensor initialization, configuration, and measurement retrieval.
    */
 
 /**
    * @enum BME280::MODE
    * @brief Operating modes for the BME280 sensor.
    * - MODE_SLEEP: Sleep mode (lowest power consumption).
    * - MODE_FORCED: Forced mode (single measurement).
    * - MODE_NORMAL: Normal mode (continuous measurement).
    */

 /**
    * @struct BME280::MeasurementControl_t
    * @brief Structure for configuring measurement control register.
    * - osrs_t: Temperature oversampling setting.
    * - osrs_p: Pressure oversampling setting.
    * - mode: Device operating mode.
    * - get(): Returns the combined register value.
    */

 /**
    * @struct BME280::Measurement_t
    * @brief Structure to hold measurement results.
    * - temperature: Measured temperature in degrees Celsius.
    * - humidity: Measured relative humidity in percent.
    * - pressure: Measured atmospheric pressure in Pascals.
    * - altitude: Calculated altitude in meters.
    */

 /**
    * @brief Constructs a BME280 object and initializes the sensor with the specified mode.
    * @param mode The desired operating mode (sleep, forced, or normal).
    */

 /**
    * @brief Reads and returns the latest sensor measurements.
    * @return Measurement_t structure containing temperature, humidity, pressure, and altitude.
    */

 /**
    * @brief Reads and returns the BME280 chip ID.
    * @return The chip ID value.
    */

 /**
    * @brief Reads raw sensor data for humidity, pressure, and temperature.
    * @param humidity Pointer to store raw humidity value.
    * @param pressure Pointer to store raw pressure value.
    * @param temperature Pointer to store raw temperature value.
    */

 /**
    * @brief Writes a value to a sensor register.
    * @param reg Register address.
    * @param data Data byte to write.
    */

 /**
    * @brief Reads multiple bytes from sensor registers.
    * @param reg Starting register address.
    * @param buf Buffer to store read data.
    * @param len Number of bytes to read.
    */

 /**
    * @brief Reads sensor compensation parameters from the device.
    */

 /**
    * @brief Compensates the raw temperature value.
    * @param adc_T Raw temperature ADC value.
    * @return Compensated temperature value.
    */

 /**
    * @brief Compensates the raw pressure value.
    * @param adc_P Raw pressure ADC value.
    * @return Compensated pressure value.
    */

 /**
    * @brief Compensates the raw humidity value.
    * @param adc_H Raw humidity ADC value.
    * @return Compensated humidity value.
    */
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