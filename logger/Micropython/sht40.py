import time


class SHT40:
    """
    SHT40 I2C sensor driver for MicroPython.
    This class provides an interface to the SHT40 temperature and humidity sensor via I2C.
    Args:
        i2c: An initialized I2C object.
        addr (int, optional): I2C address of the SHT40 sensor. Defaults to 0x44.
    Raises:
        ValueError: If no I2C object is provided.
    Methods:
        measurement():
            Reads temperature and relative humidity from the sensor.
            Returns a tuple (temperature, humidity).
        temperature():
            Reads and returns the temperature in degrees Celsius.
        relative_humidity():
            Reads and returns the relative humidity in percent.
        heater(heater_status: bool):
            Enables or disables the sensor's internal heater.
        register_status():
            Reads and interprets the sensor's status register.
            Returns a list of status messages.
        soft_reset():
            Performs a soft reset of the sensor.
    Private Methods:
        __check_crc(data):
            Calculates and checks the CRC for data integrity.
        _raw_data():
            Reads raw temperature and humidity data from the sensor.
    """

    def __init__(self, i2c, addr=0x44):
        """
        Initializes the sensor object with the provided I2C interface and device address.

        Args:
            i2c: The I2C bus object to communicate with the sensor.
            addr (int, optional): The I2C address of the sensor. Defaults to 0x44.

        Raises:
            ValueError: If the i2c argument is None.
        """
        if i2c == None:
            raise ValueError("No I2C argument!")
        self.__i2c = i2c
        self.__addr = addr

    def __check_crc(self, data):
        """
        Calculates the CRC (Cyclic Redundancy Check) for the given data using the polynomial 0x31.

        Args:
            data (iterable of int): The input data bytes over which the CRC is to be computed.

        Returns:
            int: The computed 8-bit CRC value.

        Note:
            This CRC algorithm is commonly used in sensor communication protocols such as Sensirion SHT4x series.
        """
        crc = 0xFF
        for byte in data:
            crc ^= byte
            for _ in range(8):
                if crc & 0x80:
                    crc = (crc << 1) ^ 0x31
                else:
                    crc <<= 1
                crc &= 0xFF
        return crc

    def _raw_data(self):
        """
        Reads raw temperature and humidity data from the SHT40 sensor via I2C.

        Sends a measurement command to the sensor, waits for the measurement to complete,
        and reads 6 bytes of data. Extracts and returns the raw temperature and humidity values.

        Returns:
            tuple: A tuple containing two integers:
                - Raw temperature value (int)
                - Raw humidity value (int)
            Returns (0, 0) if an error occurs during communication.

        Exceptions:
            Catches and prints any exceptions that occur during I2C communication.
        """
        try:
            self.__i2c.writeto(self.__addr, b"\x2c\x06")
            time.sleep_ms(100)
            raw = self.__i2c.readfrom(self.__addr, 6)
            return (raw[0] << 8) + raw[1], (raw[3] << 8) + raw[4]
        except Exception as e:
            print("Reading error:", e)
            return 0, 0

    def measurement(self):
        """
        Performs a measurement by reading raw temperature and humidity data, converting them to human-readable values.

        Returns:
            tuple: A tuple containing:
                - temp (float): Temperature in degrees Celsius.
                - hum (float): Relative humidity in percent.
            If an error occurs, returns (0.0, 0.0).
        """
        try:
            t, h = self._raw_data()
            temp = -45 + (175 * (t / 65535))
            hum = 100 * (h / 65535)
            meas = (temp, hum)
            return meas
        except Exception as e:
            print("Measurement error:", e)
            return 0.0, 0.0

    def temperature(self):
        """
        Measures and returns the current temperature.

        Returns:
            float: The measured temperature value. Returns 0.0 if an error occurs during measurement.

        Exceptions:
            Handles any exception that occurs during the measurement process and prints an error message.
        """
        try:
            temp, _ = self.measurement()
            return temp
        except Exception as e:
            print("Temperature measurement error:", e)
            return 0.0

    def relative_humidity(self):
        """
        Returns the current relative humidity measurement.

        Attempts to retrieve the relative humidity value from the sensor. If an error occurs during measurement,
        an error message is printed and a default value of 0.0 is returned.

        Returns:
            float: The measured relative humidity as a percentage, or 0.0 if an error occurs.
        """
        try:
            _, hum = self.measurement()
            return hum
        except Exception as e:
            print("Humidity measurement error:", e)
            return 0.0

    def heater(self, heater_status: bool):
        """
        Enables or disables the heater on the SHT40 sensor.

        Args:
            heater_status (bool): If True, enables the heater; if False, disables it.

        Sends the appropriate I2C command to the sensor to control the heater.
        Waits 100 ms after sending the command.
        Prints an error message if an exception occurs during the operation.
        """
        try:
            if heater_status:
                self.__i2c.writeto(self.__addr, b"\x30\x6d")
                time.sleep_ms(100)
            else:
                self.__i2c.writeto(self.__addr, b"\x30\x66")
                time.sleep_ms(100)
        except Exception as e:
            print("Heater setting error:", e)

    def register_status(self):
        """
        Reads and interprets the status register from the SHT40 sensor.
        Communicates with the sensor over I2C to retrieve the status register,
        checks the CRC for data integrity, and decodes various status flags.
        Returns a list of messages describing the register status and any detected alerts.
        Returns:
            list: A list containing the register status in hexadecimal and any relevant status messages or errors.
        """
        message = []
        try:
            self.__i2c.writeto(self.__addr, b"\xf3\x2d")
            time.sleep_ms(100)
            raw = self.__i2c.readfrom(self.__addr, 3)
            status_bytes = raw[0:2]
            crc = raw[2]
            if self.__check_crc(status_bytes) != crc:
                message.append("CRC error!")
            else:
                status = (status_bytes[0] << 8) | status_bytes[1]
                message.append({"Register status (HEX):": hex(status)})

                if status & (1 << 0):
                    message.append("→ Write data checksum status.")
                if status & (1 << 1):
                    message.append("→ Command status.")
                if status & (1 << 4):
                    message.append("→ Soft reset.")
                if status & (1 << 10):
                    message.append("→ RH tracking alert.")
                if status & (1 << 11):
                    message.append("→ Temperature tracking alert.")
                if status & (1 << 13):
                    message.append("→ Heater ON.")
                if status & (1 << 15):
                    message.append("→ Alert pending.")
        except Exception as e:
            message.append(f"Register error: {e}")
        return message

    def soft_reset(self):
        try:
            self.__i2c.writeto(self.__addr, b"\x30\xa2")
            time.sleep_ms(100)
        except Exception as e:
            print("Soft reset error:", e)
