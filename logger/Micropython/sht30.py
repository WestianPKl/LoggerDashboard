import time


class SHT30:
    """
    SHT30 I2C temperature and humidity sensor driver for MicroPython.
    Args:
        i2c: Initialized I2C bus object.
        addr (int, optional): I2C address of the SHT30 sensor. Defaults to 0x44.
    Raises:
        ValueError: If no I2C object is provided.
    Methods:
        measurement():
            Reads temperature and humidity from the sensor.
            Returns:
                tuple: (temperature in Celsius, relative humidity in %).
            Raises:
                Exception: If reading or calculation fails.
        temperature():
            Reads and returns the temperature in Celsius.
            Returns:
                float: Temperature in Celsius.
            Raises:
                Exception: If reading fails.
        relative_humidity():
            Reads and returns the relative humidity in percent.
            Returns:
                float: Relative humidity (%).
            Raises:
                Exception: If reading fails.
        heater(heater_status: bool):
            Enables or disables the sensor's internal heater.
            Args:
                heater_status (bool): True to enable, False to disable.
            Raises:
                Exception: If command fails.
        register_status():
            Reads and interprets the sensor's status register.
            Returns:
                list: Status messages and register values.
            Raises:
                Exception: If reading fails or CRC check fails.
        soft_reset():
            Performs a soft reset of the sensor.
            Raises:
                Exception: If command fails.
    """

    def __init__(self, i2c, addr=0x44):
        """
        Initializes the SHT30 sensor instance with the provided I2C interface and optional device address.

        Args:
            i2c: The I2C bus object to communicate with the sensor.
            addr (int, optional): The I2C address of the SHT30 sensor. Defaults to 0x44.

        Raises:
            ValueError: If the i2c argument is None.
        """
        if i2c == None:
            raise ValueError("No I2C argument!")
        self.__i2c = i2c
        self.__addr = addr

    def __check_crc(self, data):
        """
        Calculates the CRC (Cyclic Redundancy Check) for the given data using the SHT3x sensor's polynomial.

        Args:
            data (bytes or iterable of int): The input data bytes for which the CRC is to be calculated.

        Returns:
            int: The computed 8-bit CRC value.

        Note:
            This CRC calculation uses the polynomial 0x31 (x^8 + x^5 + x^4 + 1) as specified in the SHT3x datasheet.
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
        Reads raw temperature and humidity data from the SHT30 sensor via I2C.

        Sends a measurement command to the sensor, waits for the measurement to complete,
        and reads 6 bytes of data. Returns the raw temperature and humidity values as a tuple.

        Returns:
            tuple: (raw_temperature, raw_humidity) as integers.
                   Returns (0, 0) if an error occurs during communication.
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
        Reads raw temperature and humidity data from the sensor, converts them to human-readable values,
        and returns the results as a tuple.

        Returns:
            tuple: A tuple containing:
                - temp (float): Temperature in degrees Celsius.
                - hum (float): Relative humidity in percent.
            If an error occurs during measurement, returns (0.0, 0.0).

        Exceptions:
            Catches and prints any exceptions that occur during measurement.
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
        Retrieves the current temperature measurement from the sensor.

        Returns:
            float: The measured temperature value. Returns 0.0 if an error occurs during measurement.

        Exceptions:
            Handles any exceptions raised during the measurement process and prints an error message.
        """
        try:
            temp, _ = self.measurement()
            return temp
        except Exception as e:
            print("Temperature measurement error:", e)
            return 0.0

    def relative_humidity(self):
        """
        Returns the relative humidity measured by the sensor.

        Attempts to retrieve the humidity value from the sensor's measurement.
        If an error occurs during measurement, logs the error and returns 0.0.

        Returns:
            float: The relative humidity percentage, or 0.0 if an error occurs.
        """
        try:
            _, hum = self.measurement()
            return hum
        except Exception as e:
            print("Humidity measurement error:", e)
            return 0.0

    def heater(self, heater_status: bool):
        """
        Enables or disables the heater on the SHT30 sensor.

        Args:
            heater_status (bool): If True, enables the heater; if False, disables it.

        Raises:
            Exception: If there is an error communicating with the sensor.

        Note:
            The method sends the appropriate command to the sensor via I2C to control the heater,
            and waits 100 ms after the command is sent.
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
        Reads and interprets the status register of the SHT30 sensor.
        Communicates with the sensor via I2C to retrieve the status register,
        checks the CRC for data integrity, and decodes various status flags.
        Returns a list of messages describing the register status and any detected alerts.
        Returns:
            list: A list containing status messages, including the register value in HEX,
                  descriptions of any active status flags, or error messages if CRC or communication fails.
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
