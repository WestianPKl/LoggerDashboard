#ifndef NET_TIME_H
#define NET_TIME_H

#include <stdint.h>

typedef struct {
    uint8_t year;
    uint8_t month;
    uint8_t day;
    uint8_t hour;
    uint8_t min;
    uint8_t sec;
} ntp_time_t;

uint8_t ntp_sync(uint32_t timeout_ms);
uint8_t ntp_get_time(ntp_time_t *t);

#endif