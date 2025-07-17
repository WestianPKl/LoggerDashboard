#include "rtc_clock.hpp"
#include <stdio.h>

#define PCF8563_I2C_ADDR 0x51

uint8_t dec2bcd(uint8_t val) {
	return ((val / 10 ) << 4) | (val % 10);
}

uint8_t bcd2dec(uint8_t val) {
	return ((val >> 4) * 10) + (val & 0x0F);
}

void pcf8563t_init(i2c_inst_t *i2c){
    uint8_t buf1[] = {0x00, 0x00};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf1, 2, false);
    uint8_t buf2[] = {0x01, 0x00};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf2, 2, false);
    pcf8563t_set_clkout_1hz(i2c, true);
}

bool pcf8563t_set_time(i2c_inst_t *i2c, uint sec, uint min, uint hour,
                    uint day_of_week, uint day_of_month,
                    uint month, uint year) {
    uint8_t bcd_sec = dec2bcd(sec) & 0x7F;
    uint8_t bcd_min = dec2bcd(min) & 0x7F;
    uint8_t bcd_hour = dec2bcd(hour) & 0x3F;
    uint8_t bcd_day = dec2bcd(day_of_month) & 0x3F;
    uint8_t bcd_weekday = dec2bcd(day_of_week) & 0x07;
    uint8_t bcd_month = dec2bcd(month) & 0x1F;
    if (year >= 2000) {
        year -= 2000;
        bcd_month |= 0x00;
    } else {
        bcd_month |= 0x80;
        year = (year >= 1900) ? year - 1900 : 0;
    }
    uint8_t bcd_year = dec2bcd(year);
    uint8_t current_val[7] = {
        bcd_sec, bcd_min, bcd_hour,
        bcd_day, bcd_weekday, bcd_month, bcd_year
    };
    uint8_t buf[2];
    for (int i = 0; i < 7; ++i) {
        buf[0] = 0x02 + i;
        buf[1] = current_val[i];
        int write_result = i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 2, false);
        if (write_result < 0) return false;
    }
    return true;
}

bool pcf8563t_read_time(i2c_inst_t *i2c, uint16_t *converted_time) {
    uint8_t buffer[7];
    uint8_t val = 0x02;
    int write_result = i2c_write_blocking(i2c, PCF8563_I2C_ADDR, &val, 1, true);
    if (write_result < 0) return false;
    int read_result = i2c_read_blocking(i2c, PCF8563_I2C_ADDR, buffer, 7, false);
    if (read_result < 0) return false;
    converted_time[0] = bcd2dec(buffer[0] & 0x7F);
    converted_time[1] = bcd2dec(buffer[1] & 0x7F);
    converted_time[2] = bcd2dec(buffer[2] & 0x3F);
    converted_time[3] = bcd2dec(buffer[3] & 0x3F);
    converted_time[4] = bcd2dec(buffer[4] & 0x07);
    converted_time[5] = bcd2dec(buffer[5] & 0x1F);
    if (buffer[5] & 0x80) {
        converted_time[6] = 1900 + bcd2dec(buffer[6]);
    } else {
        converted_time[6] = 2000 + bcd2dec(buffer[6]);
    }
    return true;
}

void pcf8563t_set_clkout_1hz(i2c_inst_t *i2c, bool enable) {
    // CLKOUT freq = 1Hz when bits = 0b11 (mask 0x83)
    if (enable) {
        uint8_t buf[] = {0x0D, 0x83};
        i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 2, false);
    } else {
        uint8_t buf[] = {0x0D, 0x00};
        i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 2, false);
    }
}

void rtc_alarm_set(i2c_inst_t *i2c, uint8_t sec, uint8_t min, uint8_t hour,
                uint8_t day, uint8_t weekday, bool use_weekday) {
    uint8_t buf[2];
    uint8_t alarm_sec = (sec == 0xFF) ? 0x80 : dec2bcd(sec) & 0x7F;
    uint8_t alarm_min = (min == 0xFF) ? 0x80 : dec2bcd(min) & 0x7F;
    uint8_t alarm_hour = (hour == 0xFF) ? 0x80 : dec2bcd(hour) & 0x3F;
    uint8_t alarm_day = (day == 0xFF) ? 0x80 : dec2bcd(day) & 0x3F;
    uint8_t alarm_wday = (weekday == 0xFF) ? 0x80 : dec2bcd(weekday) & 0x07;
    if (use_weekday)
        alarm_wday |= 0x80;
    uint8_t alarm_val[4] = {alarm_sec, alarm_min, alarm_hour, use_weekday ? alarm_wday : alarm_day};
    for (int i = 10; i < 14; ++i) {
        buf[0] = (uint8_t) i;
        buf[1] = alarm_val[i - 10];
        i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 2, false);
    }
}

void rtc_alarm_enable(i2c_inst_t *i2c, bool enable) {
    uint8_t status[1];
    uint8_t val = 0x01;
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, &val, 1, true);
    i2c_read_blocking(i2c, PCF8563_I2C_ADDR, status, 1, false);
    if (enable) {
        status[0] |= (1 << 3);
    } else {
        status[0] &= ~(1 << 3);
    }
    uint8_t buf[] = {0x01, status[0]};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 1, true);
}

bool rtc_alarm_flag_clear(i2c_inst_t *i2c) {
    uint8_t status[1];
    uint8_t val = 0x01;
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, &val, 1, true);
    i2c_read_blocking(i2c, PCF8563_I2C_ADDR, status, 1, false);
    if ((status[0] & 0x08) == 0x08) {
        return true;
    } else {
        return false;
    }
}