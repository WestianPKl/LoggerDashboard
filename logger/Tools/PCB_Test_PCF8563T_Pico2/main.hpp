#ifndef __MAIN_HPP__
#define __MAIN_HPP__


#define I2C_PORT i2c0
#define I2C_SDA 0
#define I2C_SCL 1

#define RELAY           0     // 0 - No relay, 1 - Relay
#define SHT             1     // 0 - BME280 / 1 - SHT30
#define CLOCK           1
#define SET_TIME        1

bool btn21_prev = true;
bool btn20_prev = true;
bool     btn20_pressed = false;
bool     btn21_pressed = false;

inline uint32_t now_ms() { return to_ms_since_boot(get_absolute_time()); }

#endif /* __MAIN_HPP__ */