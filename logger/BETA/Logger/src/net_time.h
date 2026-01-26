#pragma once
#include <stdint.h>
#include <stdbool.h>
#include "hardware/i2c.h"

// Synchronizuje czas systemowy z NTP (Windows NTP w LAN) i ustawia RTC PCF8563.
// timeout_ms: maks. czas czekania na SNTP
bool ntp_correct_rtc_blocking(i2c_inst_t *i2c, uint8_t rtc_addr, uint32_t timeout_ms);