#pragma once
#include <stddef.h>
#include <stdint.h>
#include "hardware/i2c.h"

#define EEPROM_PAGE_SIZE  32
#define EEPROM_TOTAL_SIZE 4096

uint8_t eeprom_read(i2c_inst_t *i2c, uint8_t addr, uint16_t mem, uint8_t *buf, size_t len);
uint8_t eeprom_write(i2c_inst_t *i2c, uint8_t addr, uint16_t mem, const uint8_t *buf, size_t len);
uint8_t eeprom_erase(i2c_inst_t *i2c, uint8_t addr);