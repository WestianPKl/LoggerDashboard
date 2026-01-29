#include "net_time.h"
#include "config.h"

#include <stdio.h>
#include <time.h>
#include <sys/time.h>

#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"

#include "lwip/apps/sntp.h"
#include "lwip/ip_addr.h"

#include "rtc_pcf8563.h"

#ifndef NTP_SERVER_IP
#define NTP_SERVER_IP "192.168.18.6"
#endif

static volatile bool g_time_synced = false;

void lwip_sntp_set_system_time_us(unsigned long sec, unsigned long us) {
    struct timeval tv;
    tv.tv_sec = (time_t)sec;
    tv.tv_usec = (suseconds_t)us;
    settimeofday(&tv, NULL);
    g_time_synced = true;
}

static bool ntp_sync_system_time_blocking(uint32_t timeout_ms) {
    g_time_synced = false;

    ip_addr_t ip;
    ipaddr_aton(NTP_SERVER_IP, &ip);

    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setserver(0, &ip);
    sntp_init();

    absolute_time_t until = make_timeout_time_ms(timeout_ms);
    while (!time_reached(until)) {
        if (g_time_synced) {
            sntp_stop();
            return true;
        }

        #if defined(PICO_CYW43_ARCH_POLL)
            cyw43_arch_poll();
            sys_check_timeouts();
        #endif

        sleep_ms(200);
    }

    sntp_stop();
    return false;
}

static datetime_t epoch_to_datetime_utc(time_t t) {
    struct tm tm_utc;
    gmtime_r(&t, &tm_utc);

    datetime_t dt = {
        .year  = (int16_t)(tm_utc.tm_year + 1900),
        .month = (int8_t) (tm_utc.tm_mon + 1),
        .day   = (int8_t) tm_utc.tm_mday,
        .hour  = (int8_t) tm_utc.tm_hour,
        .min   = (int8_t) tm_utc.tm_min,
        .sec   = (int8_t) tm_utc.tm_sec
    };
    return dt;
}

bool ntp_correct_rtc_blocking(i2c_inst_t *i2c, uint8_t rtc_addr, uint32_t timeout_ms) {
    printf("NTP sync (IP=%s)...\n", NTP_SERVER_IP);

    if (!ntp_sync_system_time_blocking(timeout_ms)) {
        printf("SNTP timeout\n");
        return false;
    }

    time_t now = time(NULL);
    printf("System time synced: %ld\n", (long)now);

    if (now < 1700000000) {
        printf("System time looks invalid\n");
        return false;
    }

    datetime_t dt = epoch_to_datetime_utc(now);

    bool ok = rtc_pcf8563_set_datetime(i2c, rtc_addr, &dt);
    printf("RTC set %s: %04u-%02u-%02u %02u:%02u:%02uZ\n",
           ok ? "OK" : "FAIL",
           dt.year, dt.month, dt.day, dt.hour, dt.min, dt.sec);

    return ok;
}