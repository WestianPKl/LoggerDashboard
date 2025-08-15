
/**
 * @file rtc_clock.hpp
 * @brief Interface for PCF8563T RTC clock functions using I2C on Raspberry Pi Pico.
 *
 * Provides initialization, time setting/reading, clock output, and alarm management
 * for the PCF8563T real-time clock via I2C.
 *
 * Functions:
 * - pcf8563t_init: Initialize the PCF8563T RTC on the specified I2C instance.
 * - pcf8563t_set_time: Set the current time and date on the RTC.
 * - pcf8563t_read_time: Read the current time and date from the RTC.
 * - pcf8563t_set_clkout_1hz: Enable or disable the 1Hz clock output.
 * - rtc_alarm_set: Configure the RTC alarm with specified time and enable/disable status.
 * - rtc_alarm_enable: Enable or disable the RTC alarm.
 * - rtc_alarm_flag_clear: Clear the RTC alarm flag.
 *
 * @note All functions require a pointer to the I2C instance used for communication.
 */
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