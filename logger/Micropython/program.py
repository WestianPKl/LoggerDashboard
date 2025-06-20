from i2c_lcd import I2cLcd
from bme280 import *
import sht30
import rtc_clock
import time
import network
import ntptime
import urequests as requests


SSID = ""
PASSWORD = ""
CLOCK = 0
SET = 1

class Program:
    def __init__(self, leds, buzzer, i2c, logger_id, error_url):
        self.leds = leds
        self.buzzer = buzzer
        self.__i2c = i2c
        self.logger_id = logger_id
        self.error_url = error_url
        self.set_color(255, 255, 255)
        if CLOCK == 1:
            self.clock = rtc_clock.RTC_Clock(self.__i2c)
        self.lcd = I2cLcd(self.__i2c, 0x27, 2, 16)
        self.sensor = None
        try:
            self.sensor = BME280(i2c=i2c)
            self.sensor_type = 'BME'
        except Exception as e:
            try:
                self.sensor = sht30.SHT30(self.__i2c)
                self.sensor_type = 'SHT'
            except Exception as e:
                self.send_error_log("No sensor detected", str(e))
                self.sensor = None
                self.sensor_type = None

    def init_program(self):
        try:
            self.buzzer_data()
            connected = self.__network_connection()
            if not connected:
                print("Cannot connect to WiFi!")
        except Exception as e:
            self.send_error_log("Program initialization error", str(e))
    
    def __network_connection(self):
        ssid = SSID
        password = PASSWORD
        station = network.WLAN(network.STA_IF)
        station.active(True)
        station.connect(ssid, password)

        timeout = 0
        MAX_TIMEOUT = 20

        while not station.isconnected():
            self.set_color(255, 0, 0)
            time.sleep(0.5)
            timeout += 1
            if timeout >= MAX_TIMEOUT:
                print("Timeout during WiFi connection.")
                self.set_color(255, 0, 0)
                return False

        print(station.ifconfig())
        self.set_color(0, 0, 255)
        self.set_time()
        return True

    def set_time(self):
        try:
            ntptime.settime()
            aT = time.localtime(time.time() + 2 * 60 * 60)
            year = aT[0]
            month = aT[1]
            day = aT[2]
            hour = aT[3]
            minute = aT[4]
            second = aT[5]
            if CLOCK == 1 and SET == 1:
                self.clock.set_time((year, month, day, 7, hour, minute, second))
        except Exception as e:
            self.send_error_log("RTC set time fail", str(e))

    def get_date(self):
        try:
            if CLOCK == 1:
                data = self.clock.read_time()
                year = str(data[0])
                month = str(data[1])
                day = str(data[2])
                hour = str(data[3])
                minute = str(data[4])
                second = str(data[5])
            else:
                data = time.localtime(time.time() + 2 * 60 * 60)
                year = str(data[0])
                day = str(data[2])
                month = str(data[1])
                hour = str(data[3])
                minute = str(data[4])
                second = str(data[5])
            if len(month) == 1:
                month = "0" + month
            if len(day) == 1:
                day = "0" + day
            if len(hour) == 1:
                hour = "0" + hour
            if len(minute) == 1:
                minute = "0" + minute
            if len(second) == 1:
                second = "0" + second
            return [year, month, day, hour, minute, second]
        except Exception as e:
            print("Błąd odczytu daty/czasu:", e)
            return ["0000", "00", "00", "00", "00", "00"]

    def display_measurement(self, raw, temp, hum, time_formated):
        try:
            self.lcd.move_to(0, 0)
            self.lcd.putstr("T/H: {}/{}  {}".format(temp, hum, time_formated))
        except Exception as e:
            self.send_error_log("Cannot display measurement", str(e))

    def __map_color(self, color):
        return int(color * 65535 / 255)

    def set_color(self, red, green, blue):
        try:
            self.leds[0].duty_u16(self.__map_color(red))
            self.leds[1].duty_u16(self.__map_color(green))
            self.leds[2].duty_u16(self.__map_color(blue))
        except Exception as e:
            self.send_error_log("Cannot set LED", str(e))

    def buzzer_data(self):
        try:
            self.buzzer.freq(600)
            self.buzzer.duty_u16(800)
            time.sleep(1)
            self.buzzer.duty_u16(0)
        except Exception as e:
            self.send_error_log("Cannot set BUZZER", str(e))
            
    def send_error_log(self, message, details=None):
        try:
            payload = {
                "equipmentId": self.logger_id,
                "message": message,
                "details": details,
                "severity": "error",
                "type": 'Equipment',
            }
            requests.post(self.error_url, json=payload, timeout=3)
        except Exception as e:
            print("Cannot send message to backend:", e)
