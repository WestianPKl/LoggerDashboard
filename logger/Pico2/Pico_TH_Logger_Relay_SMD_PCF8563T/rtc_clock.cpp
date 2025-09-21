#include "rtc_clock.hpp"
#include <stdio.h>

#define PCF8563_I2C_ADDR 0x51

/**
 * @brief Converts an unsigned decimal value to packed BCD (Binary-Coded Decimal).
 *
 * Transforms a base-10 value in the range 0–99 into packed BCD, where the upper nibble
 * encodes the tens digit and the lower nibble encodes the ones digit. This format is
 * commonly required by RTC devices and other peripherals that store numeric fields in BCD.
 *
 * @param val Decimal value to convert (expected range: 0–99).
 * @return Packed BCD representation of the input value (e.g., 42 -> 0x42, 7 -> 0x07).
 *
 * @note No range checking is performed. Values greater than 99 will produce an invalid
 *       or non-standard BCD encoding.
 */
uint8_t dec2bcd(uint8_t val) { return ((val / 10) << 4) | (val % 10); }


/**
 * @brief Convert a packed BCD (Binary-Coded Decimal) byte to its decimal value.
 *
 * @param val Packed BCD value (upper nibble = tens, lower nibble = ones). Expected range: 0x00–0x99.
 * @return Decimal value in the range 0–99 corresponding to the BCD input.
 *
 * @note The function does not validate that each nibble is a valid decimal digit (0–9);
 *       non-BCD inputs will yield a numerically computed but semantically invalid result.
 * @remark Commonly used to decode BCD-encoded RTC register fields (e.g., seconds/minutes).
 */
uint8_t bcd2dec(uint8_t val) { return ((val >> 4) * 10) + (val & 0x0F); }

/**
 * Initializes the PCF8563T real-time clock over I2C and enables a 1 Hz clock output.
 *
 * This routine:
 * - Writes 0x00 to control/status registers 0x00 and 0x01 to place the device in normal mode,
 *   disable test/interrupt sources, and clear any pending flags.
 * - Enables a 1 Hz square-wave on the CLKOUT pin via pcf8563t_set_clkout_1hz(..., true).
 *
 * Notes:
 * - The I2C peripheral must be initialized and configured (pins, speed) before calling.
 * - The device address is taken from PCF8563_I2C_ADDR, which must be defined elsewhere.
 * - Uses blocking I2C transfers and does not check or return error codes from the bus.
 * - This function does not set the current date/time registers.
 *
 * Potential side effects:
 * - Drives the PCF8563T CLKOUT pin at 1 Hz, which may impact power consumption and pin muxing.
 *
 * Thread-safety:
 * - Not thread-safe if the same I2C instance is shared without external synchronization.
 *
 * @param i2c Pointer to the initialized I2C instance (e.g., i2c0 or i2c1) connected to the RTC.
 */
void pcf8563t_init(i2c_inst_t *i2c){
    uint8_t buf1[] = {0x00, 0x00};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf1, 2, false);
    uint8_t buf2[] = {0x01, 0x00};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf2, 2, false);
    pcf8563t_set_clkout_1hz(i2c, true);
}

/**
 * @brief Set the current date and time on a PCF8563T RTC over I2C.
 *
 * Encodes the supplied date/time fields into BCD and writes RTC registers 0x02..0x08
 * in the order: seconds, minutes, hours, day-of-month, weekday, month (with century),
 * and year (00–99). The seconds VL (validity) flag is cleared, hours are encoded in
 * 24-hour format, and the month register’s century bit is set for years in 1900–1999.
 *
 * Ranges and encoding:
 * - sec: 0–59 (BCD), stored in 7 bits; VL bit (bit7) is forced to 0.
 * - min: 0–59 (BCD), stored in 7 bits.
 * - hour: 0–23 (BCD), stored in 6 bits (24-hour).
 * - day_of_week: 0–6 (BCD), stored in 3 bits; mapping is application-defined.
 * - day_of_month: 1–31 (BCD), stored in 6 bits.
 * - month: 1–12 (BCD), stored in 5 bits; month bit7 is the century flag (C).
 * - year: full year as 1900–2099; internally reduced to 00–99 (BCD).
 *   - 2000–2099: C=0 and year = year - 2000.
 *   - 1900–1999: C=1 and year = year - 1900.
 *   - Other years: clamped to 00 with C=1.
 *
 * @param i2c          Pointer to an initialized I2C instance.
 * @param sec          Seconds [0..59].
 * @param min          Minutes [0..59].
 * @param hour         Hours [0..23].
 * @param day_of_week  Day of week [0..6] (application convention).
 * @param day_of_month Day of month [1..31].
 * @param month        Month [1..12].
 * @param year         Full year (e.g., 2025). Supported window: 1900–2099.
 *
 * @return true if all I2C writes succeed; false if any write fails.
 *
 * @pre The I2C bus must be initialized, the PCF8563T must be present at PCF8563_I2C_ADDR,
 *      and the provided fields must be within valid ranges.
 * @note No runtime validation beyond bitfield masking is performed; invalid inputs may
 *       produce undefined RTC state. Each register write issues a STOP condition.
 */
bool pcf8563t_set_time(i2c_inst_t *i2c, uint sec, uint min, uint hour,
                       uint day_of_week, uint day_of_month,
                       uint month, uint year) {
    uint8_t bcd_sec    = dec2bcd(sec)  & 0x7F; // VL=0
    uint8_t bcd_min    = dec2bcd(min)  & 0x7F;
    uint8_t bcd_hour   = dec2bcd(hour) & 0x3F;
    uint8_t bcd_day    = dec2bcd(day_of_month) & 0x3F;
    uint8_t bcd_weekday= dec2bcd(day_of_week)  & 0x07;
    uint8_t bcd_month  = dec2bcd(month) & 0x1F;
    if (year >= 2000) {
        year -= 2000;
    } else {
        bcd_month |= 0x80;
        year = (year >= 1900) ? year - 1900 : 0;
    }
    uint8_t bcd_year = dec2bcd(year);

    uint8_t current_val[7] = {
        bcd_sec, bcd_min, bcd_hour, bcd_day, bcd_weekday, bcd_month, bcd_year
    };

    uint8_t buf[2];
    for (int i = 0; i < 7; ++i) {
        buf[0] = (uint8_t)(0x02 + i);
        buf[1] = current_val[i];
        int wr = i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 2, false);
        if (wr < 0) return false;
    }
    return true;
}

/**
 * @brief Read current time from a PCF8563/PCF8563T RTC over I2C and convert BCD fields to integers.
 *
 * Reads 7 bytes starting at register 0x02 (seconds..years). If the VL (Voltage Low/oscillator stopped)
 * flag is set in the seconds register, the function reports failure.
 *
 * Output layout (converted_time must have size >= 7):
 *   [0] seconds  (0–59)
 *   [1] minutes  (0–59)
 *   [2] hours    (0–23)
 *   [3] day      (1–31)
 *   [4] weekday  (0–6, 0 = Sunday per PCF8563)
 *   [5] month    (1–12)
 *   [6] year     (full year, e.g., 2025)
 *
 * All fields are decoded from BCD. The century is derived from the Century bit (bit 7) in the Months register:
 *   - 0 => year = 2000 + YY
 *   - 1 => year = 1900 + YY
 *
 * @param i2c            Initialized Pico SDK I2C instance to use for the transaction.
 * @param converted_time Pointer to an array of at least 7 uint16_t elements to receive the decoded time.
 * @return true on success; false if the I2C transfer fails or if the VL flag indicates invalid time.
 *
 * @note Performs a write of the start register followed by a read (repeated-start).
 * @warning Returns false if the oscillator has stopped (VL=1); time must be set before reliable reads.
 */
bool pcf8563t_read_time(i2c_inst_t *i2c, uint16_t *converted_time) {
    uint8_t buffer[7];
    uint8_t addr = 0x02;
    int wr = i2c_write_blocking(i2c, PCF8563_I2C_ADDR, &addr, 1, true);
    if (wr < 0) return false;
    int rr = i2c_read_blocking(i2c, PCF8563_I2C_ADDR, buffer, 7, false);
    if (rr < 0) return false;

    if (buffer[0] & 0x80) {
        return false;
    }

    converted_time[0] = bcd2dec(buffer[0] & 0x7F); // sec
    converted_time[1] = bcd2dec(buffer[1] & 0x7F); // min
    converted_time[2] = bcd2dec(buffer[2] & 0x3F); // hour
    converted_time[3] = bcd2dec(buffer[3] & 0x3F); // day
    converted_time[4] = bcd2dec(buffer[4] & 0x07); // weekday
    converted_time[5] = bcd2dec(buffer[5] & 0x1F); // month

    if (buffer[5] & 0x80) {
        converted_time[6] = 1900 + bcd2dec(buffer[6]);
    } else {
        converted_time[6] = 2000 + bcd2dec(buffer[6]);
    }
    return true;
}

/**
 * @brief Configures the PCF8563T CLKOUT pin for a 1 Hz square wave or disables it.
 *
 * Writes the CLKOUT control register (0x0D) on the PCF8563T:
 * - When enable is true: sets CLKOUT_EN (bit 7) and COF[1:0] = 0b11 to output 1 Hz.
 * - When enable is false: writes 0x00 to disable CLKOUT (pin becomes high-impedance).
 *
 * This function performs a blocking I2C write and issues a STOP condition.
 *
 * Preconditions:
 * - The provided I2C instance is initialized and connected to the PCF8563T.
 * - PCF8563_I2C_ADDR matches the device address on the bus.
 *
 * Notes:
 * - The entire CLKOUT control register is overwritten; any previous CLKOUT configuration is lost.
 * - No error handling is performed here; I2C write failures are not reported to the caller.
 *
 * @param i2c Pointer to the initialized I2C instance used to communicate with the RTC.
 * @param enable Set to true to enable 1 Hz on CLKOUT; set to false to disable CLKOUT.
 */
void pcf8563t_set_clkout_1hz(i2c_inst_t *i2c, bool enable) {
    uint8_t val = enable ? 0x80 | 0x03 : 0x00;
    uint8_t buf[] = {0x0D, val};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 2, false);
}

/**
 * Configure the PCF8563 alarm registers (minute, hour, day, weekday) and write them over I2C.
 *
 * Behavior:
 * - Values are converted to BCD and masked to the PCF8563 field widths.
 * - For minute/hour/day, passing 0xFF disables matching for that field (AEN bit set).
 * - Weekday matching is controlled by use_weekday:
 *   - If true, the 'weekday' parameter (0–6 per PCF8563) is written to the weekday alarm register.
 *   - If false, the weekday alarm register is disabled (AEN bit set) regardless of 'weekday'.
 * - The PCF8563 alarm asserts only when all enabled fields match the current time.
 *   This means if both a valid 'day' and use_weekday=true are provided, both must match to trigger.
 *
 * I2C transfer:
 * - Writes a 5-byte sequence starting at register 0x09 (minute alarm), followed by hour, day, and weekday.
 * - The transfer is performed with i2c_write_blocking to PCF8563_I2C_ADDR.
 *
 * Parameters:
 * - i2c:       RP2040 I2C instance to use.
 * - min:       0–59, or 0xFF to disable minute match.
 * - hour:      0–23, or 0xFF to disable hour match.
 * - day:       1–31, or 0xFF to disable day-of-month match.
 * - weekday:   0–6 (per PCF8563) when use_weekday is true; ignored when use_weekday is false.
 * - use_weekday: If true, enable weekday-based matching; if false, disable weekday matching.
 *
 * Notes:
 * - Field masks: minute uses 7 bits, hour 6 bits, day 6 bits, weekday 3 bits; bit 7 is the AEN disable bit.
 * - Invalid ranges are not validated here; the caller must provide values within the listed ranges.
 */
void rtc_alarm_set(i2c_inst_t *i2c, uint8_t min, uint8_t hour,
                   uint8_t day, uint8_t weekday, bool use_weekday) {
    uint8_t alarm_min  = (min  == 0xFF) ? 0x80 : (dec2bcd(min)  & 0x7F);
    uint8_t alarm_hour = (hour == 0xFF) ? 0x80 : (dec2bcd(hour) & 0x3F);
    uint8_t alarm_day  = (day  == 0xFF) ? 0x80 : (dec2bcd(day)  & 0x3F);
    uint8_t alarm_wday;
    if (weekday == 0xFF) {
        alarm_wday = 0x80;
    } else {
        alarm_wday = dec2bcd(weekday) & 0x07;
    }

    uint8_t seq[5] = {
        0x09, alarm_min, alarm_hour, alarm_day, (use_weekday ? (alarm_wday & 0x07) : 0x80)
    };
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, seq, 5, false);
}

/**
 * @brief Enable or disable the PCF8563 alarm interrupt.
 *
 * Reads the Control/Status 2 register (0x01) of the PCF8563 RTC, sets or clears
 * the Alarm Interrupt Enable (AIE) bit (bit 1) based on the requested state,
 * and writes the register back, preserving all other bits.
 *
 * @param i2c    Initialized I2C instance used to communicate with the RTC.
 * @param enable True to enable the alarm interrupt (set AIE); false to disable it (clear AIE).
 *
 * @note This performs a read-modify-write via I2C using a repeated start for the read.
 *       No error checking is performed on I2C transactions; consider handling return values
 *       in production code.
 *
 * @pre The I2C bus must be initialized and the PCF8563 accessible at PCF8563_I2C_ADDR.
 *
 * @see NXP PCF8563/PCF8563T datasheet, Control/Status 2 register (address 0x01), AIE bit (bit 1).
 */
void rtc_alarm_enable(i2c_inst_t *i2c, bool enable) {
    uint8_t addr = 0x01;
    uint8_t val;
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, &addr, 1, true);
    i2c_read_blocking(i2c, PCF8563_I2C_ADDR, &val, 1, false);

    if (enable) val |=  (1 << 1);
    else        val &= ~(1 << 1);

    uint8_t buf[] = {0x01, val};
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 2, false);
}

/**
 * Clears the PCF8563 RTC alarm flag (AF) if it is set and reports its prior state.
 *
 * This function reads the Control/Status 2 register (address 0x01) of the PCF8563,
 * checks the Alarm Flag (bit 3), and, if set, writes the register back with AF cleared.
 * All other bits in the register are preserved.
 *
 * Parameters:
 *  - i2c: Pointer to the initialized I2C instance configured for the PCF8563 device.
 *
 * Returns:
 *  - true if the alarm flag was set before this call (and is now cleared).
 *  - false if the alarm flag was not set.
 *
 * Notes:
 *  - Assumes PCF8563_I2C_ADDR is defined and the I2C bus is initialized.
 *  - No explicit error handling is performed; I2C failures may leave the flag uncleared.
 */
bool rtc_alarm_flag_clear(i2c_inst_t *i2c) {
    uint8_t addr = 0x01, val;
    i2c_write_blocking(i2c, PCF8563_I2C_ADDR, &addr, 1, true);
    i2c_read_blocking(i2c, PCF8563_I2C_ADDR, &val, 1, false);
    bool was_set = (val & (1 << 3)) != 0;
    if (was_set) {
        val &= ~(1 << 3);
        uint8_t buf[] = {0x01, val};
        i2c_write_blocking(i2c, PCF8563_I2C_ADDR, buf, 2, false);
    }
    return was_set;
}