#include "sht30.hpp"

#define ADDR 0x44
#define SINGLE_READ 0x2C06
#define SOFT_RESET 0x30A2
#define READ_REGISTER 0xF32D
#define HEATER_ENABLE 0x306D
#define HEATER_DISABLE 0x3066

uint8_t SHT30::read_raw(uint32_t* raw_temp, uint32_t* raw_hum){
    uint8_t buf[6];
    write_register(SINGLE_READ);
    sleep_ms(10);
    i2c_read_blocking(i2c0, ADDR, buf, 6, false);
    sleep_ms(10);
    if(buf[2] != crc8(buf, 2) || buf[5] != crc8(&buf[3], 2)){
        return 1;
    }
    *raw_temp = ((uint32_t)buf[0] << 8) | buf[1];
    *raw_hum = ((uint32_t)buf[3] << 8) | buf[4];
    return 0;
};

void SHT30::write_register(uint16_t cmd){
    uint8_t buf[2];
    buf[0] = (cmd >> 8) & 0xFF;
    buf[1] = cmd & 0xFF;
    i2c_write_blocking(i2c0, ADDR, buf, 2, false);
    sleep_ms(10);
};

uint8_t SHT30::read_register(uint8_t reg){
   uint8_t data;
    i2c_write_blocking(i2c0, ADDR, &reg, 1, true);
    sleep_ms(10);
    i2c_read_blocking(i2c0, ADDR, &data, 1, false);
    sleep_ms(10);
    return data;
};

uint8_t SHT30::crc8(uint8_t* data, int len){
    uint8_t crc = 0xFF;
    for (int j = 0; j< len; j++){
        crc ^= data[j];
        for (int i = 0; i < 8; i++){
            if (crc & 0x80){
                crc = (crc << 1) ^ 0x31;
            }else{
                crc <<= 1;
            }
        }
    }
    return crc;
};

float SHT30::get_temperature(){
    uint32_t raw_temp, raw_hum;
    if(read_raw(&raw_temp, &raw_hum) != 0){
        return NAN;
    }
    return -45 + (175 * ((float)raw_temp / 65535.0f));
};

float SHT30::get_humidity(){
    uint32_t raw_temp, raw_hum;
    if(read_raw(&raw_temp, &raw_hum) != 0){
        return NAN;
    }
    float humidity = 100 * ((float)raw_hum / 65535.0f);
    if(humidity > 100){
        humidity = 100;
    }
    return humidity;
};

SHT30::Measurement_t SHT30::measure(){
    measurement.temperature = get_temperature();
    measurement.humidity = get_humidity();
    return measurement;
}

void SHT30::soft_reset(void){
    write_register(SOFT_RESET);
};

void SHT30::heater_enable_func(int8_t state){
    if(state == 1){
        write_register(HEATER_ENABLE);
    }else{
        write_register(HEATER_DISABLE);
    }
};

uint16_t SHT30::read_status(void){
    uint8_t buf[3];
    write_register(READ_REGISTER);
    sleep_ms(10);
    i2c_read_blocking(i2c0, ADDR, buf, 3, false);
    sleep_ms(10);
    if(buf[2] != crc8(buf, 2)){
        return 0xFFFF;
    }
    return (buf[0] << 8) | buf[1];
};