/**
 * @file program_main.hpp
 * @brief Main application interface for a Pico-based temperature/humidity logger with Wi-Fi and RTC support.
 *
 * This header declares the ProgramMain class, which orchestrates:
 * - I2C peripherals initialization (e.g., BME280 environmental sensor, PCF8563T RTC).
 * - Wi-Fi/TCP connectivity setup and reconnection logic.
 * - System time synchronization from RTC or network (when available).
 * - PWM handling for an RGB indicator.
 * - Acquisition, display, and transmission of sensor measurements.
 *
 * Dependencies:
 * - bme280.hpp: BME280 sensor driver.
 * - tcp.hpp: TCP client/transport utilities.
 * - time.h: time_t and related C time utilities.
 *
 * Hardware mapping:
 * - I2C port: i2c0
 * - SDA: GPIO 0
 * - SCL: GPIO 1
 *
 * Status codes:
 * - WIFI_OK (0): Wi-Fi initialization/connection succeeded.
 * - WIFI_CONN_FAIL (1): Wi-Fi connection failed after initialization.
 * - WIFI_INIT_FAIL (255): Wi-Fi hardware/stack initialization failed.
 */


/** I2C peripheral used to communicate with the sensor/RTC. Place above the corresponding #define. */
/// I2C port identifier used by the application (RP2040: i2c0).

/** I2C SDA pin. Place above the corresponding #define. */
/// GPIO index for I2C SDA line (default: 0).

/** I2C SCL pin. Place above the corresponding #define. */
/// GPIO index for I2C SCL line (default: 1).

/** Wi-Fi error/success codes. Place above the corresponding #define block. */
/// Wi-Fi initialization failure status code (non-recoverable).
/// Wi-Fi connection failure status code (recoverable; retry may succeed).
/// Wi-Fi success status code.


/**
 * @class ProgramMain
 * @brief High-level controller for sensor I/O, networking, timekeeping, and RGB indication.
 *
 * Responsibilities:
 * - Initialize and manage BME280 sensor over I2C.
 * - Establish and monitor TCP connectivity over Wi-Fi.
 * - Synchronize the system clock from an RTC and/or network sources.
 * - Drive PWM channels to indicate status via an RGB LED.
 * - Collect, display, and publish measurement data.
 *
 * Notes:
 * - This class is not thread-safe; call its methods from a single execution context.
 * - Ensure hardware (I2C pins, Wi-Fi module, RGB LED) is wired/configured as expected.
 */


/** Pointer to the BME280 driver instance (owned by ProgramMain). */
/** Pointer to the TCP transport/client instance (owned by ProgramMain). */
/** Global Wi-Fi enable/disable flag (runtime-configurable). */


/**
 * @brief Convert discrete UTC date/time fields into a time_t epoch value.
 *
 * @param y  Full year (e.g., 2025).
 * @param m  Month in range [1..12].
 * @param d  Day of month in range [1..31].
 * @param hh Hour in range [0..23].
 * @param mm Minute in range [0..59].
 * @param ss Second in range [0..60] (leap second inclusive).
 * @return UTC time as seconds since Unix epoch, or (time_t)-1 on invalid input.
 *
 * @note Intended to translate RTC register fields into a standard epoch value.
 * @warning No timezone or DST adjustments are applied (strict UTC).
 */


/**
 * @brief Configure PWM on a specified GPIO pin.
 *
 * Initializes the PWM slice/channel, sets a default frequency/resolution, and
 * prepares the pin for duty-cycle updates.
 *
 * @param gpio_pin GPIO number to be configured for PWM output.
 * @pre gpio_init must have been called for the pin, or this method must handle pin init.
 * @post The pin outputs PWM with an initial duty (implementation-defined).
 */


/**
 * @brief Set PWM duty cycle on a specified GPIO pin.
 *
 * @param gpio_pin GPIO number configured for PWM.
 * @param duty_u16 16-bit duty cycle value in range [0..65535], where 0 is 0% and 65535 is ~100%.
 * @pre The pin must be configured for PWM via setup_pwm.
 * @note Actual resolution/linearity may depend on the configured PWM clock and wrap value.
 */


/**
 * @brief Synchronize the system time.
 *
 * Attempts to read the current time from the RTC and update the system clock. If Wi-Fi
 * is enabled and network time is available, an implementation may also use network time
 * as a fallback or to validate/adjust the RTC value.
 *
 * @return true if the system time was updated successfully; false otherwise.
 * @note Should be called after I2C and, if applicable, Wi-Fi are initialized.
 */


/**
 * @brief Initialize all attached equipment and subsystems.
 *
 * Typical steps:
 * - Initialize I2C bus and probe the BME280 sensor.
 * - Initialize RTC access.
 * - Initialize PWM channels for RGB LED control.
 * - Perform an initial time synchronization.
 *
 * @throws May assert or log errors if critical peripherals are unavailable.
 * @note Call this early in application startup.
 */


/**
 * @brief Initialize the Wi-Fi stack and attempt to connect.
 *
 * @return Status code:
 * - WIFI_OK on success.
 * - WIFI_CONN_FAIL if initialization succeeded but connection failed.
 * - WIFI_INIT_FAIL if Wi-Fi hardware/stack could not be initialized.
 *
 * @note Respects the global Wi-Fi enable flag; if Wi-Fi is disabled, may return WIFI_INIT_FAIL or skip work.
 */


/**
 * @brief Attempt to reconnect to Wi-Fi if disconnected.
 *
 * @return Status code:
 * - WIFI_OK if already connected or reconnection succeeded.
 * - WIFI_CONN_FAIL if reconnection attempts failed.
 * - WIFI_INIT_FAIL if Wi-Fi is disabled or not initialized.
 *
 * @note Useful to call periodically when connectivity is required for data upload.
 */


/**
 * @brief Enable or disable Wi-Fi at runtime.
 *
 * When disabled, network operations (including reconnection attempts) should be suppressed.
 *
 * @param enabled true to enable Wi-Fi features; false to disable.
 */


/**
 * @brief Check if Wi-Fi features are currently enabled.
 *
 * @return true if Wi-Fi is enabled; false otherwise.
 */


/**
 * @brief Set the RGB indicator color using per-channel 8-bit intensities.
 *
 * @param r Red channel intensity [0..255].
 * @param g Green channel intensity [0..255].
 * @param b Blue channel intensity [0..255].
 *
 * @note Internally maps 8-bit values to PWM duty cycles. Channel-to-pin mapping is board-specific.
 */


/**
 * @brief Display the latest sensor measurement locally.
 *
 * Typically logs temperature, humidity, and pressure for debugging/monitoring (e.g., via serial console).
 * The exact output medium and formatting are implementation-defined.
 *
 * @note Assumes the BME280 has been initialized and a reading is available.
 */


/**
 * @brief Send the latest measurement data over the network.
 *
 * Uses the TCP transport to publish readings to a remote server or service.
 * Handles connection setup if necessary (subject to Wi-Fi enable state).
 *
 * @note Ensure Wi-Fi is enabled and connected before calling. Errors should be logged/handled gracefully.
 */
#ifndef __PROGRAM_MAIN_HPP__
#define __PROGRAM_MAIN_HPP__

#include "bme280.hpp"
#include "tcp.hpp"
#include <time.h>

#define I2C_PORT i2c0
#define I2C_SDA 0
#define I2C_SCL 1

#define WIFI_INIT_FAIL  255
#define WIFI_CONN_FAIL  1
#define WIFI_OK         0

class ProgramMain{
    BME280* myBME280 = nullptr;
    TCP* myTCP = nullptr;
    bool wifi_active = true;

private:
    static time_t make_time_utc_from_rtc_fields(uint16_t y, uint16_t m, uint16_t d,
                                                uint16_t hh, uint16_t mm, uint16_t ss);
    void setup_pwm(uint);
    void set_pwm_duty(uint, uint16_t);
    bool synchronize_time();

public:
    void init_equipment();
    uint8_t init_wifi();
    uint8_t reconnect_wifi();
    void set_wifi_enabled(bool enabled) { wifi_active = enabled; }
    bool is_wifi_enabled() const { return wifi_active; }
    void set_rgb_color(uint8_t, uint8_t, uint8_t);
    void display_measurement();
    void send_data();
};

#endif /* __PROGRAM_MAIN_HPP__ */