/**
 * @file lcd_1602_i2c.hpp
 * @brief Public API and command/flag definitions for a 16x2 HD44780-compatible LCD over I2C.
 * @details
 *   Provides symbolic command codes, bit flags, and a minimal set of helper functions to:
 *   - Initialize the LCD
 *   - Position the cursor
 *   - Print text
 *   - Clear the display
 *
 *   Typical modules use an I2C backpack at address 0x27. Adjust the address if your hardware differs.
 */

/**
 * @var LCD_CLEARDISPLAY
 * @brief Command: Clear the display and reset DDRAM address to 0. Cursor returns to home (0,0).
 * @note Execution time is relatively long (≈1.5–2 ms); avoid calling in tight loops.
 */

/**
 * @var LCD_RETURNHOME
 * @brief Command: Return cursor to home (0,0) without clearing display contents.
 */

/**
 * @var LCD_ENTRYMODESET
 * @brief Command: Set text entry mode (combine with LCD_ENTRYLEFT and/or LCD_ENTRYSHIFTINCREMENT).
 */

/**
 * @var LCD_DISPLAYCONTROL
 * @brief Command: Control display, cursor, and blink (combine with LCD_DISPLAYON, LCD_CURSORON, LCD_BLINKON).
 */

/**
 * @var LCD_CURSORSHIFT
 * @brief Command: Move cursor or shift the display (combine with LCD_DISPLAYMOVE and LCD_MOVERIGHT).
 */

/**
 * @var LCD_FUNCTIONSET
 * @brief Command: Set interface data length, number of display lines, and font (combine with LCD_8BITMODE, LCD_2LINE, LCD_5x10DOTS).
 */

/**
 * @var LCD_SETCGRAMADDR
 * @brief Command: Set CGRAM address to define custom characters.
 */

/**
 * @var LCD_SETDDRAMADDR
 * @brief Command: Set DDRAM address (cursor position on the visible display).
 */

/**
 * @var LCD_ENTRYSHIFTINCREMENT
 * @brief Entry mode flag: Shift the display when writing (instead of moving the cursor).
 */

/**
 * @var LCD_ENTRYLEFT
 * @brief Entry mode flag: Left-to-right text entry (cursor moves right after each character).
 */

/**
 * @var LCD_BLINKON
 * @brief Display control flag: Enable blinking block/underline at the cursor position.
 */

/**
 * @var LCD_CURSORON
 * @brief Display control flag: Show the cursor.
 */

/**
 * @var LCD_DISPLAYON
 * @brief Display control flag: Turn the display on.
 */

/**
 * @var LCD_MOVERIGHT
 * @brief Cursor/display shift flag: Move to the right (cursor or display depending on LCD_DISPLAYMOVE).
 */

/**
 * @var LCD_DISPLAYMOVE
 * @brief Cursor/display shift flag: Shift the entire display instead of moving the cursor.
 */

/**
 * @var LCD_5x10DOTS
 * @brief Function set flag: Select 5x10 dots character font (usually valid only for 1-line mode).
 */

/**
 * @var LCD_2LINE
 * @brief Function set flag: Enable 2-line display mode.
 */

/**
 * @var LCD_8BITMODE
 * @brief Function set flag: Use 8-bit interface mode (typically not used with I2C backpacks).
 */

/**
 * @var LCD_BACKLIGHT
 * @brief Backpack control bit: Toggle the LCD backlight.
 */

/**
 * @var LCD_ENABLE_BIT
 * @brief Backpack control bit: Pulse to latch data (E signal).
 */

/**
 * @var addr
 * @brief Default I2C address of the LCD backpack.
 * @details Many common modules use 0x27; some variants use 0x3F. Adjust as needed for your hardware.
 */

/**
 * @def LCD_CHARACTER
 * @brief RS mode value indicating data (character bytes).
 */

/**
 * @def LCD_COMMAND
 * @brief RS mode value indicating a command byte.
 */

/**
 * @def MAX_LINES
 * @brief Maximum number of display lines supported by this driver.
 */

/**
 * @def MAX_CHARS
 * @brief Maximum number of characters per line supported by this driver.
 */

/**
 * @brief Clear the LCD and return the cursor to the home position.
 * @note This command takes longer than most operations; consider debouncing its usage.
 */
 
/**
 * @brief Set the cursor position.
 * @param col Zero-based column index (0..MAX_CHARS-1).
 * @param row Zero-based row index (0..MAX_LINES-1).
 * @note Values outside the expected ranges may be ignored or clamped depending on implementation.
 */

/**
 * @brief Print a null-terminated string at the current cursor position.
 * @param str C-string to write to the display.
 * @note Characters beyond the visible width may be truncated or wrap depending on calling logic.
 */

/**
 * @brief Initialize the LCD over I2C and configure it for 16x2 operation.
 * @details Typically sets function mode, entry mode, display control, and backlight state.
 * @note Call this once before any other LCD operations.
 */
#ifndef __LCD_1602_I2C_HPP__
#define __LCD_1602_I2C_HPP__

const uint8_t LCD_CLEARDISPLAY = 0x01;
const uint8_t LCD_RETURNHOME = 0x02;
const uint8_t LCD_ENTRYMODESET = 0x04;
const uint8_t LCD_DISPLAYCONTROL = 0x08;
const uint8_t LCD_CURSORSHIFT = 0x10;
const uint8_t LCD_FUNCTIONSET = 0x20;
const uint8_t LCD_SETCGRAMADDR = 0x40;
const uint8_t LCD_SETDDRAMADDR = 0x80;
const uint8_t LCD_ENTRYSHIFTINCREMENT = 0x01;
const uint8_t LCD_ENTRYLEFT = 0x02;
const uint8_t LCD_BLINKON = 0x01;
const uint8_t LCD_CURSORON = 0x02;
const uint8_t LCD_DISPLAYON = 0x04;
const uint8_t LCD_MOVERIGHT = 0x04;
const uint8_t LCD_DISPLAYMOVE = 0x08;
const uint8_t LCD_5x10DOTS = 0x04;
const uint8_t LCD_2LINE = 0x08;
const uint8_t LCD_8BITMODE = 0x10;
const uint8_t LCD_BACKLIGHT = 0x08;
const uint8_t LCD_ENABLE_BIT = 0x04;
static uint8_t addr = 0x27;

#define LCD_CHARACTER  1
#define LCD_COMMAND    0
#define MAX_LINES      2
#define MAX_CHARS      16

void lcd_clear();
void lcd_set_cursor(int , int);
void lcd_string(const char *);
void lcd_init();

#endif /* __LCD_1602_I2C_HPP__ */