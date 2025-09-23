/**
 * @file main.hpp
 * @brief Central build-time configuration for the Pico_TH_Logger_Relay_SMD_PCF8563T firmware.
 *
 * Defines compile-time constants controlling:
 * - Backend/API endpoints:
 *   - TOKEN_PATH: REST endpoint to obtain/refresh a data token.
 *   - DATA_PATH: REST endpoint for periodic telemetry uploads.
 *   - ERROR_PATH: REST endpoint for error reporting.
 * - TCP connectivity:
 *   - SERVER_IP: target host for TCP connections (string).
 *   - SERVER_PORT: target TCP port (integer).
 * - Identification:
 *   - LOGGER_ID: unique logger identifier (integer).
 *   - SENSOR_ID: unique sensor/module identifier (integer).
 * - Equipment feature toggles:
 *   - TEMPERATURE / HUMIDITY / PRESSURE: enable/disable measurements (1=enabled, 0=disabled).
 *   - SHT: sensor family selector (allowed: 0=BME280, 30=SHT30, 40=SHT40).
 *   - CLOCK: enable external RTC integration (1=enable).
 *   - SET_TIME: set system time from RTC/network at startup (1=enable).
 * - Wi‑Fi:
 *   - WIFI_ENABLE: enable Wi‑Fi stack (1=enable).
 *   - WIFI_SSID / WIFI_PASSWORD: Wi‑Fi credentials (use secrets management in production).
 * - Telemetry scheduling:
 *   - POST_TIME: interval between data posts in milliseconds (minimum effective runtime value: 1000 ms).
 *
 * Usage notes:
 * - These are preprocessor macros; changes require recompilation.
 * - Ensure LOGGER_ID and SENSOR_ID match backend records for proper attribution.
 * - When selecting SHT!=0, include the appropriate SHT3x/SHT4x drivers and disable BME280 in your build; when SHT==0, include BME280 support.
 * - POST_TIME trades off network load vs. data latency; enforce a lower bound of 1000 ms at runtime.
 * - Consider environment-specific overrides (e.g., separate header per deployment or generated config) to avoid hardcoding sensitive data.
 *
 * Security considerations:
 * - Do not commit real WIFI_SSID/WIFI_PASSWORD to version control; inject via CI/CD or local, untracked headers.
 * - Validate API endpoints and handle failures to avoid tight retry loops when posting to DATA_PATH/ERROR_PATH.
 */
#ifndef __MAIN_HPP__
#define __MAIN_HPP__

// === Backend/API ===
#define TOKEN_PATH      "/api/data/data-token"
#define DATA_PATH       "/api/data/data-log"
#define ERROR_PATH      "/api/common/error-log"

// === TCP ===
#define SERVER_IP       "192.168.18.127"
#define SERVER_PORT     3000

// === Logger and Sensor IDs ===
#define LOGGER_ID       3
#define SENSOR_ID       5

// === Equipment ===
#define TEMPERATURE     1
#define HUMIDITY        1
#define PRESSURE        1
#define SHT             0     // 0 - BME280 / 30 - SHT30 / 40 - SHT40
#define CLOCK           1
#define SET_TIME        1

// === Wi-Fi ===
#define WIFI_ENABLE     1
#define WIFI_SSID       "TP-Link_0A7B"
#define WIFI_PASSWORD   "12345678"

// === Telemetry ===
#define POST_TIME       600000  // ms (min. 1000 in runtime)

#endif /* __MAIN_HPP__ */