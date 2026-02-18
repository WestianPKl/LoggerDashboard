#ifndef LCD_H
#define LCD_H

#include <stdint.h>
#include "stm32f4xx.h"

void lcd_init(void);
void lcd_send_string(const char *str);
void lcd_set_cursor(uint8_t col, uint8_t row);
void lcd_backlight(uint8_t state);
void lcd_clear(void);
void lcd_send_decimal(int32_t num, uint8_t digits);
void lcd_send_hex(uint32_t num, uint8_t digits);
void lcd_send_fixed_x100(int32_t value_x100);
void lcd_send_temp_1dp_from_x100(int16_t t_x100);
void lcd_send_hum_1dp_from_x100(uint16_t rh_x100);


#endif // LCD_H