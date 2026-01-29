#pragma once
#include "hardware/uart.h"

void uart_bus_init(uart_inst_t *uart, uint tx_pin, uint rx_pin, uint baudrate);