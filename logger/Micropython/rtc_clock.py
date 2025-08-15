import time


class RTC_Clock:
    """
    RTC_Clock provides an interface to a real-time clock (RTC) device over I2C.
    Args:
        i2c: An initialized I2C bus object.
        addr (int, optional): I2C address of the RTC device. Defaults to 0x68.
    Raises:
        ValueError: If no I2C object is provided.
        Exception: If initialization or I2C communication fails.
    Methods:
        set_time(datetime=None):
            Sets the RTC time if a datetime tuple is provided, or reads the current time if no argument is given.
            Args:
                datetime (tuple, optional): A tuple in the format (year, month, day, hour, minute, second, weekday).
            Returns:
                tuple: The current time as (year, month, day, hour, minute, second, weekday, 0) if reading.
        read_time():
            Reads the current time from the RTC.
            Returns:
                tuple: The current time as (year, month, day, hour, minute, second, 0).
    """

    def __init__(self, i2c, addr=0x68):
        """
        Initializes the RTC clock object with the given I2C interface and device address.

        Args:
            i2c: The I2C interface object to communicate with the RTC device.
            addr (int, optional): The I2C address of the RTC device. Defaults to 0x68.

        Raises:
            ValueError: If the i2c argument is None.
            Exception: If there is an error during device initialization.

        Side Effects:
            Attempts to write initialization data to the RTC device at the specified address.
            Prints an error message if initialization fails.
        """
        if i2c == None:
            raise ValueError("No I2C argument!")
        self.__i2c = i2c
        self.__addr = addr
        try:
            self.__i2c.writeto(self.__addr, b"\x07\x10")
        except Exception as e:
            print("Initialization error:", e)

    def __bcd2dec(self, val):
        """
        Converts a value from Binary-Coded Decimal (BCD) format to its decimal representation.

        Args:
            val (int): The BCD-encoded integer value to convert.

        Returns:
            int: The decimal representation of the input BCD value.
        """
        return (val // 16) * 10 + (val % 16)

    def __dec2bcd(self, val):
        """
        Converts a decimal integer to its Binary-Coded Decimal (BCD) representation.

        Args:
            val (int): The decimal value to convert (0-99).

        Returns:
            int: The BCD-encoded integer.

        Example:
            __dec2bcd(45)  # Returns 0x45 (69 in decimal)
        """
        return (val // 10) * 16 + (val % 10)

    def set_time(self, datetime=None):
        """
        Gets or sets the RTC time using I2C communication.

        If called without arguments, reads the current time from the RTC and returns a tuple:
            (year, month, day, hour, minute, second, weekday, 0)

        If a `datetime` tuple is provided, sets the RTC time accordingly.
        The `datetime` tuple should be in the format:
            (year, month, day, hour, minute, second, weekday, 0)

        Args:
            datetime (tuple, optional): Date and time to set on the RTC. If None, reads the current time.

        Returns:
            tuple: Current date and time if reading from RTC, otherwise None.

        Raises:
            Exception: If there is an error during I2C communication or data conversion.
        """
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
        """
        Reads the current time from the RTC module via I2C.

        Returns:
            tuple: A tuple containing the following values:
                (year, month, day, hour, minute, second, weekday)
                - year (int): The current year (e.g., 2024).
                - month (int): The current month (1-12).
                - day (int): The current day of the month (1-31).
                - hour (int): The current hour (0-23).
                - minute (int): The current minute (0-59).
                - second (int): The current second (0-59).
                - weekday (int): The day of the week (0-6, where 0 is unspecified).

        Exceptions:
            If an error occurs during I2C communication, prints an error message and returns a tuple of zeros.
        """
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
