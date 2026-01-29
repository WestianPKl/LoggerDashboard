#include "net_time.h"
#include "config.h"

#include <stdio.h>
#include <time.h>
#include <sys/time.h>

#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"
#include "lwip/apps/sntp.h"
#include "lwip/ip_addr.h"

static volatile bool g_synced = false;

void lwip_sntp_set_system_time_us(unsigned long sec, unsigned long us) {
    struct timeval tv = { .tv_sec = (time_t)sec, .tv_usec = (suseconds_t)us };
    settimeofday(&tv, NULL);
    g_synced = true;
}

uint8_t ntp_sync(uint32_t timeout_ms) {
    g_synced = false;

    ip_addr_t ip;
    ipaddr_aton(NTP_SERVER_IP, &ip);
    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setserver(0, &ip);
    sntp_init();

    absolute_time_t deadline = make_timeout_time_ms(timeout_ms);
    while (!time_reached(deadline) && !g_synced) {
        #if PICO_CYW43_ARCH_POLL
        cyw43_arch_poll();
        #endif
        sleep_ms(100);
    }
    sntp_stop();

    if (!g_synced) return 0;
    if (time(NULL) < 1700000000) return 0;
    return 1;
}

uint8_t ntp_get_time(ntp_time_t *t) {
    time_t now = time(NULL);
    if (now < 1700000000) return 0;

    struct tm tm;
    gmtime_r(&now, &tm);

    t->year  = (uint8_t)(tm.tm_year - 100);
    t->month = (uint8_t)(tm.tm_mon + 1);
    t->day   = (uint8_t)tm.tm_mday;
    t->hour  = (uint8_t)tm.tm_hour;
    t->min   = (uint8_t)tm.tm_min;
    t->sec   = (uint8_t)tm.tm_sec;
    return 1;
}