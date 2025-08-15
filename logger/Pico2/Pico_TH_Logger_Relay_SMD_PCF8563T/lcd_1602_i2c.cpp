#include <string.h>
#include "hardware/i2c.h"
#include "lcd_1602_i2c.hpp"

void i2c_write_byte(uint8_t);
void lcd_toggle_enable(uint8_t);
void lcd_send_byte(uint8_t , int);
static inline void lcd_char(char);

/**
 * @brief Writes a single byte to the I2C device at the specified address.
 *
 * This function sends the provided byte value over the I2C bus using the default I2C instance.
 * The operation is performed only if the `i2c_default` macro is defined.
 *
 * @param val The byte value to write to the I2C device.
 */
void i2c_write_byte(uint8_t val) {
#ifdef i2c_default
    i2c_write_blocking(i2c_default, addr, &val, 1, false);
#endif
}

/**
 * @brief Toggles the enable bit on the LCD to latch data/commands.
 *
 * This function generates the necessary enable pulse for the LCD by setting and clearing
 * the LCD_ENABLE_BIT in the provided value. It introduces delays before and after toggling
 * to ensure proper timing as required by the LCD controller.
 *
 * @param val The value to be sent to the LCD, typically containing data or command bits.
 */
void lcd_toggle_enable(uint8_t val) {
#define DELAY_US 600
    sleep_us(DELAY_US);
    i2c_write_byte(val | LCD_ENABLE_BIT);
    sleep_us(DELAY_US);
    i2c_write_byte(val & ~LCD_ENABLE_BIT);
    sleep_us(DELAY_US);
}

/**
 * @brief Sends a byte to the LCD over I2C, splitting it into high and low nibbles.
 *
 * This function prepares the given byte by splitting it into high and low nibbles,
 * adds the specified mode (command or data), and includes the LCD backlight flag.
 * Each nibble is sent sequentially to the LCD via I2C, with enable toggling to latch the data.
 *
 * @param val  The byte value to send to the LCD.
 * @param mode The mode flag (e.g., command or data) to specify the type of transmission.
 */
void lcd_send_byte(uint8_t val, int mode) {
    uint8_t high = mode | (val & 0xF0) | LCD_BACKLIGHT;
    uint8_t low = mode | ((val << 4) & 0xF0) | LCD_BACKLIGHT;
    i2c_write_byte(high);
    lcd_toggle_enable(high);
    i2c_write_byte(low);
    lcd_toggle_enable(low);
}

/**
 * @brief Clears all content displayed on the LCD screen.
 *
 * Sends the clear display command to the LCD, removing all characters and resetting the cursor position.
 */
void lcd_clear() {
    lcd_send_byte(LCD_CLEARDISPLAY, LCD_COMMAND);
}

/**
 * @brief Sets the cursor position on a 16x2 LCD display using I2C.
 *
 * This function positions the cursor at the specified line and position
 * on the LCD. Line 0 corresponds to the first row, and line 1 to the second row.
 *
 * @param line The line number (0 for first row, 1 for second row).
 * @param position The position on the line (0-based index).
 */
void lcd_set_cursor(int line, int position) {
    int val = (line == 0) ? 0x80 + position : 0xC0 + position;
    lcd_send_byte(val, LCD_COMMAND);
}

/**
 * @brief Sends a single character to the LCD display.
 *
 * This function writes the specified character to the LCD module
 * via the I2C interface. It is intended for internal use within
 * the LCD driver and is marked as inline for performance.
 *
 * @param val The character to be displayed on the LCD.
 */
static inline void lcd_char(char val) {
    lcd_send_byte(val, LCD_CHARACTER);
}

/**
 * @brief Displays a null-terminated string on the LCD.
 *
 * Iterates through each character in the provided string and sends it to the LCD
 * using the lcd_char function.
 *
 * @param s Pointer to a null-terminated string to be displayed on the LCD.
 */
void lcd_string(const char *s) {
    while (*s) {
        lcd_char(*s++);
    }
}

/**
 * @brief Initializes the LCD display in 4-bit mode with the desired configuration.
 *
 * This function sends the necessary command sequence to the LCD to:
 * - Set the interface to 4-bit mode.
 * - Configure the display for 2 lines.
 * - Set the entry mode to increment and no shift.
 * - Turn on the display.
 * - Clear the display.
 *
 * It must be called before using any other LCD functions.
 */
void lcd_init() {
    lcd_send_byte(0x03, LCD_COMMAND);
    lcd_send_byte(0x03, LCD_COMMAND);
    lcd_send_byte(0x03, LCD_COMMAND);
    lcd_send_byte(0x02, LCD_COMMAND);
    lcd_send_byte(LCD_ENTRYMODESET | LCD_ENTRYLEFT, LCD_COMMAND);
    lcd_send_byte(LCD_FUNCTIONSET | LCD_2LINE, LCD_COMMAND);
    lcd_send_byte(LCD_DISPLAYCONTROL | LCD_DISPLAYON, LCD_COMMAND);
    lcd_clear();
}