/**
 * @file lcd_1602_i2c.hpp
 * @brief Constants and function declarations for controlling a 1602 LCD display via I2C.
 *
 * This header defines command constants and function prototypes for interfacing with
 * a 16x2 character LCD using the I2C protocol, typically with a PCF8574 I/O expander.
 *
 * Constants:
 * - LCD command codes (e.g., LCD_CLEARDISPLAY, LCD_RETURNHOME)
 * - LCD display control flags (e.g., LCD_DISPLAYON, LCD_CURSORON, LCD_BLINKON)
 * - LCD function set flags (e.g., LCD_2LINE, LCD_8BITMODE, LCD_5x10DOTS)
 * - LCD backlight and enable bit definitions
 * - Default I2C address (addr)
 * - LCD_CHARACTER and LCD_COMMAND for data/command mode
 * - MAX_LINES and MAX_CHARS for display dimensions
 *
 * Functions:
 * - lcd_clear(): Clear the LCD display and return cursor to home position.
 * - lcd_set_cursor(int col, int row): Set the cursor to the specified column and row.
 * - lcd_string(const char *str): Display a string on the LCD at the current cursor position.
 * - lcd_init(): Initialize the LCD display and I2C interface.
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