#pragma once
#include "hardware/i2c.h"

void i2c_bus_init(i2c_inst_t *i2c, uint sda_pin, uint scl_pin, uint baudrate);