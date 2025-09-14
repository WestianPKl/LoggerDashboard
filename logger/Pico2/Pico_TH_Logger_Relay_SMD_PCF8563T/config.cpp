#include "config.hpp"
#include "main.hpp"

#include <cstdint>
#include <cstring>

#include "hardware/flash.h"
#include "hardware/sync.h"
#include "hardware/regs/addressmap.h"

#ifndef PICO_FLASH_SIZE_BYTES
#define PICO_FLASH_SIZE_BYTES (2u * 1024u * 1024u)
#endif

static constexpr uint32_t CONFIG_MAGIC = 0x434F4E46u;
static constexpr uint16_t CONFIG_VERSION = 3;
static Config g_config{};
static ConfigSource g_last_source = ConfigSource::Unknown;

/**
 * @brief Incrementally computes a CRC-32 checksum over a byte buffer.
 *
 * Implements the reflected CRC-32 algorithm with polynomial 0xEDB88320,
 * initial value 0xFFFFFFFF, and final XOR 0xFFFFFFFF (also known as
 * CRC-32/ISO-HDLC or CRC-32/PKZIP).
 *
 * This function supports streaming updates: pass 0 to start a new checksum,
 * then pass the previously returned value to continue over additional data.
 *
 * @param crc  Current CRC state, or 0 to start a new computation.
 * @param data Pointer to the input bytes (may be nullptr if len == 0).
 * @param len  Number of bytes to process from data.
 * @return The updated CRC-32 checksum.
 *
 * @note Time complexity is O(len). The function is stateless and reentrant.
 *
 * @code
 * uint32_t crc = 0;                          // start
 * crc = crc32_update(crc, buf1, len1);       // first chunk
 * crc = crc32_update(crc, buf2, len2);       // next chunk
 * @endcode
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
 * @brief Compute the CRC-32 of a Config instance over a specific byte range.
 *
 * Calculates the checksum over the raw bytes of cfg starting at the member
 * Config::version (inclusive) and ending just before Config::crc32 (exclusive).
 * This omits any bytes preceding version and the checksum field itself, enabling
 * stable verification of the configuration payload.
 *
 * The CRC is seeded with 0 and computed over the in-memory layout of Config.
 * The returned value is intended to be stored in or compared against Config::crc32.
 *
 * @param cfg The configuration object whose payload is checksummed.
 * @return The 32-bit CRC of the covered range.
 *
 * @note Config must be a standard-layout, trivially copyable type so its byte
 *       representation is well-defined for this operation.
 * @warning Reordering fields, changing packing/alignment, or compiling across
 *          platforms/toolchains that alter padding may change the computed CRC.
 */
static uint32_t calc_crc32(const Config& cfg) {
	const uint8_t* base = reinterpret_cast<const uint8_t*>(&cfg);
	const size_t start = offsetof(Config, version);
	const size_t end = offsetof(Config, crc32);
	return crc32_update(0, base + start, end - start);
}

/**
 * @brief Computes the byte offset to the start of the last flash sector.
 *
 * Calculates the start address (offset from the base of on-board flash) of the
 * final erase sector by subtracting the sector size from the total flash size.
 * Useful for placing configuration or log data at the end of flash, away from
 * the main application image.
 *
 * @return Byte offset to the beginning of the last flash sector.
 *
 * @note Assumes PICO_FLASH_SIZE_BYTES and FLASH_SECTOR_SIZE are defined by the
 *       Pico SDK and that the final sector is reserved for non-volatile storage.
 *       Ensure flash erase/program operations respect sector boundaries and are
 *       performed safely according to SDK requirements.
 */
static uint32_t get_storage_offset() {
	return PICO_FLASH_SIZE_BYTES - FLASH_SECTOR_SIZE;
}

/**
 * @brief Initialize the global configuration structure with compile-time defaults.
 *
 * This function:
 * - Clears the entire configuration structure to zero.
 * - Sets magic, version, and identifiers from compile-time constants.
 * - Populates network settings (server IP/port) and feature/sensor enable flags.
 * - Copies Wi-Fi SSID and password into fixed-size buffers as null-terminated strings.
 * - Computes and stores the CRC32 over the populated structure for integrity checking.
 *
 * Notes:
 * - Overwrites any existing contents of the global configuration.
 * - String sources longer than their destination buffers are safely truncated; buffers are
 *   pre-zeroed to guarantee null termination.
 * - After any manual modification of the configuration, the CRC must be recomputed.
 *
 * Thread-safety:
 * - Not thread-safe. Call during startup or guard with external synchronization.
 *
 * Preconditions:
 * - Required compile-time constants and the calc_crc32 function are available.
 *
 * Postconditions:
 * - The global configuration is fully initialized and self-consistent; crc32 matches contents.
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

	// POST interval default
	g_config.post_time_ms = POST_TIME;

	g_config.crc32 = calc_crc32(g_config);
}

/**
 * @brief Load persisted configuration from flash into runtime state.
 *
 * Reads a stored Config from non-volatile memory at the computed storage offset,
 * validates its magic number, version, and CRC32 checksum, and, if valid, replaces
 * the current global configuration with the stored one.
 *
 * @return true if a valid configuration was found and applied; false if no valid
 *         configuration is present or validation fails.
 *
 * @post On success, g_config is updated to the stored configuration.
 * @post On failure, g_config remains unchanged.
 *
 * @note Relies on execute-in-place (XIP) flash mapping and a raw memory copy.
 * @warning Validation will fail if magic, version, or CRC32 do not match expected values.
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
 * Persist the global configuration (g_config) to on-board flash and verify the write.
 *
 * Behavior:
 * - Updates g_config header fields (magic, version) and computes/stores its CRC32.
 * - Determines the flash storage location via get_storage_offset().
 * - Disables interrupts, erases one flash sector at the offset, stages a page-sized
 *   buffer initialized to 0xFF with the Config content, programs one flash page,
 *   then restores interrupts.
 * - Reads the just-programmed data back from XIP and verifies magic, version, and CRC.
 *
 * Returns:
 * - true  if the read-back verification matches (write succeeded).
 * - false if verification fails.
 *
 * Side effects:
 * - Modifies g_config.magic, g_config.version, and g_config.crc32.
 * - Erases and reprograms one flash sector/page at the computed offset.
 *
 * Requirements/assumptions:
 * - sizeof(Config) <= FLASH_PAGE_SIZE.
 * - get_storage_offset() returns an address aligned for sector erase and page program.
 * - flash_range_erase/program are safe to call with interrupts disabled in this context.
 *
 * Concurrency/thread-safety:
 * - Not reentrant. Disables interrupts around flash operations but does not coordinate
 *   with other flash users; concurrent flash activity must be externally serialized.
 *
 * Notes:
 * - Verification checks only header fields (magic, version, crc32), not the entire payload.
 * - Each call incurs a sector erase (wear consideration).
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
 * @brief Initialize application configuration.
 *
 * Attempts to load persisted configuration; if loading fails (e.g., first run
 * or corrupted data), applies default settings and saves them.
 *
 * Side effects: May write to non-volatile storage.
 * Thread-safety: Call once at startup before other configuration is accessed.
 * @note The result of saving defaults is intentionally ignored (best effort).
 */
void config_init() {
	if (!config_load()) {
		config_set_defaults();
		(void)config_save();
		g_last_source = ConfigSource::DefaultsSaved;
	}
}

/**
 * Returns a read-only reference to the global configuration instance.
 *
 * This accessor avoids copying by returning a const reference and should be
 * used wherever configuration values are needed.
 *
 * Thread-safety:
 *   The returned reference is only as thread-safe as the underlying
 *   configuration object. If the configuration can be modified concurrently,
 *   synchronize access externally.
 *
 * @return const Config& Immutable reference to the current configuration.
 */
const Config& config_get() {
	return g_config;
}

/**
 * Provides mutable access to the global configuration instance.
 *
 * Use this accessor to read or modify application-wide settings. Changes are
 * applied globally and take effect immediately.
 *
 * Thread-safety: Not thread-safe; synchronize externally if used concurrently
 * or from interrupt context.
 *
 * Lifetime: The returned reference remains valid for the duration of the program.
 *
 * @return Config& Reference to the global configuration instance.
 */
Config& config_mut() {
	return g_config;
}

ConfigSource config_last_source() {
	return g_last_source;
}