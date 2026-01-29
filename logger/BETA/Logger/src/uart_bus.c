#include "uart_bus.h"
#include "pico/stdlib.h"

void uart_bus_init(uart_inst_t *uart, uint tx_pin, uint rx_pin, uint baudrate ) {
    uart_init(uart, baudrate);
    gpio_set_function(tx_pin, GPIO_FUNC_UART);
    gpio_set_function(rx_pin, GPIO_FUNC_UART);

    uart_set_hw_flow(uart, false, false);
    uart_set_format(uart, 8, 1, UART_PARITY_NONE);
    uart_set_fifo_enabled(uart, false);
}