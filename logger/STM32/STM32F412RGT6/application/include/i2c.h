#ifndef I2C_H
#define I2C_H

#include <stdint.h>
#include "stm32f4xx.h"

void i2c1_init(void);

int i2c1_write_raw(uint8_t dev_addr, const uint8_t *data, uint8_t len);
int i2c1_read_raw(uint8_t dev_addr, uint8_t *data, uint8_t len);

int i2c1_write_raw_dma(uint8_t dev_addr, const uint8_t *data, uint16_t len);
int i2c1_read_raw_dma(uint8_t dev_addr, uint8_t *data, uint16_t len);

#endif // I2C_H