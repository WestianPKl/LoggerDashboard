#include "hardware/i2c.h"
#include "hardware/pwm.h"
#include "hardware/rtc.h"
#include "pico/cyw43_arch.h"
extern "C" {
    #include "lwip/apps/sntp.h"
    #include "lwip/dns.h"
    #include "lwip/ip_addr.h"
    #include "lwip/timeouts.h"
}
#include <time.h>
#include <math.h>
#include "program_main.hpp"
#include "lcd_1602_i2c.hpp"
#include "rtc_clock.hpp"
#include "main.hpp"
#include "config.hpp"

#define LED_BLUE    6
#define LED_GREEN   8
#define LED_RED     7
#define BUZZER      11
#define RELAY_1     12
#define RELAY_2     13
#define RELAY_3     14
#define RELAY_4     15

using namespace std;

volatile bool time_synced = false;
static volatile bool dns_resolved = false;
static ip_addr_t resolved_ip;

/**
 * @brief Convert discrete RTC date/time fields to a Unix timestamp.
 *
 * Constructs a std::tm from the provided calendar fields and converts it to a
 * time_t via mktime.
 *
 * Important:
 * - The provided fields are interpreted as a local-time calendar according to
 *   the C library timezone settings. The resulting time_t represents seconds
 *   since the Unix epoch (UTC). If your RTC stores UTC, ensure TZ is set to
 *   "UTC" or consider using timegm (if available) for a UTC-based conversion.
 * - The tm structure is zero-initialized, so tm_isdst == 0 (DST not in effect).
 *   If you want the library to determine DST automatically, set tm_isdst to -1.
 *
 * @param y  Full year (e.g., 2025). Must be >= 1900.
 * @param m  Month in the range [1, 12].
 * @param d  Day of month in the range [1, 31].
 * @param hh Hour in the range [0, 23].
 * @param mm Minute in the range [0, 59].
 * @param ss Second in the range [0, 60] (to allow for leap seconds).
 * @return   The corresponding Unix timestamp (seconds since 1970-01-01 00:00:00 UTC),
 *           or (time_t)-1 on failure.
 *
 * @note Out-of-range values may be normalized by mktime (e.g., month 13 rolls into the next year).
 */
time_t ProgramMain::make_time_utc_from_rtc_fields(uint16_t y, uint16_t m, uint16_t d,
                                                  uint16_t hh, uint16_t mm, uint16_t ss) {
    struct tm lt = {};
    lt.tm_year = (int)y - 1900;
    lt.tm_mon  = (int)m - 1;
    lt.tm_mday = (int)d;
    lt.tm_hour = (int)hh;
    lt.tm_min  = (int)mm;
    lt.tm_sec  = (int)ss;
    return mktime(&lt);
}

/**
 * @brief DNS resolution callback invoked when a hostname lookup completes.
 *
 * This function is called asynchronously by the DNS resolver when the address
 * for a requested hostname is available or when resolution fails.
 *
 * Behavior:
 * - On success (ipaddr != nullptr), copies the resolved address into the
 *   global resolved_ip and sets dns_resolved to true.
 * - On failure or pending state (ipaddr == nullptr), leaves globals unchanged.
 *
 * Threading:
 * - Typically executed in the network stack's context (e.g., lwIP TCP/IP thread).
 *   Avoid blocking operations or long-running work here.
 *
 * Notes:
 * - The ipaddr pointer is only valid during the callback. Copying it (as done here)
 *   is required if it will be used later.
 *
 * @param name   The hostname that was queried.
 * @param ipaddr Pointer to the resolved IP address on success; nullptr otherwise.
 * @param arg    User-supplied argument passed through the DNS API (unused).
 */
static void dns_callback(const char*, const ip_addr_t* ipaddr, void*) {
    if (ipaddr) {
        resolved_ip = *ipaddr;
        dns_resolved = true;
    }
}

/**
 * Configure a GPIO for PWM and enable its PWM slice.
 *
 * Sets the specified GPIO to the PWM peripheral function and enables the
 * corresponding PWM slice so it starts counting. This function does not set
 * the PWM clock, wrap (TOP), phase-correct mode, polarity, or duty cycle; those
 * remain at SDK defaults and must be configured by the caller.
 *
 * @param gpio RP2040 GPIO number to use for PWM (typically 0–29).
 *
 * @note Enabling a PWM slice affects both channels (A and B) on that slice. If
 *       another GPIO mapped to the same slice is in use, enabling the slice
 *       will also affect that channel.
 *
 * @warning No validation is performed. Ensure the selected GPIO supports PWM,
 *          and configure frequency and duty cycle after calling, e.g.:
 *          pwm_set_wrap(slice, top), pwm_set_clkdiv(slice, div),
 *          pwm_set_chan_level(slice, channel, level).
 *
 * @see pwm_gpio_to_slice_num, pwm_gpio_to_channel, pwm_set_wrap,
 *      pwm_set_clkdiv, pwm_set_chan_level, pwm_set_enabled
 */
void ProgramMain::setup_pwm(uint gpio) {
    gpio_set_function(gpio, GPIO_FUNC_PWM);
    uint slice_num = pwm_gpio_to_slice_num(gpio);
    pwm_set_enabled(slice_num, true);
}

/**
 * @brief Set the PWM duty level for the PWM channel associated with a GPIO pin.
 *
 * Computes the PWM slice and channel from the provided GPIO and updates the
 * channel compare level. The effective duty cycle is duty / (wrap + 1), where
 * wrap (TOP) must be configured elsewhere for the slice. A duty of 0 yields
 * 0% duty (always low); values greater than wrap effectively produce ~100%
 * duty (always high).
 *
 * Preconditions:
 * - The GPIO has been configured for PWM (gpio_set_function(gpio, GPIO_FUNC_PWM)).
 * - The corresponding PWM slice has been configured (clock divisor, TOP/wrap, etc.) and enabled.
 *
 * This function does not modify slice configuration (TOP, clock divisor, polarity, etc.).
 *
 * @param gpio PWM-capable GPIO number whose duty should be updated.
 * @param duty Channel level (0..wrap) to set for the GPIO's PWM channel.
 *
 * @see pwm_gpio_to_slice_num
 * @see pwm_gpio_to_channel
 * @see pwm_set_chan_level
 */
void ProgramMain::set_pwm_duty(uint gpio, uint16_t duty) {
    uint slice_num = pwm_gpio_to_slice_num(gpio);
    uint channel = pwm_gpio_to_channel(gpio);
    pwm_set_chan_level(slice_num, channel, duty);
}

/**
 * @brief Resolves an NTP server and synchronizes the system time via SNTP.
 *
 * This function:
 * - Resets synchronization state and clears any previously resolved IP.
 * - Sets the local timezone to CET/CEST ("CET-1CEST,M3.5.0/2,M10.5.0/3") and applies it with tzset().
 * - Resolves the hostname "tempus1.gum.gov.pl" using lwIP DNS, polling cyw43_arch_poll() and
 *   sys_check_timeouts() while waiting (up to ~10 seconds).
 * - Configures lwIP SNTP in poll mode, sets the resolved server, and starts SNTP.
 * - Polls for time synchronization, periodically calling cyw43_arch_poll() and sys_check_timeouts()
 *   (up to ~9 seconds). On success, stops SNTP and returns true.
 * - Stops SNTP and returns false on DNS failure/timeout or SNTP synchronization timeout.
 *
 * Preconditions:
 * - Wi-Fi/cyw43 and lwIP stacks are initialized and operational.
 * - DNS and SNTP callbacks update the internal flags (e.g., dns_resolved, time_synced) appropriately.
 *
 * Side effects:
 * - Modifies environment variable TZ and calls tzset().
 * - Initiates DNS and SNTP network traffic; updates the system clock on success.
 * - Updates internal synchronization state flags.
 *
 * Timing:
 * - Worst-case blocking time is approximately 19 seconds (DNS ~10s + SNTP ~9s), with cooperative
 *   polling of cyw43_arch_poll() and sys_check_timeouts().
 *
 * @return true if time synchronization completes successfully within the timeouts; false otherwise.
 */
bool ProgramMain::synchronize_time() {
    time_synced = false;
    dns_resolved = false;
    ip_addr_set_zero(&resolved_ip); 
    
    setenv("TZ", "CET-1CEST,M3.5.0/2,M10.5.0/3", 1);
    tzset();

    err_t err = dns_gethostbyname("tempus1.gum.gov.pl", &resolved_ip, dns_callback, NULL);
    if (err == ERR_OK) {
        dns_resolved = true;
    } else if (err == ERR_INPROGRESS) {
        for (int i = 0; i < 100 && !dns_resolved; i++) {
            cyw43_arch_poll();
            sys_check_timeouts();
            sleep_ms(100);
        }
    } else {
        return false;
    }

    if (!dns_resolved) {
        return false;
    }

    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setserver(0, &resolved_ip);
    sntp_init();

    for (int i = 0; i < 30; ++i) {
        cyw43_arch_poll();
        sys_check_timeouts();
        if (time_synced) {
            sntp_stop();
            return true;
        }
        sleep_ms(300);
    }
    sntp_stop();
    return false;
}

/**
 * @brief Initialize all peripherals and modules required by ProgramMain.
 *
 * Performs the following:
 * - Configures PWM for RGB LEDs and the buzzer; sets 8-bit wrap and zero duty.
 * - Uses RGB LED to indicate status: white during startup, green on successful init.
 * - Sets up I2C at 400 kHz, configures SDA/SCL with pull-ups, and publishes pin metadata.
 * - Initializes four relay GPIOs as outputs and ensures they are OFF (driven low).
 * - Initializes the LCD, clears it, and displays a "Starting..." message.
 * - Instantiates a BME280 sensor in forced mode (selection currently unaffected by config.sht).
 * - Optionally creates a TCP instance if Wi‑Fi is enabled in configuration.
 * - Optionally initializes the PCF8563T RTC over I2C if enabled in configuration.
 *
 * Preconditions:
 * - Pin definitions and helper routines (e.g., setup_pwm, set_pwm_duty, set_rgb_color, lcd_*).
 * - A valid runtime configuration accessible via config_get().
 *
 * Side effects:
 * - Reconfigures hardware (PWM, GPIO, I2C, LCD).
 * - Allocates heap objects for myBME280 (and myTCP when Wi‑Fi is enabled).
 *
 * Usage notes:
 * - Intended to be called once during system startup.
 * - Repeated calls without teardown may leak resources or disturb active peripherals.
 *
 * @return void
 */
void ProgramMain::init_equipment() {
    setup_pwm(LED_RED);
    setup_pwm(LED_GREEN);
    setup_pwm(LED_BLUE);
    setup_pwm(BUZZER);

    pwm_set_wrap(pwm_gpio_to_slice_num(LED_RED), 255);
    pwm_set_wrap(pwm_gpio_to_slice_num(LED_GREEN), 255);
    pwm_set_wrap(pwm_gpio_to_slice_num(LED_BLUE), 255);

    set_pwm_duty(LED_RED, 0);
    set_pwm_duty(LED_GREEN, 0);
    set_pwm_duty(LED_BLUE, 0);
    set_pwm_duty(BUZZER, 0);

    set_rgb_color(255, 255, 255);

    i2c_init(i2c_default, 400 * 1000);
    gpio_set_function(I2C_SDA, GPIO_FUNC_I2C);
    gpio_set_function(I2C_SCL, GPIO_FUNC_I2C);
    gpio_pull_up(I2C_SDA);
    gpio_pull_up(I2C_SCL);
    bi_decl(bi_2pins_with_func(I2C_SDA, I2C_SCL, GPIO_FUNC_I2C));

    gpio_init(RELAY_1);
    gpio_init(RELAY_2);
    gpio_init(RELAY_3);
    gpio_init(RELAY_4);

    gpio_set_dir(RELAY_1, GPIO_OUT);
    gpio_set_dir(RELAY_2, GPIO_OUT);
    gpio_set_dir(RELAY_3, GPIO_OUT);
    gpio_set_dir(RELAY_4, GPIO_OUT);

    gpio_put(RELAY_1, 0);
    gpio_put(RELAY_2, 0);
    gpio_put(RELAY_3, 0);
    gpio_put(RELAY_4, 0);

    lcd_init();
    lcd_clear();
    lcd_string("Starting...");

    if  (config_get().sht == 30){
        myBME280 = new BME280(BME280::MODE::MODE_FORCED);
    }
    else if (config_get().sht == 40){
        myBME280 = new BME280(BME280::MODE::MODE_FORCED);
    }
    else {
        myBME280 = new BME280(BME280::MODE::MODE_FORCED);
    }

    if(config_get().wifi_enabled == 1){
        myTCP = new TCP();
    }
        
    if (config_get().clock_enabled == 1) {
        pcf8563t_init(I2C_PORT);
    } else {
        rtc_init();
    }

    set_rgb_color(0, 255, 0);
}

/**
 * @brief Initializes the Wi‑Fi subsystem and attempts to connect to the configured network.
 *
 * Uses configuration values (wifi_enabled, wifi_ssid, wifi_password) to decide whether to
 * initialize the CYW43 stack and connect in station mode. The RGB LED and LCD are used to
 * provide user feedback during the process:
 * - LED white: initialization/connection in progress
 * - LED red: error during initialization or connection (LCD shows an error message)
 * - LED green: connected successfully
 *
 * Behavior:
 * - If Wi‑Fi is disabled in configuration, the function returns immediately with WIFI_OK
 *   without initializing the Wi‑Fi stack.
 * - Initializes the CYW43 architecture; on failure, disables Wi‑Fi, reports an error, and returns WIFI_INIT_FAIL.
 * - Enables station mode and attempts a WPA2 AES‑PSK connection using the configured SSID/password,
 *   with a 30‑second timeout; on failure, disables Wi‑Fi, reports an error, and returns WIFI_CONN_FAIL.
 * - On success, synchronizes system time and returns WIFI_OK.
 *
 * Side effects:
 * - Modifies the global Wi‑Fi enabled state (disables on failure).
 * - Updates the RGB LED color for status indication.
 * - Writes status/error messages to the LCD.
 * - Calls synchronize_time() on successful connection.
 *
 * Timing:
 * - Potentially blocking for up to ~30 seconds during the connection attempt.
 *
 * Preconditions:
 * - Valid hardware setup for CYW43, LCD, and RGB LED.
 * - Configuration should contain the desired SSID and password; empty credentials will likely cause connection failure.
 *
 * @return uint8_t
 * @retval WIFI_OK          Wi‑Fi disabled by config or connected successfully and time synchronized.
 * @retval WIFI_INIT_FAIL   CYW43 initialization failed; Wi‑Fi disabled and error indicated.
 * @retval WIFI_CONN_FAIL   Connection attempt failed or timed out; Wi‑Fi disabled and error indicated.
 */
uint8_t ProgramMain::init_wifi() {
    set_wifi_enabled(config_get().wifi_enabled);
    if (!is_wifi_enabled()) {
        return WIFI_OK;
    }
    const auto &cfg = config_get();
    const char *SSID = cfg.wifi_ssid[0] ? cfg.wifi_ssid : "";
    const char *PASSWORD = cfg.wifi_password[0] ? cfg.wifi_password : "";

    set_rgb_color(255, 255, 255);
    if (cyw43_arch_init()) {
        lcd_set_cursor(0, 0);
        lcd_string("WiFi init error \n");
        set_rgb_color(255, 0, 0);
        set_wifi_enabled(false);
        return WIFI_INIT_FAIL;
    }

    cyw43_arch_enable_sta_mode();
    if (cyw43_arch_wifi_connect_timeout_ms(SSID, PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000)) {
        lcd_set_cursor(0, 0);
        lcd_string("WiFi conn error \n");
        set_rgb_color(255, 0, 0);
        set_wifi_enabled(false);
        return WIFI_CONN_FAIL;
    }

    set_rgb_color(0, 255, 0);
    synchronize_time();
    return WIFI_OK;
}

/**
 * @brief Reinitializes and reconnects the Wi‑Fi interface using stored configuration.
 *
 * This function applies the current configuration (SSID, password, Wi‑Fi enable flag),
 * fully tears down and reinitializes the CYW43 Wi‑Fi stack, and attempts to connect
 * in STA mode with WPA2 AES-PSK authentication. Visual status is indicated via RGB LED:
 * - White: reconnect in progress
 * - Red: failure (initialization or connection)
 * - Green: connected successfully
 *
 * On successful connection, SNTP is restarted via synchronize_time() to refresh the RTC.
 * If Wi‑Fi is disabled in the configuration, the function is a no‑op and returns success.
 *
 * Side effects:
 * - Stops SNTP before reconnect and resynchronizes time after success.
 * - Deinitializes and reinitializes the Wi‑Fi stack, dropping any existing network state.
 * - Blocks the calling thread until the attempt completes or times out (≈30s plus init).
 * - Changes the RGB LED color to reflect progress/result.
 *
 * @return uint8_t
 * - WIFI_OK          on success or when Wi‑Fi is disabled by configuration
 * - WIFI_INIT_FAIL   if the CYW43 stack fails to initialize
 * - WIFI_CONN_FAIL   if association/authentication fails or times out
 *
 * @note Requires valid configuration returned by config_get().
 * @warning Existing sockets/connections will be invalidated due to stack reinit.
 * @see config_get(), set_wifi_enabled(), cyw43_arch_init(), cyw43_arch_wifi_connect_timeout_ms(), sntp_stop(), synchronize_time()
 */
uint8_t ProgramMain::reconnect_wifi() {
    set_wifi_enabled(config_get().wifi_enabled);
    if (!is_wifi_enabled()) {
        return WIFI_OK;
    }
    const auto &cfg = config_get();
    const char *SSID = cfg.wifi_ssid[0] ? cfg.wifi_ssid : "";
    const char *PASSWORD = cfg.wifi_password[0] ? cfg.wifi_password : "";

    set_rgb_color(255, 255, 255);

    sntp_stop();

    cyw43_arch_deinit();
    sleep_ms(100);
    if (cyw43_arch_init()) {
        set_rgb_color(255, 0, 0);
        return WIFI_INIT_FAIL;
    }
    cyw43_arch_enable_sta_mode();
    if (cyw43_arch_wifi_connect_timeout_ms(SSID, PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000)) {
        set_rgb_color(255, 0, 0);
        return WIFI_CONN_FAIL;
    }
    set_rgb_color(0, 255, 0);
    synchronize_time();
    return WIFI_OK;
}

/**
 * @brief Sets the RGB LED color by updating PWM duty cycles for each channel.
 *
 * Applies the specified 8-bit intensities to the red, green, and blue LED channels
 * via their respective PWM outputs.
 *
 * @param red   Red channel intensity (0 = off, 255 = maximum).
 * @param green Green channel intensity (0 = off, 255 = maximum).
 * @param blue  Blue channel intensity (0 = off, 255 = maximum).
 *
 * @pre PWM for LED_RED, LED_GREEN, and LED_BLUE must be initialized.
 * @note Actual brightness depends on PWM configuration and LED hardware.
 * @see set_pwm_duty
 */
void ProgramMain::set_rgb_color(uint8_t red, uint8_t green, uint8_t blue) {
    set_pwm_duty(LED_RED, red);
    set_pwm_duty(LED_GREEN, green);
    set_pwm_duty(LED_BLUE, blue);
}

/**
 * @brief Sets the RGB LED color by adjusting the PWM duty cycle for each color channel.
 *
 * This function sets the intensity of the red, green, and blue channels of an RGB LED
 * by configuring the PWM duty cycle for each channel. The values for each color should
 * be in the range 0-255, where 0 is off and 255 is maximum brightness.
 *
 * @param red   Intensity of the red channel (0-255).
 * @param green Intensity of the green channel (0-255).
 * @param blue  Intensity of the blue channel (0-255).
 */
void ProgramMain::set_rgb_color(uint8_t red, uint8_t green, uint8_t blue) {
    set_pwm_duty(LED_RED, red);
    set_pwm_duty(LED_GREEN, green);
    set_pwm_duty(LED_BLUE, blue);
}

/**
 * @brief Display timestamp and environmental measurements; report errors; and control relays.
 *
 * @details
 * - Reads current date/time from PCF8563T (when clock is enabled). On failure, optionally logs an error over Wi‑Fi and returns.
 * - Measures BME280 values. If temperature ∉ [-100, 100] °C or humidity ∉ [0, 100] %, optionally logs an error and returns.
 * - LCD row 0: renders "YYYY-MM-DD HH:MM".
 * - LCD row 1: cycles content across calls using a static option:
 *   - option == 0: shows temperature and/or humidity (if enabled); sets RGB LED to green.
 *   - option == 3: shows pressure in hPa (if enabled); sets RGB LED to off/black.
 *   - option increments each call and wraps to 0 after 6.
 * - Clears and rewrites the second LCD row before updating to avoid artifacts.
 *
 * Relay control (only when the corresponding feature is enabled):
 * - Temperature: > 27 °C → RELAY_1=ON, RELAY_2=OFF; < 20 °C → RELAY_1=OFF, RELAY_2=ON; otherwise both OFF.
 * - Humidity: > 70 %RH → RELAY_3=ON, RELAY_4=OFF; < 30 %RH → RELAY_3=OFF, RELAY_4=ON; otherwise both OFF.
 *
 * Error reporting (when Wi‑Fi is enabled):
 * - Time read failure: "Time could not be readed." with source "PCF8563" if clock is enabled, otherwise "RTC".
 * - Sensor validation failure: "Sensor error" / "Values out of range".
 *
 * @pre config_get() provides feature flags: clock_enabled, temperature, humidity, pressure.
 * @note Uses static state to multiplex the second LCD line across invocations.
 * @par Side effects
 *   I2C transactions with RTC/sensor, LCD updates, RGB LED color changes, GPIO relay toggling, and optional network logging.
 * @return void
 */
void ProgramMain::display_measurement() {
    static uint8_t option = 0;
    bool time_ok = false;
    uint16_t timev[7];
    if (config_get().clock_enabled == 1) {
        time_ok = pcf8563t_read_time(I2C_PORT, timev);
    } else {
        datetime_t t;
        time_ok = rtc_get_datetime(&t);
        timev[6] = t.year;
        timev[5] = t.month;
        timev[3] = t.day;
        timev[2] = t.hour;
        timev[1] = t.min;
        timev[0] = t.sec;
    }

    if (!time_ok) {
        if (is_wifi_enabled()) {
            if(!myTCP->send_error_log("Time could not be readed.", config_get().clock_enabled ? "PCF8563" : "RTC")){
                printf("Time error");
            }
        }
        return;
    }

    BME280::Measurement_t values = myBME280->measure();
        
    if (values.temperature < -100 || values.temperature > 100 ||
        values.humidity < 0 || values.humidity > 100) {
        if (is_wifi_enabled()) {
            if(!myTCP->send_error_log("Sensor error", "Values out of range")){
                printf("Sensor error");
            }    
        }
        return;
    }

    char line1[17];
    char line2[17];

    snprintf(line1, sizeof(line1), "%04d-%02d-%02d %02d:%02d",
             timev[6], timev[5], timev[3], timev[2], timev[1]);

    if (option == 0) {
        set_rgb_color(0, 255, 0);
        if(config_get().temperature == 1 && config_get().humidity == 1)
            snprintf(line2, sizeof(line2), "T:%.1fC H:%.1f%%", values.temperature, values.humidity);
        else if(config_get().temperature == 1)
            snprintf(line2, sizeof(line2), "T:%.1fC", values.temperature);
        else if(config_get().humidity == 1)
            snprintf(line2, sizeof(line2), "H:%.1f%%", values.humidity);
        else
            snprintf(line2, sizeof(line2), "No data");
        lcd_set_cursor(1, 0);
        lcd_string("                ");
        lcd_set_cursor(1, 0);
        lcd_string(line2);
    } else if (option == 3 && config_get().pressure == 1) {
        set_rgb_color(0, 0, 0);
        snprintf(line2, sizeof(line2), "P:%4.0fhPa", values.pressure);
        lcd_set_cursor(1, 0);
        lcd_string("                ");
        lcd_set_cursor(1, 0);
        lcd_string(line2);
    }
    lcd_set_cursor(0, 0);
    lcd_string(line1);
    option++;
    if(option > 6){
        option = 0;
    }

    if (config_get().temperature == 1){
        if (values.temperature > 27) {
            gpio_put(RELAY_1, 1);
            gpio_put(RELAY_2, 0);
        } else if (values.temperature < 20) {
            gpio_put(RELAY_1, 0);
            gpio_put(RELAY_2, 1);
        } else {
            gpio_put(RELAY_1, 0);
            gpio_put(RELAY_2, 0);
        }
    }

    if (config_get().humidity == 1){
        if(values.humidity > 70){
            gpio_put(RELAY_3, 1);
            gpio_put(RELAY_4, 0);
        } else if(values.humidity < 30){
            gpio_put(RELAY_3, 0);
            gpio_put(RELAY_4, 1);
        } else {
            gpio_put(RELAY_3, 0);
            gpio_put(RELAY_4, 0);
        }
    }
}   

/**
 * Sends a single sensor sample (timestamp, temperature, humidity, pressure) to the backend.
 *
 * Preconditions:
 * - Wi‑Fi must be enabled (is_wifi_enabled()).
 * - myTCP (transport/client) and myBME280 (sensor) are initialized and ready.
 * - If config_get().clock_enabled == 1, a PCF8563T RTC must be present and readable.
 *
 * Behavior:
 * - If Wi‑Fi is disabled, returns immediately.
 * - Attempts to read time from the RTC when enabled; on failure (or when clock is disabled),
 *   logs an error ("PCF8563" if enabled, otherwise "RTC") and returns.
 * - Constructs a UTC timestamp string:
 *   - Preferred: ISO‑8601 "YYYY-MM-DDThh:mm:ssZ" using gmtime().
 *   - Fallback: "YYYY-MM-DD hh:mm:ss" formatted from raw RTC fields if gmtime() fails.
 * - Measures BME280 values; validates temperature ∈ [-100, 100] and humidity ∈ [0, 100].
 *   On invalid range, logs an error and returns.
 * - Requests an authorization token; on failure, logs an error and returns.
 * - Posts the data; on failure, attempts to log an error (includes timestamp) and returns.
 * - On success, returns normally (void) with no further output.
 *
 * Side effects:
 * - Performs synchronous network I/O via myTCP (token request, data POST, error logs).
 * - Prints to console (printf) if certain error-log transmissions fail.
 *
 * Return value:
 * - void (returns early on any failure condition).
 *
 * Notes:
 * - May block due to I/O and sensor/RTC access.
 * - Units are determined by BME280::Measurement_t (commonly °C, %RH, and Pa or hPa).
 * - Not thread-safe unless external synchronization protects shared resources (I2C, myTCP, sensor state).
 */
void ProgramMain::send_data() {
    if (!is_wifi_enabled()) {
        return;
    }
    bool time_ok = false;
    uint16_t tarr[7];
    if (config_get().clock_enabled == 1) {
        time_ok = pcf8563t_read_time(I2C_PORT, tarr);
    }else {
        datetime_t t;
        time_ok = rtc_get_datetime(&t);
        tarr[6] = t.year;
        tarr[5] = t.month;
        tarr[3] = t.day;
        tarr[2] = t.hour;
        tarr[1] = t.min;
        tarr[0] = t.sec;
    }
    if (!time_ok) {
        if(!myTCP->send_error_log("Time could not be readed.", config_get().clock_enabled ? "PCF8563" : "RTC")){
            printf("Time error - data send");
        }
        return;
    }

    time_t epoch_utc = make_time_utc_from_rtc_fields(
        tarr[6], tarr[5], tarr[3],
        tarr[2], tarr[1], tarr[0]
    );
    struct tm *gt = gmtime(&epoch_utc);
    char time_send[32];
    if (gt) {
        snprintf(time_send, sizeof(time_send),
                 "%04d-%02d-%02dT%02d:%02d:%02dZ",
                 gt->tm_year + 1900, gt->tm_mon + 1, gt->tm_mday,
                 gt->tm_hour, gt->tm_min, gt->tm_sec);
    } else {
        snprintf(time_send, sizeof(time_send),
                 "%04d-%02d-%02d %02d:%02d:%02d",
                 tarr[6], tarr[5], tarr[3], tarr[2], tarr[1], tarr[0]);
    }

    BME280::Measurement_t values = myBME280->measure();

    if (values.temperature < -100 || values.temperature > 100 ||
        values.humidity < 0 || values.humidity > 100) {
        if(!myTCP->send_error_log("Invalid sensor data")){
            printf("Invalid sensor data");
        }
        return;
    }

    if (!myTCP->send_token_get_request()) {
        myTCP->send_error_log("Token fetch failed");
        return;
    };

    if (!myTCP->send_data_post_request(time_send, values.temperature, values.humidity, values.pressure)) {
        if(!myTCP->send_error_log("Data sending error", time_send)){
            printf("Data sending error");
        }
        return;
    }
}

/**
 * @brief SNTP callback to apply newly acquired time to the system and external RTC.
 *
 * Sets a global synchronization flag and converts the provided Unix epoch seconds
 * to local time, constructing a datetime_t. If both clock_enabled and set_time_enabled
 * configuration flags are enabled, the external PCF8563T real-time clock is updated
 * over I2C.
 *
 * @param secs Unix time in seconds since 1970-01-01 00:00:00 UTC.
 *
 * @pre I2C interface and the PCF8563T driver are initialized. The system time zone
 *      is configured if local time conversion is desired.
 * @post The global time_synced flag is set to true. The PCF8563T RTC may be updated.
 *
 * @note Conversion uses localtime(), which applies the current time zone and DST.
 *       Ensure the day-of-week mapping used by pcf8563t_set_time() matches tm_wday.
 *
 * @see pcf8563t_set_time(), config_get()
 */
extern "C" void sntp_set_system_time(uint32_t secs) {
    time_synced = true;
    time_t rawtime = secs;
    struct tm *lt = localtime(&rawtime);
    datetime_t dt = {
        .year  = (int16_t)(lt->tm_year + 1900),
        .month = (int8_t)(lt->tm_mon + 1),
        .day   = (int8_t)(lt->tm_mday),
        .dotw  = (int8_t)(lt->tm_wday),
        .hour  = (int8_t)(lt->tm_hour),
        .min   = (int8_t)(lt->tm_min),
        .sec   = (int8_t)(lt->tm_sec),
    };
    if (config_get().clock_enabled == 1 && config_get().set_time_enabled == 1) {
        pcf8563t_set_time(I2C_PORT, dt.sec, dt.min, dt.hour, dt.dotw, dt.day, dt.month, dt.year);
    }else if (config_get().clock_enabled == 0 && config_get().set_time_enabled == 1) {
        rtc_set_datetime(&dt);
    }
}