
#ifndef __RTC_CLOCK_HPP__
#define __RTC_CLOCK_HPP__

#include "hardware/i2c.h"

void pcf8563t_init(i2c_inst_t *);
bool pcf8563t_set_time(i2c_inst_t *, uint, uint, uint, uint, uint, uint, uint);
bool pcf8563t_read_time(i2c_inst_t *, uint16_t *);
void pcf8563t_set_clkout_1hz(i2c_inst_t *, bool);
void rtc_alarm_set(i2c_inst_t *, uint8_t, uint8_t, uint8_t, uint8_t, uint8_t, bool);
void rtc_alarm_enable(i2c_inst_t *, bool);
bool rtc_alarm_flag_clear(i2c_inst_t *);

#endif /* __RTC_CLOCK_HPP__ */