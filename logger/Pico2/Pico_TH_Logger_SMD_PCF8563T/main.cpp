#include <stdio.h>
#include <cstring>
#include <cctype>
#include "pico/stdlib.h"
#include "hardware/timer.h"
#include "hardware/watchdog.h"
#include "pico/cyw43_arch.h"
#include "tusb.h"
extern "C" {
    #include "lwip/timeouts.h"
}
#include "program_main.hpp"
#include "config.hpp"
#include "com.hpp"

volatile bool update_screen_flag   = false;
volatile bool post_flag            = false;
volatile bool wifi_reconnect_flag  = false;
volatile bool wifi_apply_flag      = false;
volatile bool device_reset_flag    = false;

static bool screen_update_callback(repeating_timer_t *);
static bool post_request_callback(repeating_timer_t *);
static void rearm_post_timer();

static repeating_timer_t screen_timer;
static repeating_timer_t post_timer;


/**
 * @brief Application entry point for the Pico TH Logger with Wi‑Fi and display.
 *
 * @details
 * Bootstraps IO and configuration, initializes hardware and Wi‑Fi, schedules periodic tasks,
 * and enters a cooperative event loop that services USB, networking, UI updates, and data posts.
 *
 * Startup sequence:
 * - Initializes stdio and delays ~2 s for host attachment.
 * - Loads configuration.
 * - Initializes equipment (sensors/relays/display) and Wi‑Fi (via ProgramMain).
 * - Starts a 1 s repeating timer for screen updates and arms the data post timer.
 *
 * Main loop responsibilities:
 * - Runs TinyUSB device tasks and network timeouts.
 * - Polls application communications/commands.
 * - Handles a pending device reboot:
 *   cleanly deinitializes Wi‑Fi, flushes USB CDC, then reboots via watchdog.
 * - Applies Wi‑Fi changes on demand and polls the Wi‑Fi stack when enabled.
 * - Reacts to Wi‑Fi reconnect requests according to current configuration:
 *   enables and reconnects, or disables Wi‑Fi and reports "WIFI_DISABLED" over USB CDC.
 * - Every second, checks for changes to the posting interval (config.post_time_ms) and
 *   re-arms the post timer when modified.
 * - Responds to timer/ISR-driven flags:
 *   - update_screen_flag: renders the current measurement to the display.
 *   - post_flag: sends the current telemetry/data payload.
 * - Yields briefly each iteration to keep the system responsive.
 *
 * Flags consumed:
 * - device_reset_flag
 * - wifi_apply_flag
 * - wifi_reconnect_flag
 * - update_screen_flag
 * - post_flag
 *
 * Timers:
 * - screen timer (1 s): sets update_screen_flag via screen_update_callback.
 * - post timer: interval defined by configuration (post_time_ms), set via rearm_post_timer.
 *
 * @return Always 0; function does not return during normal operation (infinite loop).
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

    absolute_time_t next_check = get_absolute_time();

    while (true) {
        tud_task();
        sys_check_timeouts();

        com_poll();

        if (device_reset_flag) {
            device_reset_flag = false;

            cyw43_arch_deinit();

            tud_cdc_write_flush();
            sleep_ms(50);

            watchdog_reboot(0, 0, 0);
            while (1) { tight_loop_contents(); }
        }

        if (wifi_apply_flag) {
            wifi_apply_flag = false;
            (void)program_main.reconnect_wifi();
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
                cyw43_arch_deinit();
                tud_cdc_write_str("WIFI_DISABLED\n");
                tud_cdc_write_flush();
            }
        }

        if (absolute_time_diff_us(next_check, get_absolute_time()) <= 0) {
            static uint32_t last_post_time = 0;
            const auto &cfgc = config_get();
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
        sleep_ms(1);
    }
    return 0;
}

/**
 * @brief Rearm the periodic POST request timer according to the current configuration.
 *
 * Cancels any existing repeating timer associated with post_timer and schedules
 * a new one that invokes post_request_callback at the interval defined by
 * config_get().post_time_ms. Enforces a minimum period of 1000 ms to prevent
 * overly frequent callbacks.
 *
 * Side effects:
 * - Cancels any previously active timer.
 * - Updates the global post_timer handle with the newly scheduled timer.
 * - Ignores the return value of add_repeating_timer_ms; scheduling failures are silent.
 *
 * Preconditions:
 * - config_get() returns a valid configuration object with post_time_ms in milliseconds.
 * - post_request_callback is a valid function compatible with the timer API.
 *
 * Postconditions:
 * - A repeating timer is scheduled with period >= 1000 ms, or no timer is active if scheduling fails.
 *
 * Thread-safety:
 * - Should be called from the main/application context; not intended for ISR use.
 */
static void rearm_post_timer() {
    cancel_repeating_timer(&post_timer);
    const auto &cfg = config_get();
    int64_t period = (int64_t)cfg.post_time_ms;
    if (period < 1000) period = 1000;
    (void)add_repeating_timer_ms(period, post_request_callback, NULL, &post_timer);
}


/**
 * Timer callback that requests a screen refresh by setting a shared update flag.
 *
 * This function is designed to run in the repeating timer (IRQ) context and must remain
 * short and non-blocking. The main/application loop should poll the flag and perform the
 * actual screen update outside of interrupt context.
 *
 * Thread-safety: The update flag should be declared volatile or otherwise synchronized,
 * as it is written from an interrupt context and read from the main thread.
 *
 * @param rt Pointer to the repeating timer that invoked this callback (unused).
 * @return true to keep the repeating timer running; returning false would stop it.
 */
static bool screen_update_callback(repeating_timer_t *) {
    update_screen_flag = true;
    return true;
}

/**
 * Repeating timer callback that signals a pending POST operation by setting a global flag.
 *
 * This function is intended to run in the timer's interrupt/alarm context; it must remain
 * fast and non-blocking. The global post_flag is set so that the main/application loop can
 * perform the actual work outside the interrupt context.
 *
 * @note The shared flag should be safe for concurrent access (e.g., declared volatile or atomic).
 * @return true to keep the repeating timer active (the callback will continue to be invoked);
 *         returning false would stop further callbacks.
 */
static bool post_request_callback(repeating_timer_t *) {
    post_flag = true;
    return true;
}