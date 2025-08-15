/**
 * @file main.hpp
 * @brief Main configuration header for the Pico_TH_Logger_SMD_PCF8563T project.
 *
 * This file contains macro definitions for main settings, server endpoints,
 * and equipment configuration options.
 *
 * Main settings:
 * - LOGGER_ID: Unique identifier for the logger device.
 * - SENSOR_ID: Identifier for the sensor module.
 * - TOKEN_PATH: API endpoint for obtaining data tokens.
 * - DATA_PATH: API endpoint for logging data.
 * - ERROR_PATH: API endpoint for logging errors.
 * - SERVER_IP: IP address of the server.
 * - SERVER_PORT: Port number of the server.
 *
 * Equipment settings:
 * - TEMPERATURE: Enable (1) or disable (0) temperature measurement.
 * - HUMIDITY: Enable (1) or disable (0) humidity measurement.
 * - PRESSURE: Enable (1) or disable (0) pressure measurement.
 * - SHT: Sensor type selection (0 = BME280, 30 = SHT30, 40 = SHT40).
 * - CLOCK: Enable (1) or disable (0) clock functionality.
 * - SET: Enable (1) or disable (0) set functionality.
 */
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