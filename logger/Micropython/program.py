from i2c_lcd import I2cLcd
from bme280 import *
import sht30
import sht40
import rtc_clock
import time
import network
import ntptime
import urequests as requests


SSID = "TP-Link_0A7B"
PASSWORD = "12345678"
CLOCK = 1
SET = 1
SHT = 30  # or 40


class Program:
    """
    Program class for managing sensor data logging, display, and error reporting on a MicroPython device.
    Attributes:
        leds (list): List of PWM LED objects for RGB status indication.
        buzzer: PWM object for buzzer control.
        __i2c: I2C interface object.
        logger_id (str): Unique identifier for the logger device.
        error_url (str): URL endpoint for sending error logs.
        clock: RTC clock object (if enabled).
        lcd: I2C LCD display object.
        sensor: Sensor object (BME280, SHT30, or SHT40) or None if not detected.
        sensor_type (str or None): Type of sensor detected ("BME", "SHT", or None).
    Methods:
        __init__(leds, buzzer, i2c, logger_id, error_url):
            Initializes the Program, sets up LEDs, buzzer, I2C, LCD, and attempts to detect a sensor.
        init_program():
            Initializes the program, plays buzzer, and attempts WiFi connection.
        __network_connection():
            Connects to WiFi using predefined SSID and PASSWORD, sets device time if successful.
        set_time():
            Sets the system time using NTP and updates RTC clock if enabled.
        get_date():
            Retrieves the current date and time from RTC or system clock, formatted as a list of strings.
        display_measurement(raw, temp, hum, time_formated):
            Displays temperature, humidity, and time on the LCD.
        __map_color(color):
            Maps an 8-bit color value (0-255) to a 16-bit PWM value (0-65535).
        set_color(red, green, blue):
            Sets the RGB LED color using PWM.
        buzzer_data():
            Activates the buzzer for a short duration to indicate activity.
        send_error_log(message, details=None):
            Sends an error log to the backend server with the provided message and details.
    """

    def __init__(self, leds, buzzer, i2c, logger_id, error_url):
        """
        Initializes the logger device with provided hardware components and configuration.

        Args:
            leds: An object or interface to control the LEDs.
            buzzer: An object or interface to control the buzzer.
            i2c: The I2C bus instance used for communication with peripherals.
            logger_id: Unique identifier for the logger device.
            error_url: URL endpoint to send error logs.

        Attributes:
            leds: Stores the reference to the LEDs controller.
            buzzer: Stores the reference to the buzzer controller.
            __i2c: Stores the I2C bus instance.
            logger_id: Stores the logger's unique identifier.
            error_url: Stores the error log URL.
            clock: (Optional) RTC_Clock instance if CLOCK is enabled.
            lcd: I2cLcd instance for LCD display.
            sensor: Sensor instance (BME280, SHT30, or SHT40) if detected, else None.
            sensor_type: String indicating the type of sensor detected ("BME", "SHT"), or None if no sensor is found.

        Raises:
            None directly, but logs errors if no sensor is detected.
        """
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
            self.sensor_type = "BME"
        except Exception as e:
            try:
                if SHT == 30:
                    self.sensor = sht30.SHT30(self.__i2c)
                elif SHT == 40:
                    self.sensor = sht40.SHT40(self.__i2c)
                self.sensor_type = "SHT"
            except Exception as e:
                self.send_error_log("No sensor detected", str(e))
                self.sensor = None
                self.sensor_type = None

    def init_program(self):
        """
        Initializes the program by setting up the buzzer and establishing a network connection.

        Attempts to:
            - Initialize the buzzer by calling `buzzer_data()`.
            - Connect to the network using `__network_connection()`.
            - Print a warning if unable to connect to WiFi.

        If an exception occurs during initialization, logs the error using `send_error_log()`.

        Raises:
            Exception: Any exception encountered during initialization is caught and logged.
        """
        try:
            self.buzzer_data()
            connected = self.__network_connection()
            if not connected:
                print("Cannot connect to WiFi!")
        except Exception as e:
            self.send_error_log("Program initialization error", str(e))

    def __network_connection(self):
        """
        Attempts to connect to a WiFi network using predefined SSID and PASSWORD.
        Activates the station interface and tries to establish a connection.
        The method will retry for a maximum number of attempts (MAX_TIMEOUT),
        waiting 0.5 seconds between each attempt. If the connection is successful,
        it prints the network configuration, sets the device color to blue, and synchronizes the time.
        If the connection fails within the timeout period, it sets the device color to red and returns False.
        Returns:
            bool: True if the connection is successful, False otherwise.
        """
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
        """
        Synchronizes the device's time with an NTP server and sets the internal clock.

        Attempts to fetch the current time from an NTP server using `ntptime.settime()`,
        adjusts the time by adding 2 hours (presumably for timezone correction), and
        extracts the year, month, day, hour, minute, and second. If both `CLOCK` and
        `SET` flags are set to 1, updates the internal clock with the new time values.
        In case of failure, logs the error using `send_error_log`.

        Raises:
            Logs any exception encountered during the process.
        """
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
        """
        Retrieves the current date and time as a list of zero-padded string components.

        Returns:
            list: A list of strings in the format [year, month, day, hour, minute, second].
                  Each component is zero-padded to two digits where applicable.
                  If an error occurs, returns ["0000", "00", "00", "00", "00", "00"].

        Notes:
            - If CLOCK == 1, reads the date and time from the external clock device.
            - Otherwise, uses the system time (with a +2 hour offset).
            - Handles exceptions and prints an error message in case of failure.
        """
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
        """
        Displays the temperature, humidity, and formatted time on the LCD.

        Args:
            raw: The raw sensor data (not displayed, but may be used for logging or debugging).
            temp: The measured temperature value to display.
            hum: The measured humidity value to display.
            time_formated: The formatted time string to display.

        Exceptions:
            Catches and logs any exceptions that occur during the display process.
        """
        try:
            self.lcd.move_to(0, 0)
            self.lcd.putstr("T/H: {}/{}  {}".format(temp, hum, time_formated))
        except Exception as e:
            self.send_error_log("Cannot display measurement", str(e))

    def __map_color(self, color):
        """
        Converts an 8-bit color value (0-255) to a 16-bit color value (0-65535).

        Args:
            color (int): The 8-bit color value to convert.

        Returns:
            int: The corresponding 16-bit color value.
        """
        return int(color * 65535 / 255)

    def set_color(self, red, green, blue):
        """
        Sets the color of an RGB LED by adjusting the duty cycle for each color channel.

        Args:
            red (int): The intensity value for the red channel (typically 0-255).
            green (int): The intensity value for the green channel (typically 0-255).
            blue (int): The intensity value for the blue channel (typically 0-255).

        Raises:
            Exception: If setting the LED color fails, logs the error using send_error_log.
        """
        try:
            self.leds[0].duty_u16(self.__map_color(red))
            self.leds[1].duty_u16(self.__map_color(green))
            self.leds[2].duty_u16(self.__map_color(blue))
        except Exception as e:
            self.send_error_log("Cannot set LED", str(e))

    def buzzer_data(self):
        """
        Activates the buzzer with a specific frequency and duty cycle for 1 second.

        This method sets the buzzer frequency to 600 Hz and the duty cycle to 800 (using 16-bit resolution),
        keeps it on for 1 second, and then turns it off. If an error occurs during this process,
        an error log is sent with the relevant exception message.

        Exceptions:
            Any exception raised during buzzer operation is caught and logged via send_error_log.
        """
        try:
            self.buzzer.freq(600)
            self.buzzer.duty_u16(800)
            time.sleep(1)
            self.buzzer.duty_u16(0)
        except Exception as e:
            self.send_error_log("Cannot set BUZZER", str(e))

    def send_error_log(self, message, details=None):
        """
        Sends an error log message to the backend server.

        Args:
            message (str): The error message to be sent.
            details (Any, optional): Additional details about the error. Defaults to None.

        Side Effects:
            Sends a POST request with the error payload to the backend error URL.
            Prints an error message if the request fails.

        Exceptions:
            Catches and prints any exceptions raised during the request.
        """
        try:
            payload = {
                "equipmentId": self.logger_id,
                "message": message,
                "details": details,
                "severity": "error",
                "type": "Equipment",
            }
            requests.post(self.error_url, json=payload, timeout=3)
        except Exception as e:
            print("Cannot send message to backend:", e)
