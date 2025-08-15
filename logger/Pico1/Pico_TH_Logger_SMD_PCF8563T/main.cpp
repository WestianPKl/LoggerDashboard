#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/timer.h"
#include "program_main.hpp"
#include "pico/cyw43_arch.h"
extern "C" {
    #include "lwip/timeouts.h"
}

volatile bool update_screen_flag = false;
volatile bool post_flag = false;

bool screen_update_callback(repeating_timer_t *);
bool post_request_callback(repeating_timer_t *);

/**
 * @brief Entry point of the Pico_TH_Logger_SMD_PCF8563T application.
 *
 * Initializes hardware, WiFi, and sets up periodic timers for screen updates and data posting.
 * If WiFi initialization fails, the RGB LED blinks red indefinitely.
 * Main loop handles:
 *   - System timeouts and WiFi polling
 *   - Screen updates when `update_screen_flag` is set
 *   - Data posting when `post_flag` is set
 *   - Brief sleep to yield CPU
 *
 * @return int Exit status (never returns under normal operation)
 */
int main() {
    repeating_timer_t screen_timer;
    repeating_timer_t post_timer;
    stdio_init_all();
    sleep_ms(2000);
    ProgramMain program_main;
    program_main.init_equipment();
    if (program_main.init_wifi() != WIFI_OK) {
        while (true) {
            program_main.set_rgb_color(255, 0, 0);
            sleep_ms(500);
            program_main.set_rgb_color(0, 0, 0);
            sleep_ms(500);
        }
    }
    add_repeating_timer_ms(1000, screen_update_callback, NULL, &screen_timer);
    add_repeating_timer_ms(600000, post_request_callback, NULL, &post_timer);
    while (true) {
        sys_check_timeouts();
        cyw43_arch_poll();
        if (update_screen_flag) {
            update_screen_flag = false;
            program_main.display_measurement();
        }
        if (post_flag) {
            post_flag = false;
            program_main.send_data();
        }
        sleep_ms(10);
    }
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