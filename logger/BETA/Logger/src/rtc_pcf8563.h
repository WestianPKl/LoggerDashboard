#pragma once
#include <stdbool.h>
#include <stdint.h>
#include "hardware/i2c.h"

typedef struct {
    uint16_t year;  // 2000..2099
    uint8_t month;  // 1..12
    uint8_t day;    // 1..31
    uint8_t hour;   // 0..23
    uint8_t min;    // 0..59
    uint8_t sec;    // 0..59
} datetime_t;

bool rtc_pcf8563_get_datetime(i2c_inst_t *i2c, uint8_t addr, datetime_t *out);
bool rtc_pcf8563_set_datetime(i2c_inst_t *i2c, uint8_t addr, const datetime_t *dt);