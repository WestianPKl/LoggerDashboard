#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/timer.h"
#include "hardware/watchdog.h"
#include "program_main.hpp"
#include "pico/cyw43_arch.h"
#include "tusb.h"
#include <cstring>
#include <cctype>
extern "C" {
    #include "lwip/timeouts.h"
}
#include "config.hpp"
#include "com.hpp"

volatile bool update_screen_flag = false;
volatile bool post_flag = false;
volatile bool wifi_reconnect_flag = false;
volatile bool wifi_apply_flag = false;
volatile bool device_reset_flag = false;

bool screen_update_callback(repeating_timer_t *);
bool post_request_callback(repeating_timer_t *);
static void rearm_post_timer();

static repeating_timer_t screen_timer;
static repeating_timer_t post_timer;


/**
 * @brief Application entry point for the Pico TH Logger (Relay SMD, PCF8563T variant).
 *
 * Initializes standard I/O, configuration, hardware, and Wi‑Fi, then enters a
 * cooperative, single-threaded event loop that services communications, timers,
 * Wi‑Fi polling, UI updates, and data posting.
 *
 * Startup sequence:
 * - Initializes stdio and waits briefly to allow USB CDC to enumerate.
 * - Loads configuration.
 * - Initializes measurement/control equipment.
 * - Initializes Wi‑Fi stack and connection (according to configuration).
 * - Arms a 1 Hz repeating timer to trigger screen updates.
 * - Arms/refreshes the data posting timer according to the current configuration.
 *
 * Main loop responsibilities:
 * - com_poll(): Services the command/communications interface (e.g., USB CDC).
 * - Handles device_reset_flag:
 *   - Clears the flag, flushes CDC, and reboots cleanly via the watchdog.
 *   - Provides a busy-wait fallback if reboot does not occur immediately.
 * - Handles wifi_apply_flag:
 *   - Re-initializes Wi‑Fi with current configuration.
 * - Wi‑Fi service:
 *   - If Wi‑Fi is enabled, calls cyw43_arch_poll() to maintain the driver stack.
 * - Handles wifi_reconnect_flag:
 *   - If Wi‑Fi is enabled in config, re-enables and attempts reconnection.
 *   - If disabled in config, turns Wi‑Fi off and emits "WIFI_DISABLED" over CDC.
 * - Periodic configuration check (every 1000 ms):
 *   - Detects changes to post_time_ms and re-arms the posting timer when needed.
 * - Handles update_screen_flag:
 *   - Refreshes the display with the latest measurements.
 * - Handles post_flag:
 *   - Sends collected data to the configured endpoint.
 *
 * Timers and flags:
 * - screen_timer: 1-second repeating timer that schedules UI updates
 *   (sets update_screen_flag via screen_update_callback).
 * - post timer: Armed via rearm_post_timer() based on config.post_time_ms
 *   (sets post_flag to trigger data posting).
 * - Flags (set by ISRs, callbacks, or command handlers) drive all actions to
 *   keep the loop non-blocking and responsive.
 *
 * Notes:
 * - Designed for cooperative multitasking on RP2040; no RTOS is required.
 * - Avoids blocking operations in the main loop; long operations are gated by flags.
 * - Uses watchdog_reboot() for clean resets; CDC is given a brief flush window.
 * - cyw43_arch_poll() is only invoked when Wi‑Fi is enabled to minimize overhead.
 *
 * @return int Never returns; the function runs indefinitely. Return value is nominally 0.
 */
int main() {
    stdio_init_all();
    sleep_ms(2000);

    config_init();

    ProgramMain program_main;
    program_main.init_equipment();
    program_main.init_wifi();
    add_repeating_timer_ms(1000, screen_update_callback, NULL, &screen_timer);
    rearm_post_timer();

    while (true) {
        com_poll();
        if (device_reset_flag) {
            device_reset_flag = false;
            sleep_ms(50);
            watchdog_reboot(0, 0, 0);
            while (1) { tight_loop_contents(); }
        }

        if (wifi_apply_flag) {
            wifi_apply_flag = false;
            program_main.init_wifi();
        }
        if (program_main.is_wifi_enabled()) {
            cyw43_arch_poll();
        }

        if (wifi_reconnect_flag) {
            wifi_reconnect_flag = false;
            const auto &cfg_now = config_get();
            if (cfg_now.wifi_enabled) {
                program_main.set_wifi_enabled(true);
                (void)program_main.reconnect_wifi();
            } else {
                program_main.set_wifi_enabled(false);
                tud_cdc_write_str("WIFI_DISABLED\n");
                tud_cdc_write_flush();
            }
        }

    static absolute_time_t next_check = {0};
    if (absolute_time_diff_us(get_absolute_time(), next_check) >= 0) {
            static uint32_t last_post_time = 0;
            auto &cfgc = config_get();
            if (cfgc.post_time_ms != last_post_time) {
                last_post_time = cfgc.post_time_ms;
                rearm_post_timer();
            }
            next_check = make_timeout_time_ms(1000);
        }
        if (update_screen_flag) {
            update_screen_flag = false;
            program_main.display_measurement();
        }
        if (post_flag) {
            post_flag = false;
            program_main.send_data();
        }
    }
}


/**
 * @brief Cancels and re-arms the repeating POST timer based on the current configuration.
 *
 * This function:
 * - Cancels any existing repeating timer stored in post_timer.
 * - Reads the desired interval from config_get()->post_time_ms.
 * - Enforces a minimum interval of 1000 ms to prevent excessively frequent callbacks.
 * - Schedules a new repeating timer that invokes post_request_callback at the configured interval.
 *
 * Use this after startup or whenever the posting interval in the configuration changes.
 *
 * Side effects:
 * - Updates the global post_timer handle.
 *
 * Notes:
 * - If the configured period is below 1000 ms, 1000 ms is used instead.
 * - The result of add_repeating_timer_ms is not checked; scheduling failures will be silent.
 *
 * @see config_get
 * @see cancel_repeating_timer
 * @see add_repeating_timer_ms
 * @see post_request_callback
 */
static void rearm_post_timer() {
    cancel_repeating_timer(&post_timer);
    const auto &cfg = config_get();
    int64_t period = (int64_t)cfg.post_time_ms;
    if (period < 1000) period = 1000;
    add_repeating_timer_ms(period, post_request_callback, NULL, &post_timer);
}


/**
 * @brief Callback function for a repeating timer to signal a screen update.
 *
 * This function is intended to be used as a callback for a repeating timer.
 * When called, it sets the global flag `update_screen_flag` to true, indicating
 * that the screen should be updated. The function always returns true to keep
 * the timer running.
 *
 * @param rt Pointer to the repeating_timer_t structure (unused in this function).
 * @return true Always returns true to continue the timer.
 */
bool screen_update_callback(repeating_timer_t *rt) {
    update_screen_flag = true;
    return true;
}

/**
 * @brief Callback function for a repeating timer to set the post_flag.
 *
 * This function is intended to be used as a callback for a repeating timer.
 * When invoked, it sets the global variable `post_flag` to true, indicating
 * that a POST request should be made or processed. The function always returns
 * true to keep the timer active.
 *
 * @param rt Pointer to the repeating_timer_t structure associated with the timer event.
 * @return true Always returns true to continue the timer.
 */
bool post_request_callback(repeating_timer_t *rt) {
    post_flag = true;
    return true;
}