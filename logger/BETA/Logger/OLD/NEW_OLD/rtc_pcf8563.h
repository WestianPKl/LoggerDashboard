#pragma once
#include <stdint.h>
#include "hardware/i2c.h"

typedef struct {
    uint16_t year;
    uint8_t  month, day, hour, min, sec;
} rtc_time_t;

uint8_t rtc_get(i2c_inst_t *i2c, uint8_t addr, rtc_time_t *t);
uint8_t rtc_set(i2c_inst_t *i2c, uint8_t addr, const rtc_time_t *t);