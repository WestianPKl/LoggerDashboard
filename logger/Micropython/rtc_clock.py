import time

class RTC_Clock:
    def __init__(self, i2c, addr=0x68):
        if i2c == None:
            raise ValueError("No I2C argument!")
        self.__i2c = i2c
        self.__addr = addr
        try:
            self.__i2c.writeto(self.__addr, b"\x07\x10")
        except Exception as e:
            print("Initialization error:", e)

    def __bcd2dec(self, val):
        return (val // 16) * 10 + (val % 16)

    def __dec2bcd(self, val):
        return (val // 10) * 16 + (val % 10)

    def set_time(self, datetime=None):
        try:
            if datetime is None:
                data = self.__i2c.readfrom_mem(self.__addr, b"\x00", 7)
                return (
                    2000 + self.__bcd2dec(data[6]),
                    self.__bcd2dec(data[5]),
                    self.__bcd2dec(data[4]),
                    self.__bcd2dec(data[2]),
                    self.__bcd2dec(data[3]),
                    self.__bcd2dec(data[1]),
                    self.__bcd2dec(data[0]),
                    0,
                )
            else:
                data = bytearray(7)
                data[0] = self.__dec2bcd(datetime[6]) & 0x7F
                data[1] = self.__dec2bcd(datetime[5])
                data[2] = self.__dec2bcd(datetime[4]) & 0x3F
                data[3] = self.__dec2bcd(datetime[3])
                data[4] = self.__dec2bcd(datetime[2])
                data[5] = self.__dec2bcd(datetime[1])
                data[6] = self.__dec2bcd(datetime[0] - 2000)
                self.__i2c.writeto_mem(self.__addr, 0x00, data)
        except Exception as e:
            print("Time setting error:", e)

    def read_time(self):
        try:
            self.__i2c.writeto(0x68, b"\x00")
            raw = self.__i2c.readfrom(0x68, 7)
            return (
                2000 + self.__bcd2dec(raw[6]),
                self.__bcd2dec(raw[5]),
                self.__bcd2dec(raw[4]),
                self.__bcd2dec(raw[2]),
                self.__bcd2dec(raw[1]),
                self.__bcd2dec(raw[0]),
                0,
            )
        except Exception as e:
            print("Time reading error:", e)
            return (0, 0, 0, 0, 0, 0, 0)