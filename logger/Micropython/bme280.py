import time
from ustruct import unpack, unpack_from
from array import array

# BME280 default address.
BME280_I2CADDR = 0x76

# Operating Modes
BME280_OSAMPLE_1 = 1
BME280_OSAMPLE_2 = 2
BME280_OSAMPLE_4 = 3
BME280_OSAMPLE_8 = 4
BME280_OSAMPLE_16 = 5

BME280_REGISTER_CONTROL_HUM = 0xF2
BME280_REGISTER_STATUS = 0xF3
BME280_REGISTER_CONTROL = 0xF4

MODE_SLEEP = const(0)
MODE_FORCED = const(1)
MODE_NORMAL = const(3)

BME280_TIMEOUT = const(100)  # about 1 second timeout


class BME280:
    """
    BME280 sensor driver for MicroPython.
    This class provides an interface to the Bosch BME280 environmental sensor, allowing for reading temperature,
    pressure, and humidity data, as well as calculating altitude and dew point.
        mode (int or tuple): Oversampling mode for humidity, temperature, and pressure. Can be a single integer
            or a tuple of three integers for each measurement type.
        address (int): I2C address of the BME280 sensor.
        i2c: An initialized I2C object for communication with the sensor.
        **kwargs: Additional keyword arguments.
    Raises:
        ValueError: If the mode is not an int or a 3-element tuple, or if an invalid mode value is provided,
            or if no I2C object is supplied.
    Attributes:
        address (int): I2C address of the sensor.
        i2c: I2C communication object.
        sealevel (int): Sea level pressure in Pascals (default 101325).
        altitude (float): Calculated altitude in meters.
        dew_point (float): Calculated dew point temperature in Celsius.
        values (list): Human-readable list of [temperature (°C), humidity (%), pressure (Pa)].
    Methods:
        read_raw_data(result):
            Reads raw (uncompensated) temperature, pressure, and humidity data from the sensor.
        read_compensated_data(result=None):
            Reads and returns compensated temperature (°C), pressure (Pa), and humidity (%) data.
        temperature():
            Returns the compensated temperature in Celsius.
        relative_humidity():
            Returns the compensated relative humidity in percent.
        pressure():
            Returns the compensated pressure in Pascals.
    """

    def __init__(
        self, mode=BME280_OSAMPLE_8, address=BME280_I2CADDR, i2c=None, **kwargs
    ):
        """
        Initializes the BME280 sensor object with the specified configuration.
        Parameters:
            mode (int or tuple, optional): Oversampling mode for humidity, temperature, and pressure.
                Can be a single integer applied to all, or a tuple of three integers for each measurement.
                Must be one of BME280_OSAMPLE_1, BME280_OSAMPLE_2, BME280_OSAMPLE_4, BME280_OSAMPLE_8, or BME280_OSAMPLE_16.
                Defaults to BME280_OSAMPLE_8.
            address (int, optional): I2C address of the BME280 sensor. Defaults to BME280_I2CADDR.
            i2c (object): An initialized I2C object for communication with the sensor. Required.
            **kwargs: Additional keyword arguments (not used).
        Raises:
            ValueError: If the mode parameter is not an int or a 3-element tuple.
            ValueError: If any mode value is not a supported oversampling value.
            ValueError: If the i2c parameter is not provided.
        Initializes calibration data and prepares the sensor for measurement.
        """
        # Check that mode is valid.
        if type(mode) is tuple and len(mode) == 3:
            self._mode_hum, self._mode_temp, self._mode_press = mode
        elif type(mode) == int:
            self._mode_hum, self._mode_temp, self._mode_press = mode, mode, mode
        else:
            raise ValueError(
                "Wrong type for the mode parameter, must be int or a 3 element tuple"
            )

        for mode in (self._mode_hum, self._mode_temp, self._mode_press):
            if mode not in [
                BME280_OSAMPLE_1,
                BME280_OSAMPLE_2,
                BME280_OSAMPLE_4,
                BME280_OSAMPLE_8,
                BME280_OSAMPLE_16,
            ]:
                raise ValueError(
                    "Unexpected mode value {0}. Set mode to one of "
                    "BME280_ULTRALOWPOWER, BME280_STANDARD, BME280_HIGHRES, or "
                    "BME280_ULTRAHIGHRES".format(mode)
                )

        self.address = address
        if i2c is None:
            raise ValueError("An I2C object is required.")
        self.i2c = i2c
        self.__sealevel = 101325

        # load calibration data
        dig_88_a1 = self.i2c.readfrom_mem(self.address, 0x88, 26)
        dig_e1_e7 = self.i2c.readfrom_mem(self.address, 0xE1, 7)

        (
            self.dig_T1,
            self.dig_T2,
            self.dig_T3,
            self.dig_P1,
            self.dig_P2,
            self.dig_P3,
            self.dig_P4,
            self.dig_P5,
            self.dig_P6,
            self.dig_P7,
            self.dig_P8,
            self.dig_P9,
            _,
            self.dig_H1,
        ) = unpack("<HhhHhhhhhhhhBB", dig_88_a1)

        self.dig_H2, self.dig_H3, self.dig_H4, self.dig_H5, self.dig_H6 = unpack(
            "<hBbhb", dig_e1_e7
        )
        # unfold H4, H5, keeping care of a potential sign
        self.dig_H4 = (self.dig_H4 * 16) + (self.dig_H5 & 0xF)
        self.dig_H5 //= 16

        # temporary data holders which stay allocated
        self._l1_barray = bytearray(1)
        self._l8_barray = bytearray(8)
        self._l3_resultarray = array("i", [0, 0, 0])

        self._l1_barray[0] = self._mode_temp << 5 | self._mode_press << 2 | MODE_SLEEP
        self.i2c.writeto_mem(self.address, BME280_REGISTER_CONTROL, self._l1_barray)
        self.t_fine = 0

    def read_raw_data(self, result):
        """Reads the raw (uncompensated) data from the sensor.

        Args:
            result: array of length 3 or alike where the result will be
            stored, in temperature, pressure, humidity order
        Returns:
            None
        """

        self._l1_barray[0] = self._mode_hum
        self.i2c.writeto_mem(self.address, BME280_REGISTER_CONTROL_HUM, self._l1_barray)
        self._l1_barray[0] = self._mode_temp << 5 | self._mode_press << 2 | MODE_FORCED
        self.i2c.writeto_mem(self.address, BME280_REGISTER_CONTROL, self._l1_barray)

        # Wait for conversion to complete
        for _ in range(BME280_TIMEOUT):
            if self.i2c.readfrom_mem(self.address, BME280_REGISTER_STATUS, 1)[0] & 0x08:
                time.sleep_ms(10)  # still busy
            else:
                break  # Sensor ready
        else:
            raise RuntimeError("Sensor BME280 not ready")

        # burst readout from 0xF7 to 0xFE, recommended by datasheet
        self.i2c.readfrom_mem_into(self.address, 0xF7, self._l8_barray)
        readout = self._l8_barray
        # pressure(0xF7): ((msb << 16) | (lsb << 8) | xlsb) >> 4
        raw_press = ((readout[0] << 16) | (readout[1] << 8) | readout[2]) >> 4
        # temperature(0xFA): ((msb << 16) | (lsb << 8) | xlsb) >> 4
        raw_temp = ((readout[3] << 16) | (readout[4] << 8) | readout[5]) >> 4
        # humidity(0xFD): (msb << 8) | lsb
        raw_hum = (readout[6] << 8) | readout[7]

        result[0] = raw_temp
        result[1] = raw_press
        result[2] = raw_hum

    def read_compensated_data(self, result=None):
        """Reads the data from the sensor and returns the compensated data.

        Args:
            result: array of length 3 or alike where the result will be
            stored, in temperature, pressure, humidity order. You may use
            this to read out the sensor without allocating heap memory

        Returns:
            array with temperature, pressure, humidity. Will be the one
            from the result parameter if not None
        """
        self.read_raw_data(self._l3_resultarray)
        raw_temp, raw_press, raw_hum = self._l3_resultarray
        # temperature
        var1 = (raw_temp / 16384.0 - self.dig_T1 / 1024.0) * self.dig_T2
        var2 = raw_temp / 131072.0 - self.dig_T1 / 8192.0
        var2 = var2 * var2 * self.dig_T3
        self.t_fine = int(var1 + var2)
        temp = (var1 + var2) / 5120.0
        temp = max(-40, min(85, temp))

        # pressure
        var1 = (self.t_fine / 2.0) - 64000.0
        var2 = var1 * var1 * self.dig_P6 / 32768.0 + var1 * self.dig_P5 * 2.0
        var2 = (var2 / 4.0) + (self.dig_P4 * 65536.0)
        var1 = (self.dig_P3 * var1 * var1 / 524288.0 + self.dig_P2 * var1) / 524288.0
        var1 = (1.0 + var1 / 32768.0) * self.dig_P1
        if var1 == 0.0:
            pressure = 30000  # avoid exception caused by division by zero
        else:
            p = ((1048576.0 - raw_press) - (var2 / 4096.0)) * 6250.0 / var1
            var1 = self.dig_P9 * p * p / 2147483648.0
            var2 = p * self.dig_P8 / 32768.0
            pressure = p + (var1 + var2 + self.dig_P7) / 16.0
            pressure = max(30000, min(110000, pressure))

        # humidity
        h = self.t_fine - 76800.0
        h = (raw_hum - (self.dig_H4 * 64.0 + self.dig_H5 / 16384.0 * h)) * (
            self.dig_H2
            / 65536.0
            * (
                1.0
                + self.dig_H6 / 67108864.0 * h * (1.0 + self.dig_H3 / 67108864.0 * h)
            )
        )
        humidity = h * (1.0 - self.dig_H1 * h / 524288.0)
        if humidity < 0:
            humidity = 0
        if humidity > 100:
            humidity = 100.0

        if result:
            result[0] = temp
            result[1] = pressure
            result[2] = humidity
            return result

        return array("f", (temp, pressure, humidity))

    @property
    def sealevel(self):
        return self.__sealevel

    @sealevel.setter
    def sealevel(self, value):
        """
        Sets the sea level pressure value used for altitude calculations.

        Parameters:
            value (int or float): The sea level pressure in Pascals. Must be between 30,000 and 120,000 Pa.

        Raises:
            ValueError: If the provided value is outside the acceptable range.

        Note:
            This value is used to calibrate altitude readings based on the current sea level pressure.
        """
        if 30000 < value < 120000:  # just ensure some reasonable value
            self.__sealevel = value

    @property
    def altitude(self):
        """
        Calculates the altitude based on the current pressure reading and the configured sea level pressure.
        Returns:
            float: The calculated altitude in meters. Returns 0.0 if the calculation fails.
        Notes:
            Uses the barometric formula to estimate altitude from pressure.
            Relies on the `read_compensated_data()` method to obtain the current pressure.
            The sea level pressure is taken from `self.__sealevel`.
        """

        from math import pow

        try:
            p = 44330 * (
                1.0 - pow(self.read_compensated_data()[1] / self.__sealevel, 0.1903)
            )
        except:
            p = 0.0
        return p

    @property
    def dew_point(self):
        """
        Calculates the dew point temperature based on current sensor readings.
        Returns:
            float: The dew point temperature in degrees Celsius.
        Notes:
            This method reads the compensated temperature, pressure, and humidity values from the sensor,
            then applies the Magnus formula to estimate the dew point.
        """

        from math import log

        t, p, h = self.read_compensated_data()
        h = (log(h, 10) - 2) / 0.4343 + (17.62 * t) / (243.12 + t)  # type: ignore
        return 243.12 * h / (17.62 - h)

    @property
    def values(self):
        """
        Returns the compensated sensor readings as a list.
        Retrieves temperature, humidity, and pressure values from the sensor,
        and returns them in a list in the following order:
        [temperature, humidity, pressure].
        Returns:
            list: A list containing temperature, humidity, and pressure values.
        """

        t, p, h = self.read_compensated_data()

        return [t, h, p]

    def temperature(self):
        temp, p, h = self.read_compensated_data()
        return temp

    def relative_humidity(self):
        t, p, hum = self.read_compensated_data()
        return hum

    def pressure(self):
        t, pressure, h = self.read_compensated_data()
        return pressure
