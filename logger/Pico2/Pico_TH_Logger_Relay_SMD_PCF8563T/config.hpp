/**
 * @file config.hpp
 * @brief Persistent configuration model and API for the Pico_TH_Logger device.
 *
 * Defines the binary layout of the persisted configuration (Config) and the API to
 * initialize, load, mutate, and save it. The layout is stored in non-volatile memory
 * (e.g., flash/EEPROM). Keep field order and sizes stable across releases; bump
 * the version when changing the layout.
 *
 * Data integrity:
 * - magic: signature used to detect a valid blob.
 * - version: schema version of this struct.
 * - crc32: integrity check of the configuration block.
 *   Unless specified otherwise, CRC is computed over all bytes of Config except
 *   the crc32 member itself.
 */

/**
 * @struct Config
 * @brief Binary configuration blob persisted in non-volatile memory.
 *
 * Members:
 * - magic: 32-bit magic signature identifying a valid configuration record.
 * - version: 16-bit schema/version number of this structure.
 * - reserved: 16-bit padding/reserved field for future use (initialize to 0).
 *
 * - logger_id: 32-bit logical identifier of the device/logger.
 * - sensor_id: 32-bit logical identifier of the primary sensor assembly.
 *
 * - server_ip[16]: ASCII, NUL-terminated IPv4 address in dotted-decimal form.
 *                  Buffer holds up to "255.255.255.255" plus NUL.
 * - server_port: TCP/UDP port number of the remote server.
 *
 * - temperature: feature flag (0 = disabled, non-zero = enabled) for temperature.
 * - humidity:    feature flag (0 = disabled, non-zero = enabled) for humidity.
 * - pressure:    feature flag (0 = disabled, non-zero = enabled) for pressure.
 * - sht:         SHT sensor family selector; expected values: 0, 30, or 40.
 * - clock_enabled: enable flag for external RTC (e.g., PCF8563T).
 * - set_time_enabled:   general "set/update" enable flag (semantics defined by firmware).
 * - wifi_enabled:  enable flag for Wi‑Fi subsystem.
 *
 * - wifi_ssid[33]: Wi‑Fi SSID, ASCII, NUL-terminated if shorter (max 32 chars).
 * - wifi_password[65]: Wi‑Fi password, ASCII, NUL-terminated if shorter (max 64 chars).
 *
 * - post_time_ms: interval between POSTs/telemetry uploads, in milliseconds.
 *
 * - crc32: CRC-32 checksum for the structure to validate on load.
 *
 * Notes:
 * - Strings that do not fill the buffer must be NUL-terminated by the producer.
 * - Consider zero-initializing the full struct before assignment to avoid stale data.
 * - Update crc32 after any mutation and before persisting.
 */

/**
 * @brief Initialize the configuration subsystem.
 * @details Typically loads the configuration from persistent storage. If the stored
 *          blob is missing, has a mismatched magic/version, or fails CRC validation,
 *          default values are applied and persisted.
 */

/**
 * @brief Load configuration from persistent storage into memory.
 * @return true on success (valid magic/version and CRC), false if loading or
 *         validation fails.
 */

/**
 * @brief Persist the current in-memory configuration to non-volatile storage.
 * @return true on success, false on write/validation failure.
 * @note Implementations should recompute and store crc32 before writing.
 */

/**
 * @brief Reset the in-memory configuration to safe/default values.
 * @details Does not necessarily persist; call config_save() to write defaults.
 *          See implementation for concrete defaults.
 */

/**
 * @brief Get a read-only reference to the current configuration.
 * @return const reference valid for the lifetime of the configuration subsystem.
 * @warning Do not hold the reference across calls that may reinitialize storage.
 */

/**
 * @brief Get a mutable reference to the current configuration.
 * @return reference that can be modified by the caller.
 * @note After modifying the configuration, call config_save() to persist changes.
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
    char     server_ip[16];
    uint16_t server_port;

    uint8_t  temperature;
    uint8_t  humidity;
    uint8_t  pressure;
    uint8_t  sht;         // 0/30/40
    uint8_t  clock_enabled;
    uint8_t  set_time_enabled;
    uint8_t  wifi_enabled;
    // Wi-Fi credentials (ASCII, null-terminated if shorter)
    char     wifi_ssid[33];     // up to 32 bytes + NUL
    char     wifi_password[65]; // up to 64 bytes + NUL

    // POST interval in milliseconds
    uint32_t post_time_ms;

    uint32_t crc32; 
};

void config_init();
bool config_load();
bool config_save();
void config_set_defaults();

const Config& config_get();
Config& config_mut();

// Diagnostics: where the current in-memory config came from at boot
enum class ConfigSource : uint8_t {
    Unknown = 0,
    Loaded = 1,        // loaded from flash (valid magic/version/CRC)
    DefaultsSaved = 2, // load failed; defaults applied and saved
};
ConfigSource config_last_source();

#endif /* __CONFIG_HPP__ */