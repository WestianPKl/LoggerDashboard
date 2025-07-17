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

bool screen_update_callback(repeating_timer_t *rt) {
    update_screen_flag = true;
    return true;
}

bool post_request_callback(repeating_timer_t *rt) {
    post_flag = true;
    return true;
}