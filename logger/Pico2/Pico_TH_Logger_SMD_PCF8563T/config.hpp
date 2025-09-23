/**
 * @file config.hpp
 * @brief Persistent configuration model and API for the Pico TH Logger (PCF8563T).
 *
 * Provides a typed configuration blob, integrity checking, and helper
 * functions to initialize, load, modify, and persist settings in non-volatile
 * storage. A CRC-32 guards data integrity; a magic and version support
 * schema evolution.
 */

/**
 * @struct Config
 * @brief Persistent configuration blob stored in non-volatile memory.
 *
 * Layout is versioned and guarded by a CRC-32. All boolean-like fields are
 * encoded as uint8_t (0 = disabled, 1 = enabled) unless stated otherwise.
 *
 * Members:
 *  - magic: Magic constant to identify a valid stored blob.
 *  - version: Schema version of this Config layout.
 *  - reserved: Reserved for future use/alignment; write 0.
 *  - logger_id: Unique device/logger identifier (assigned by backend or provisioning).
 *  - sensor_id: Identifier for the primary sensor module.
 *  - server_ip[64]: Server address (IPv4/IPv6 literal or hostname) as a null-terminated string.
 *  - server_port: Network port number of the server.
 *  - temperature: Enable publishing temperature channel (0/1).
 *  - humidity: Enable publishing humidity channel (0/1).
 *  - pressure: Enable publishing pressure channel (0/1).
 *  - sht: SHT sensor family selector (0 = none, 30 = SHT30, 40 = SHT40).
 *  - clock_enabled: Enable external RTC (PCF8563T) usage (0/1).
 *  - set_time_enabled: Allow system time to be set/synchronized (0/1).
 *  - wifi_enabled: Enable Wi‑Fi subsystem and connectivity (0/1).
 *  - wifi_ssid[33]: Wi‑Fi SSID (max 32 chars + terminator).
 *  - wifi_password[65]: Wi‑Fi passphrase (max 64 chars + terminator).
 *  - post_time_ms: Telemetry/reporting interval in milliseconds.
 *  - crc32: CRC-32 of the structure (excluding this field) for integrity.
 *
 * Notes:
 *  - All strings must be null-terminated; unused tail bytes should be zeroed.
 *  - When modifying fields via config_mut(), call config_save() to persist
 *    changes and refresh crc32.
 */

/**
 * @brief Initialize the configuration subsystem.
 *
 * Attempts to load a valid configuration from non-volatile memory. If loading
 * fails (bad magic/version/CRC), default values are applied and persisted.
 * Updates the last source indicator accordingly.
 */
 
/**
 * @brief Load the configuration from non-volatile memory.
 * @return true if load and validation (magic/version/CRC) succeed; false otherwise.
 *
 * On success, updates the in-memory Config and last source indicator.
 * On failure, the in-memory Config remains unchanged.
 */
 
/**
 * @brief Persist the current configuration to non-volatile memory.
 * @return true on successful write; false on I/O or validation errors.
 *
 * Recomputes and stores the crc32 before writing.
 */
 
/**
 * @brief Replace the in-memory configuration with safe default values.
 *
 * Does not write to non-volatile memory; call config_save() to persist.
 * Also resets identifiers and credentials to empty/zero unless policy dictates otherwise.
 */
 
/**
 * @brief Obtain a read-only reference to the current configuration.
 * @return Const reference valid until the configuration is mutated.
 */
 
/**
 * @brief Obtain a mutable reference to the current configuration.
 * @return Mutable reference; call config_save() after modifications to persist.
 *
 * Note: Changes are in-memory only until saved.
 */

/**
 * @enum ConfigSource
 * @brief Indicates how the current configuration was obtained.
 *
 * Values:
 *  - Unknown: Source is not recorded.
 *  - Loaded: Successfully loaded from non-volatile memory.
 *  - DefaultsSaved: Defaults were applied and written to non-volatile memory.
 */

/**
 * @brief Report the last source from which the current configuration originated.
 * @return An enum indicating whether it was loaded or defaulted-and-saved.
 */
#pragma once
#ifndef __CONFIG_HPP__
#define __CONFIG_HPP__

#include <stdint.h>


struct Config {
    uint32_t magic;
    uint16_t version;
    uint16_t reserved;

    uint32_t logger_id;
    uint32_t sensor_id;
    char     server_ip[64];
    uint16_t server_port;

    uint8_t  temperature;
    uint8_t  humidity;
    uint8_t  pressure;
    uint8_t  sht;             // 0/30/40
    uint8_t  clock_enabled;
    uint8_t  set_time_enabled;
    uint8_t  wifi_enabled;

    // Wi-Fi
    char     wifi_ssid[33];
    char     wifi_password[65];
    uint32_t post_time_ms;
    uint32_t crc32;
};

void        config_init();
bool        config_load();
bool        config_save();
void        config_set_defaults();

const Config& config_get();
Config&       config_mut();

enum class ConfigSource : uint8_t {
    Unknown       = 0,
    Loaded        = 1,
    DefaultsSaved = 2,
};
ConfigSource  config_last_source();

#endif /* __CONFIG_HPP__ */