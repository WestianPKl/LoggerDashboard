#include "bme280.hpp"

/**
 * @brief Constructs a BME280 sensor object and initializes its configuration.
 *
 * This constructor initializes the BME280 sensor with the specified operating mode.
 * It reads the sensor's chip ID and compensation parameters, sets up the measurement
 * registers for pressure and temperature oversampling, and configures the sensor's
 * control registers for measurement and filtering.
 *
 * @param mode The operating mode for the sensor (default is MODE_NORMAL).
 */
BME280::BME280(MODE mode = MODE::MODE_NORMAL) {
    measurement_reg.mode    = mode;
    read_registers(0xD0, &chip_id, 1);
    read_compensation_parameters();
    measurement_reg.osrs_p = 0b011;
    measurement_reg.osrs_t = 0b011;
    write_register(0xF4, MODE::MODE_SLEEP);
    write_register(0xF2, 0x1);
    write_register(0xF4, measurement_reg.get());
};


/**
 * @brief Performs a measurement using the BME280 sensor and returns the results.
 *
 * This function triggers a measurement (in forced mode if configured), waits for the measurement
 * to complete, reads the raw sensor data, applies compensation algorithms, and calculates
 * the final values for pressure (hPa), humidity (%RH), temperature (°C), and altitude (meters).
 *
 * @return BME280::Measurement_t Struct containing the compensated pressure, humidity, temperature,
 *         and calculated altitude.
 */
BME280::Measurement_t BME280::measure() {
    int32_t pressure, humidity, temperature;
    if (measurement_reg.mode == MODE::MODE_FORCED) {
        write_register(0xf4, measurement_reg.get());
        uint8_t buffer;
        absolute_time_t deadline = make_timeout_time_ms(200);
        do {
            read_registers(0xf3, &buffer, 1);
            sleep_ms(1);
            if (time_reached(deadline)) break;
        } while (buffer & 0x08);
    }
    bme280_read_raw(&humidity,
                    &pressure,
                    &temperature);
    pressure = compensate_pressure(pressure);
    humidity = compensate_humidity(humidity);
    temperature = compensate_temp(temperature);
    measurement.pressure = pressure / 100.0;
    measurement.humidity = humidity / 1024.0;
    measurement.temperature = temperature / 100.0;
    float pressure0 = 1013.25;
    float tmp = pow(measurement.pressure / pressure0, 1.0 / 5.255);
    measurement.altitude = (measurement.temperature + 273.15) * (1 - tmp) / (tmp * 0.0065);
    return measurement;
}

/**
 * @brief Retrieves the chip ID of the BME280 sensor.
 *
 * This function returns the unique chip identification number
 * for the BME280 sensor, which can be used to verify the sensor's
 * presence and identity on the I2C or SPI bus.
 *
 * @return uint8_t The chip ID of the BME280 sensor.
 */
uint8_t BME280::get_chipID() {
    return chip_id;
}

/**
 * @brief Compensates the raw temperature reading from the BME280 sensor.
 *
 * This function applies the temperature compensation algorithm as described in the BME280 datasheet.
 * It uses the calibration parameters (dig_T1, dig_T2, dig_T3) to convert the raw ADC temperature value
 * (adc_T) into a compensated temperature value in hundredths of a degree Celsius.
 *
 * @param adc_T Raw temperature value from the BME280 sensor's ADC.
 * @return int32_t Compensated temperature in hundredths of a degree Celsius (°C * 100).
 */
int32_t BME280::compensate_temp(int32_t adc_T) {
    int32_t var1, var2, T;
    var1 = ((((adc_T >> 3) - ((int32_t) dig_T1 << 1))) * ((int32_t) dig_T2)) >> 11;
    var2 = (((((adc_T >> 4) - ((int32_t) dig_T1)) * ((adc_T >> 4) - ((int32_t) dig_T1))) >> 12) * ((int32_t) dig_T3))
            >> 14;
    t_fine = var1 + var2;
    T = (t_fine * 5 + 128) >> 8;
    return T;
}

/**
 * @brief Compensates the raw pressure value from the BME280 sensor.
 *
 * This function applies the Bosch-recommended compensation algorithm to the raw
 * pressure ADC value (`adc_P`) using the sensor's calibration data. The compensation
 * uses several device-specific calibration parameters (`dig_P1` to `dig_P9`) and the
 * fine temperature value (`t_fine`) calculated during temperature compensation.
 *
 * @param adc_P Raw pressure value read from the BME280 sensor's ADC.
 * @return uint32_t Compensated pressure value in Pascals (Pa).
 *
 * @note Returns 0 if the compensation calculation would result in a division by zero.
 * @note The function assumes that all calibration parameters and `t_fine` have been
 *       properly initialized before calling this function.
 */
uint32_t BME280::compensate_pressure(int32_t adc_P) {
    int64_t var1, var2, p;

    var1 = ((int64_t)t_fine) - 128000;
    var2 = var1 * var1 * (int64_t)dig_P6;
    var2 = var2 + ((var1 * (int64_t)dig_P5) << 17);
    var2 = var2 + (((int64_t)dig_P4) << 35);
    var1 = ((var1 * var1 * (int64_t)dig_P3) >> 8) + ((var1 * (int64_t)dig_P2) << 12);
    var1 = (((((int64_t)1) << 47) + var1) * (int64_t)dig_P1) >> 33;

    if (var1 == 0) {
        return 0;
    }
    p = 1048576 - adc_P;
    p = (((((int64_t)p << 31) - var2) * 3125) / var1);

    var1 = (((int64_t)dig_P9) * (p >> 13) * (p >> 13)) >> 25;
    var2 = (((int64_t)dig_P8) * p) >> 19;

    p = (((p + var1 + var2) >> 8) + (((int64_t)dig_P7) << 4));
    return (uint32_t)(p >> 8);
}

/**
 * @brief Compensates the raw humidity value from the BME280 sensor.
 *
 * This function applies the Bosch-recommended compensation algorithm to the raw
 * humidity ADC value (`adc_H`) using the sensor's calibration parameters. The
 * compensation improves the accuracy of the humidity measurement by correcting
 * for sensor-specific deviations and temperature effects.
 *
 * @param adc_H The raw humidity value read from the BME280 sensor's ADC.
 * @return The compensated relative humidity value as an unsigned 32-bit integer,
 *         typically in units of 0.001 %RH (i.e., value of 42345 represents 42.345 %RH).
 */
uint32_t BME280::compensate_humidity(int32_t adc_H) {
    int32_t v_x1_u32r;
    v_x1_u32r = (t_fine - ((int32_t) 76800));
    v_x1_u32r = (((((adc_H << 14) - (((int32_t) dig_H4) << 20) - (((int32_t) dig_H5) * v_x1_u32r)) +
                   ((int32_t) 16384)) >> 15) * (((((((v_x1_u32r * ((int32_t) dig_H6)) >> 10) * (((v_x1_u32r *
                                                                                                  ((int32_t) dig_H3))
            >> 11) + ((int32_t) 32768))) >> 10) + ((int32_t) 2097152)) *
                                                 ((int32_t) dig_H2) + 8192) >> 14));
    v_x1_u32r = (v_x1_u32r - (((((v_x1_u32r >> 15) * (v_x1_u32r >> 15)) >> 7) * ((int32_t) dig_H1)) >> 4));
    v_x1_u32r = (v_x1_u32r < 0 ? 0 : v_x1_u32r);
    v_x1_u32r = (v_x1_u32r > 419430400 ? 419430400 : v_x1_u32r);
    return (uint32_t) (v_x1_u32r >> 12);
}

/**
 * @brief Writes a single byte of data to a specified register of the BME280 sensor over I2C.
 *
 * This function sends the register address and the data byte to the sensor using the I2C protocol.
 * After writing, it waits for 2 milliseconds to ensure the write operation completes.
 *
 * @param reg  The register address to write to.
 * @param data The data byte to write into the register.
 */
void BME280::write_register(uint8_t reg, uint8_t data) {
    uint8_t buf[2] = { reg, data };
    i2c_write_blocking(i2c_default, addr, buf, 2, false);
    sleep_ms(2);
}

/**
 * @brief Reads multiple registers from the BME280 sensor over I2C.
 *
 * This function writes the starting register address to the sensor,
 * then reads a specified number of bytes into the provided buffer.
 * Small delays are included to ensure proper timing for I2C operations.
 *
 * @param reg The starting register address to read from.
 * @param buf Pointer to the buffer where the read data will be stored.
 * @param len Number of bytes to read from the sensor.
 */
void BME280::read_registers(uint8_t reg, uint8_t *buf, uint16_t len) {
    i2c_write_blocking(i2c_default, addr, &reg, 1, true);
    sleep_ms(2);
    i2c_read_blocking(i2c_default, addr, buf, len, false);
    sleep_ms(2);
}


/**
 * @brief Reads the BME280 sensor's compensation parameters from its registers.
 *
 * This function retrieves the temperature, pressure, and humidity compensation
 * parameters from the BME280 sensor by reading the appropriate registers. These
 * parameters are required for accurate environmental measurements and are stored
 * in the sensor's non-volatile memory during manufacturing.
 *
 * The function reads the temperature and pressure calibration data from register
 * 0x88 (26 bytes), and the humidity calibration data from register 0xE1 (8 bytes).
 * The retrieved values are stored in the corresponding member variables:
 *   - dig_T1, dig_T2, dig_T3: Temperature compensation parameters
 *   - dig_P1 to dig_P9: Pressure compensation parameters
 *   - dig_H1 to dig_H6: Humidity compensation parameters
 *
 * @note This function should be called during sensor initialization before
 *       performing any measurements.
 */
void BME280::read_compensation_parameters() {
    read_registers(0x88, buffer, 26);
    dig_T1 = (uint16_t)(buffer[0] | (buffer[1] << 8));
    dig_T2 = (int16_t)(buffer[2] | (buffer[3] << 8));
    dig_T3 = (int16_t)(buffer[4] | (buffer[5] << 8));
    dig_P1 = (uint16_t)(buffer[6] | (buffer[7] << 8));
    dig_P2 = (int16_t)(buffer[8] | (buffer[9] << 8));
    dig_P3 = (int16_t)(buffer[10] | (buffer[11] << 8));
    dig_P4 = (int16_t)(buffer[12] | (buffer[13] << 8));
    dig_P5 = (int16_t)(buffer[14] | (buffer[15] << 8));
    dig_P6 = (int16_t)(buffer[16] | (buffer[17] << 8));
    dig_P7 = (int16_t)(buffer[18] | (buffer[19] << 8));
    dig_P8 = (int16_t)(buffer[20] | (buffer[21] << 8));
    dig_P9 = (int16_t)(buffer[22] | (buffer[23] << 8));
    dig_H1 = (uint8_t)buffer[25];
    read_registers(0xE1, buffer, 7);
    dig_H2 = (int16_t)(buffer[0] | (buffer[1] << 8));
    dig_H3 = (uint8_t)buffer[2];
    dig_H4 = (int16_t)((buffer[3] << 4) | (buffer[4] & 0x0F));
    dig_H5 = (int16_t)((buffer[5] << 4) | (buffer[4] >> 4));
    dig_H6 = (int8_t)buffer[6];
}

/**
 * @brief Reads raw humidity, pressure, and temperature data from the BME280 sensor.
 *
 * This function reads 8 bytes of raw data from the BME280 sensor's registers starting at 0xF7.
 * It extracts the uncompensated pressure, temperature, and humidity values and stores them
 * in the provided pointers. The values are not compensated and require further processing
 * using the sensor's calibration data for accurate measurements.
 *
 * @param[out] humidity    Pointer to store the raw humidity value (20 bits, right-aligned).
 * @param[out] pressure    Pointer to store the raw pressure value (20 bits, right-aligned).
 * @param[out] temperature Pointer to store the raw temperature value (20 bits, right-aligned).
 */
void BME280::bme280_read_raw(int32_t *humidity, int32_t *pressure, int32_t *temperature) {
    uint8_t readBuffer[8];
    read_registers(0xF7, readBuffer, 8);
    *pressure = ((uint32_t) readBuffer[0] << 12) | ((uint32_t) readBuffer[1] << 4) | (readBuffer[2] >> 4);
    *temperature = ((uint32_t) readBuffer[3] << 12) | ((uint32_t) readBuffer[4] << 4) | (readBuffer[5] >> 4);
    *humidity = (uint32_t) readBuffer[6] << 8 | readBuffer[7];
}
