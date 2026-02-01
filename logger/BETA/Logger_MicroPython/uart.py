import time
from machine import Pin, UART


class UARTDevice:
    def __init__(
        self,
        uart_id=1,
        tx_pin=None,
        rx_pin=None,
        baudrate=9600,
        bits=8,
        parity=None,
        stop=1,
    ):
        self.uart = UART(
            uart_id,
            baudrate=baudrate,
            bits=bits,
            parity=parity,
            stop=stop,
            tx=Pin(tx_pin),
            rx=Pin(rx_pin),
        )

    def write(self, data):
        if isinstance(data, str):
            data = data.encode("utf-8")
        self.uart.write(data)

    def read(self, nbytes):
        return self.uart.read(nbytes)

    def any(self):
        return self.uart.any()

    def deinit(self):
        self.uart.deinit()
        self.uart = None
