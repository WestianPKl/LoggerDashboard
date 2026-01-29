#pragma once
#include <stdint.h>
#include <stdbool.h>
#include "hardware/i2c.h"

bool ntp_correct_rtc_blocking(i2c_inst_t *i2c, uint8_t rtc_addr, uint32_t timeout_ms);