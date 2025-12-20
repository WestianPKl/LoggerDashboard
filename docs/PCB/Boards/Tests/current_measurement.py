import machine
import utime, time
from machine import Pin, PWM, ADC, I2C, SPI
from measurement_ina226 import MEASUREMENT_INA226

ina_on = Pin(11, Pin.OUT)
ina_alert = Pin(13, Pin.IN, Pin.PULL_UP)

ina_on.value(1)
utime.sleep(0.1)

i2c = I2C(1, scl=Pin(7), sda=Pin(6), freq=100000)
ina226 = MEASUREMENT_INA226(i2c, r_shunt_ohm=0.01, max_current=3.2)


def measure():
    v = ina226.bus_voltage_V()
    i = ina226.current_A()
    p = ina226.power_W()
    print("___________________________________")
    print("Bus voltage:  {:.3f} V".format(v))
    print("Current:      {:.3f} A".format(i))
    print("Power:        {:.3f} W".format(p))
    print("___________________________________")


time.sleep(3)
measure()
time.sleep(1)
measure()
