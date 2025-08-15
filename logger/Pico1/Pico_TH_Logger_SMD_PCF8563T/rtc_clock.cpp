#include "rtc_clock.hpp"
#include <stdio.h>

#define PCF8563_I2C_ADDR 0x51

/**
 * @brief Converts a decimal value to its Binary-Coded Decimal (BCD) representation.
 *
 * This function takes an 8-bit unsigned integer representing a decimal value (0-99)
 * and converts it to its equivalent BCD format. In BCD, each nibble (4 bits) of a byte
 * represents a decimal digit.
 *
 * @param val The decimal value to convert (expected range: 0-99).
 * @return uint8_t The BCD representation of the input value.
 */
uint8_t dec2bcd(uint8_t val) {
	return ((val / 10 ) << 4) | (val % 10);
}

/**
 * @brief Converts a Binary-Coded Decimal (BCD) value to its decimal equivalent.
 *
 * This function takes an 8-bit BCD value and converts it to the corresponding
 * decimal value. BCD encodes each decimal digit with its own 4 bits.
 *
 * @param val The BCD value to convert.
 * @return The decimal representation of the input BCD value.
 */
uint8_t bcd2dec(uint8_t val) {
	return ((val >> 4) * 10) + (val & 0x0F);
}

/**
 * @brief Initializes the PCF8563T RTC device via I2C.
 *
 * This function sets up the PCF8563T real-time clock by writing to its control registers
 * to ensure it is in a known state and enables the 1Hz clock output.
 *
 * @param i2c Pointer to the I2C instance used for communication with the PCF8563T.
 */
void pcf8563t_init(i2c_inst_t *i2c){
    uint8_t buf1[] = {0x00, 0x00};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf1, 2, false);
    uint8_t buf2[] = {0x01, 0x00};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf2, 2, false);
    pcf8563t_set_clkout_1hz(i2c, true);
}

/**
 * @brief Sets the current time and date on the PCF8563T RTC device.
 *
 * This function writes the provided time and date values to the PCF8563T
 * real-time clock (RTC) over I2C. The values are converted to BCD format
 * and written to the appropriate registers. The year is handled for both
 * 1900-based and 2000-based values, with the century bit set accordingly.
 *
 * @param i2c           Pointer to the I2C instance to use for communication.
 * @param sec           Seconds (0-59).
 * @param min           Minutes (0-59).
 * @param hour          Hours (0-23).
 * @param day_of_week   Day of the week (0-6, where 0 = Sunday).
 * @param day_of_month  Day of the month (1-31).
 * @param month         Month (1-12).
 * @param year          Full year (e.g., 2024).
 * @return true if the time was successfully set, false otherwise.
 */
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

/**
 * @brief Reads the current time from the PCF8563T RTC over I2C and converts it to decimal format.
 *
 * This function communicates with the PCF8563T real-time clock (RTC) via the provided I2C instance.
 * It reads the time registers, converts the BCD-encoded values to decimal, and stores them in the
 * provided array. The time values are stored in the following order:
 *   converted_time[0] - Seconds (0-59)
 *   converted_time[1] - Minutes (0-59)
 *   converted_time[2] - Hours (0-23)
 *   converted_time[3] - Day of month (1-31)
 *   converted_time[4] - Weekday (0-6)
 *   converted_time[5] - Month (1-12)
 *   converted_time[6] - Year (full year, e.g., 2024)
 *
 * @param i2c Pointer to the I2C instance to use for communication.
 * @param converted_time Pointer to an array of at least 7 uint16_t elements where the decoded time will be stored.
 * @return true if the time was successfully read and converted, false otherwise.
 */
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

/**
 * @brief Enables or disables the 1Hz clock output on the PCF8563T RTC.
 *
 * This function configures the CLKOUT pin of the PCF8563T real-time clock to output a 1Hz signal
 * when enabled, or disables the clock output when not enabled. It writes to the CLKOUT control register
 * (address 0x0D) via I2C.
 *
 * @param i2c Pointer to the I2C instance to use for communication.
 * @param enable Set to true to enable 1Hz clock output, false to disable.
 */
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

/**
 * @brief Sets the alarm time on the PCF8563 RTC via I2C.
 *
 * Configures the alarm registers of the PCF8563 real-time clock with the specified
 * time values. Each parameter can be set to 0xFF to disable matching for that field.
 * The function supports both day and weekday alarms, depending on the use_weekday flag.
 *
 * @param i2c         Pointer to the I2C instance to use for communication.
 * @param sec         Alarm seconds (0-59), or 0xFF to disable seconds matching.
 * @param min         Alarm minutes (0-59), or 0xFF to disable minutes matching.
 * @param hour        Alarm hours (0-23), or 0xFF to disable hours matching.
 * @param day         Alarm day of month (1-31), or 0xFF to disable day matching.
 * @param weekday     Alarm weekday (0-6), or 0xFF to disable weekday matching.
 * @param use_weekday If true, set alarm based on weekday; if false, use day of month.
 */
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

/**
 * @brief Enables or disables the alarm interrupt on the PCF8563 RTC.
 *
 * This function reads the current value of the control/status register,
 * modifies the alarm interrupt enable bit (bit 3), and writes the updated
 * value back to the register. When enabled, the RTC will generate an
 * interrupt when the alarm condition is met.
 *
 * @param i2c    Pointer to the I2C instance used for communication.
 * @param enable Set to true to enable the alarm interrupt, false to disable it.
 */
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

/**
 * @brief Clears and checks the alarm flag of the PCF8563 RTC via I2C.
 *
 * This function writes to the PCF8563 RTC to access the status register,
 * then reads the status register to check if the alarm flag (AF, bit 3) is set.
 *
 * @param i2c Pointer to the I2C instance used for communication.
 * @return true if the alarm flag is set (AF bit is 1), false otherwise.
 */
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