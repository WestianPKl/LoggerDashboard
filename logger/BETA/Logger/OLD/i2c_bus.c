#include "i2c_bus.h"
#include "hardware/gpio.h"

void i2c_bus_init(i2c_inst_t *i2c, uint sda_pin, uint scl_pin, uint baudrate) {
    i2c_init(i2c, baudrate);
    gpio_set_function(sda_pin, GPIO_FUNC_I2C);
    gpio_set_function(scl_pin, GPIO_FUNC_I2C);
    gpio_pull_up(sda_pin);
    gpio_pull_up(scl_pin);
}