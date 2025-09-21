
/**
 * @file main.hpp
 * @brief Central compile-time configuration for the Pico TH Logger firmware (PCF8563T variant).
 *
 * Provides device identity, backend API endpoints, server connection details,
 * peripheral feature toggles, Wi‑Fi credentials, and telemetry timing.
 *
 * Identity:
 * - LOGGER_ID: Unique device identifier used by the backend.
 * - SENSOR_ID: Physical sensor assembly identifier associated with readings.
 *
 * Backend/API:
 * - TOKEN_PATH: Relative endpoint to obtain an authorization/session token.
 * - DATA_PATH: Relative endpoint for posting telemetry data.
 * - ERROR_PATH: Relative endpoint for reporting firmware/runtime errors.
 * - SERVER_IP / SERVER_PORT: Backend host and TCP port.
 *
 * Sensors and peripherals:
 * - TEMPERATURE, HUMIDITY, PRESSURE: Feature switches (1 = enabled, 0 = disabled).
 * - SHT: Sensor selector (0 = BME280, 30 = SHT30, 40 = SHT40).
 * - CLOCK: Enables use of the external PCF8563T real-time clock.
 * - SET_TIME: If enabled, synchronize RTC time at startup.
 *
 * Connectivity:
 * - WIFI_ENABLE: Global Wi‑Fi switch (0 = disabled, 1 = enabled).
 * - WIFI_SSID / WIFI_PASSWORD: Network credentials used when Wi‑Fi is enabled.
 *
 * Telemetry:
 * - POST_TIME: Interval between data transmissions, in milliseconds.
 *
 * Notes:
 * - Adjust IDs, endpoints, and server settings per deployment.
 * - Treat Wi‑Fi credentials as secrets; avoid committing real values.
 * - Disabling unused features at compile time reduces footprint and power use.
 */
#ifndef __MAIN_HPP__
#define __MAIN_HPP__

// Main settings:
#define WIFI_SSID       "TP-Link_0A7B"
#define WIFI_PASSWORD   "12345678"
#define LOGGER_ID       3
#define SENSOR_ID       5
#define TOKEN_PATH      "/api/data/data-token"
#define DATA_PATH        "/api/data/data-log"
#define ERROR_PATH      "/api/common/error-log"
#define SERVER_IP       "192.168.18.127"
#define SERVER_PORT     3000

// Equipment settings:
#define TEMPERATURE     1
#define HUMIDITY        1
#define PRESSURE        1
#define SHT             0 // 0 - BME280 / 30 - SHT30 / 40 - SHT40
#define CLOCK           1
#define WIFI_ENABLE     1 // 0 - disabled / 1 - enabled
#define SET_TIME        1
#define POST_TIME       600000

#endif /* __MAIN_HPP__ */