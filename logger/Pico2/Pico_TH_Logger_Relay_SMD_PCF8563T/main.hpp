#ifndef __MAIN_HPP__
#define __MAIN_HPP__

// Main settings:
#define LOGGER_ID   1
#define SENSOR_ID   4
#define TOKEN_PATH   "/api/data/data-token"
#define DATA_PATH    "/api/data/data-log"
#define ERROR_PATH   "/api/common/error-log"
#define SERVER_IP "192.168.18.6"
#define SERVER_PORT 3000

// Equipment settings:
#define TEMPERATURE 1
#define HUMIDITY    1
#define PRESSURE    1
#define SHT         0 // 0 - BME280 / 30 - SHT30 / 40 - SHT40
#define CLOCK       1
#define SET         1

#endif /* __MAIN_HPP__ */