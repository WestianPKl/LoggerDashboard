#pragma once
#include <stdbool.h>
#include <stdint.h>
#include "hardware/i2c.h"

typedef struct __attribute__((packed)) {
    uint32_t magic;
    uint16_t version;
    uint16_t sample_period_ms;
    char pub_topic[32];
    char sub_topic[32];
    uint32_t crc;
} settings_t;

void settings_defaults(settings_t *s);
bool settings_load(i2c_inst_t *i2c, uint8_t eeprom_addr, settings_t *s);
bool settings_save(i2c_inst_t *i2c, uint8_t eeprom_addr, const settings_t *s);