#include "config.hpp"
#include "main.hpp"

#include <cstdint>
#include <cstring>
#include <cstddef>

#include "hardware/flash.h"
#include "hardware/sync.h"
#include "hardware/regs/addressmap.h"

#ifndef PICO_FLASH_SIZE_BYTES
#define PICO_FLASH_SIZE_BYTES (2u * 1024u * 1024u)
#endif

static_assert(sizeof(Config) <= FLASH_PAGE_SIZE,
              "Config size must fit into a single flash page");

static constexpr uint32_t CONFIG_MAGIC = 0x434F4E46u;
static constexpr uint16_t CONFIG_VERSION = 3;
static Config g_config{};
static ConfigSource g_last_source = ConfigSource::Unknown;

/**
 * @brief Update a CRC-32 checksum with a block of bytes.
 *
 * Computes CRC-32 using the reflected polynomial 0xEDB88320 (IEEE 802.3/ZIP),
 * with initial and final XOR of 0xFFFFFFFF (CRC-32/ISO-HDLC). The return value
 * can be fed back into the next call to continue computing the CRC over
 * subsequent data chunks (incremental/streaming use).
 *
 * @param crc  Previous CRC value, or 0 to start a new computation. For
 *             incremental updates, pass the return value from the prior call.
 * @param data Pointer to the input buffer; may be nullptr if len == 0.
 * @param len  Number of bytes to process from data.
 * @return The updated CRC-32 value after processing the given bytes.
 *
 * @note This is a bitwise (LSB-first) implementation; for large buffers,
 *       a table-driven or hardware-accelerated variant may be faster.
 */
static uint32_t crc32_update(uint32_t crc, const uint8_t* data, size_t len) {
    crc = crc ^ 0xFFFFFFFFu;
    for (size_t i = 0; i < len; ++i) {
        crc ^= data[i];
        for (int k = 0; k < 8; ++k) {
            uint32_t mask = -(crc & 1u);
            crc = (crc >> 1) ^ (0xEDB88320u & mask);
        }
    }
    return crc ^ 0xFFFFFFFFu;
}

/**
 * Computes a CRC-32 over the raw byte representation of a Config instance.
 *
 * Coverage:
 * - Includes all bytes from the start of the 'version' field up to (but not including)
 *   the 'crc32' field, ensuring the checksum does not depend on the stored CRC itself.
 *
 * Assumptions/requirements:
 * - Config is standard-layout and trivially copyable, with 'version' located before 'crc32'.
 * - Any padding between fields is included in the CRC and will affect the result.
 * - The CRC is seeded with 0 and calculated using crc32_update(), whose parameters define
 *   the exact CRC-32 variant.
 *
 * Portability notes:
 * - The result reflects the native in-memory layout and endianness; it may vary across
 *   platforms/compilers or with different packing/alignment options or field reordering.
 *
 * @param cfg  The configuration instance to checksum.
 * @return     The CRC-32 of the specified byte range.
 */
static uint32_t calc_crc32(const Config& cfg) {
    const uint8_t* base = reinterpret_cast<const uint8_t*>(&cfg);
    const size_t start = offsetof(Config, version);
    const size_t end = offsetof(Config, crc32);
    return crc32_update(0, base + start, end - start);
}

/**
 * @brief Returns the start offset of the last flash sector.
 *
 * Computes the byte offset, from the beginning of XIP flash, to the start of
 * the final erase sector. This is useful for storing small configuration or
 * runtime data at the end of flash.
 *
 * The returned offset is suitable for use with Pico SDK flash APIs such as
 * flash_range_erase() and flash_range_program(), which expect offsets relative
 * to the start of flash.
 *
 * @return Byte offset of the last flash sector (PICO_FLASH_SIZE_BYTES - FLASH_SECTOR_SIZE).
 *
 * @warning Ensure the last sector is reserved and does not overlap with the
 *          application image or any filesystem. Erasing/programming flash
 *          while executing from XIP requires proper precautions (e.g., disabling
 *          interrupts) per SDK guidance.
 * @note Sector size is platform-dependent (commonly 4096 bytes on RP2040).
 */
static uint32_t get_storage_offset() {
    return PICO_FLASH_SIZE_BYTES - FLASH_SECTOR_SIZE;
}

/**
 * @brief Initializes the global configuration with compile-time default values.
 *
 * Overwrites the entire g_config structure with defaults derived from build-time
 * constants, clears fixed-size string buffers, copies string defaults with safe
 * null-termination, and computes a CRC-32 for integrity.
 *
 * Details:
 * - Zero-initializes g_config.
 * - Sets identification fields (magic, version, logger_id, sensor_id) and reserved = 0.
 * - Clears and sets server_ip and server_port.
 * - Sets sensor flags/options (temperature, humidity, pressure, sht).
 * - Sets feature flags (clock_enabled, set_time_enabled, wifi_enabled).
 * - Clears and sets Wi‑Fi credentials (wifi_ssid, wifi_password).
 * - Sets post_time_ms interval.
 * - Computes and stores crc32 via calc_crc32(g_config) after all fields are assigned.
 *
 * Preconditions:
 * - g_config is a valid, writable global configuration instance.
 * - SERVER_IP, WIFI_SSID, WIFI_PASSWORD, and other constants are defined and valid.
 *
 * Postconditions:
 * - g_config contains consistent default values and a matching crc32.
 * - Any previous configuration data is discarded.
 *
 * Notes:
 * - Fixed-size string buffers are zeroed first and populated with std::strncpy using
 *   size-1 to preserve space for the terminating null; longer inputs are truncated.
 * - If any field in g_config is modified after this call, crc32 must be recomputed.
 *
 * Thread-safety:
 * - Not thread-safe due to use of a global; serialize access if used concurrently.
 */
void config_set_defaults() {
    std::memset(&g_config, 0, sizeof(g_config));

    g_config.magic = CONFIG_MAGIC;
    g_config.version = CONFIG_VERSION;
    g_config.reserved = 0;

    g_config.logger_id = LOGGER_ID;
    g_config.sensor_id = SENSOR_ID;
    std::memset(g_config.server_ip, 0, sizeof(g_config.server_ip));
    std::strncpy(g_config.server_ip, SERVER_IP, sizeof(g_config.server_ip) - 1);
    g_config.server_port = SERVER_PORT;

    g_config.temperature = TEMPERATURE;
    g_config.humidity = HUMIDITY;
    g_config.pressure = PRESSURE;
    g_config.sht = SHT;
    g_config.clock_enabled = CLOCK;
    g_config.set_time_enabled = SET_TIME;
    g_config.wifi_enabled = WIFI_ENABLE;

    std::memset(g_config.wifi_ssid, 0, sizeof(g_config.wifi_ssid));
    std::memset(g_config.wifi_password, 0, sizeof(g_config.wifi_password));
    std::strncpy(g_config.wifi_ssid, WIFI_SSID, sizeof(g_config.wifi_ssid) - 1);
    std::strncpy(g_config.wifi_password, WIFI_PASSWORD, sizeof(g_config.wifi_password) - 1);

    g_config.post_time_ms = POST_TIME;

    g_config.crc32 = calc_crc32(g_config);
}

/**
 * Loads the persisted configuration from flash into the in-memory global configuration.
 *
 * The function reads a Config blob from non-volatile storage at the offset returned by
 * get_storage_offset(), then validates it using:
 * - Magic number (CONFIG_MAGIC)
 * - Version (CONFIG_VERSION)
 * - CRC-32 computed by calc_crc32
 *
 * On successful validation, it replaces the global configuration (g_config) with the stored
 * values and sets the source marker (g_last_source) to ConfigSource::Loaded. On any validation
 * failure (missing/invalid magic, version mismatch, or CRC mismatch), it leaves globals
 * unchanged and reports failure.
 *
 * @return true if a valid configuration was found and loaded; false otherwise.
 *
 * @post On success, g_config reflects the stored configuration and g_last_source is
 *       ConfigSource::Loaded. On failure, both remain unchanged.
 *
 * @note Reads from XIP flash at address XIP_BASE + get_storage_offset(). Performs no heap allocation.
 * @warning Not thread-safe; callers must ensure exclusive access to g_config and g_last_source.
 * @pre The on-flash binary layout of Config must match the current build (endianness/packing).
 * @complexity O(sizeof(Config)) time, O(1) additional space.
 */
bool config_load() {
    const uint32_t offset = get_storage_offset();
    const uint8_t* flash_ptr = reinterpret_cast<const uint8_t*>(XIP_BASE + offset);

    Config stored{};
    std::memcpy(&stored, flash_ptr, sizeof(Config));

    if (stored.magic != CONFIG_MAGIC) {
        return false;
    }
    if (stored.version != CONFIG_VERSION) {
        return false;
    }

    const uint32_t crc = calc_crc32(stored);
    if (crc != stored.crc32) {
        return false;
    }

    g_config = stored;
    g_last_source = ConfigSource::Loaded;
    return true;
}

/**
 * Saves the global configuration structure to onboard flash memory.
 *
 * This routine:
 * - Updates g_config header fields (magic = CONFIG_MAGIC, version = CONFIG_VERSION, crc32 = calc_crc32(g_config)).
 * - Computes the storage address via get_storage_offset().
 * - Disables interrupts, erases one flash sector at the target offset, programs one flash page with the Config blob, then restores interrupts.
 * - Reads the data back from XIP and verifies the write by comparing the magic, version, and crc32 fields.
 *
 * Return:
 * - true if verification succeeds; false otherwise.
 *
 * Preconditions:
 * - sizeof(Config) <= FLASH_PAGE_SIZE and within the erased sector bounds.
 * - get_storage_offset() returns an offset aligned and valid for sector erase/page program.
 * - No other critical data shares the same flash sector, as the entire sector is erased.
 *
 * Postconditions:
 * - On success, the updated configuration is persisted to flash.
 * - On failure, flash contents in the affected sector may be partially programmed/erased.
 *
 * Side effects:
 * - Modifies g_config (header fields).
 * - Disables and restores interrupts around the erase/program sequence.
 * - Erases an entire flash sector at the target offset.
 *
 * Notes:
 * - The verification step compares persisted header fields; it does not recompute CRC from the data read back.
 * - Flash erase/program operations stall XIP; avoid calling in time-critical paths.
 *
 * Thread-safety:
 * - Not re-entrant and requires exclusive flash access. Ensure no concurrent flash operations (including from other cores/ISRs).
 */
bool config_save() {
    g_config.magic = CONFIG_MAGIC;
    g_config.version = CONFIG_VERSION;
    g_config.crc32 = calc_crc32(g_config);

    const uint32_t offset = get_storage_offset();

    uint32_t ints = save_and_disable_interrupts();
    flash_range_erase(offset, FLASH_SECTOR_SIZE);
    alignas(FLASH_PAGE_SIZE) uint8_t page_buffer[FLASH_PAGE_SIZE]{};
    std::memset(page_buffer, 0xFF, sizeof(page_buffer));
    std::memcpy(page_buffer, &g_config, sizeof(Config));
    flash_range_program(offset, page_buffer, FLASH_PAGE_SIZE);
    restore_interrupts(ints);

    Config verify{};
    const uint8_t* flash_ptr = reinterpret_cast<const uint8_t*>(XIP_BASE + offset);
    std::memcpy(&verify, flash_ptr, sizeof(Config));
    return (verify.magic == g_config.magic) && (verify.version == g_config.version) && (verify.crc32 == g_config.crc32);
}

/**
 * Initializes the configuration subsystem.
 *
 * Attempts to load persisted settings via config_load(). If loading fails,
 * default settings are applied with config_set_defaults(), a best-effort save
 * is attempted with config_save() (its result is intentionally ignored), and
 * g_last_source is set to ConfigSource::DefaultsSaved to indicate that defaults
 * were applied and persisted due to a load failure.
 *
 * Side effects:
 * - May modify global configuration state.
 * - May write default configuration to persistent storage.
 * - Updates g_last_source when defaults are saved.
 *
 * Usage:
 * - Call once during startup to ensure configuration is ready before use.
 *
 * @see config_load()
 * @see config_set_defaults()
 * @see config_save()
 * @see ConfigSource
 */
void config_init() {
    if (!config_load()) {
        config_set_defaults();
        (void)config_save();
        g_last_source = ConfigSource::DefaultsSaved;
    }
}

const Config& config_get() { return g_config; }
Config&      config_mut() { return g_config; }
ConfigSource config_last_source() { return g_last_source; }