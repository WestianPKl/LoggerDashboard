import time
from machine import Pin, PWM


class PWMOutput:
    def __init__(self, pin_number, freq=1000, duty=512):
        self.pin = Pin(pin_number, Pin.OUT)
        self.pwm = PWM(self.pin)
        self.pwm.freq(freq)
        self.pwm.duty_u16(duty)

    def set_frequency(self, freq):
        self.pwm.freq(freq)

    def set_duty_cycle(self, duty):
        if 0 <= duty <= 1023:
            self.pwm.duty_u16(duty)
        else:
            raise ValueError("Duty cycle must be between 0 and 1023")

    def stop(self):
        self.pwm.deinit()

    def deinit(self):
        self.pwm.deinit()
        self.pwm = None
        self.pin = None
