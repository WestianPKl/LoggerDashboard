from machine import Pin, SoftI2C, Timer, PWM
from program import Program

import ntptime
import urequests as requests
import json

TOKEN_URL = "http://xxx/api/data/data-token"
DATA_URL = "http://xxx/api/data/data-log"
ERROR_URL = "http://xxx/api/common/error-log"

LOGGER_ID = 0
SENSOR_ID = 0
i = 0
TEMPERATURE = 1
HUMIDITY = 1
PRESSURE = 1


def main():
    pins = [8, 7, 6]
    leds = [PWM(Pin(pin)) for pin in pins]
    for led in leds:
        led.freq(1000)
    i2c = SoftI2C(scl=Pin(1), sda=Pin(0), freq=10000)
    buzzer = PWM(Pin(13))
    main_program = Program(leds, buzzer, i2c, LOGGER_ID, ERROR_URL)
    main_program.init_program()

    def counter_measurement(timer):
        global i
        temp_raw = hum_raw = pressure_raw = None
        temp_send = hum_send = pressure_send = None
        error = False

        try:
            if TEMPERATURE == 1:
                temp_raw = round(main_program.sensor.temperature(), 1)
                temp_send = round(main_program.sensor.temperature(), 2)
            if HUMIDITY == 1:
                hum_raw = round(main_program.sensor.relative_humidity(), 1)
                hum_send = round(main_program.sensor.relative_humidity(), 2)
            if PRESSURE == 1:
                pressure_raw = round(main_program.sensor.pressure(), 1)
                pressure_send = round(main_program.sensor.pressure(), 2)
        except Exception as e:
            main_program.send_error_log("Sensor reading error", str(e))
            main_program.set_color(255, 0, 0)
            error = True

        if error or temp_raw is None or hum_raw is None:
            return

        date = main_program.get_date()
        if temp_raw <= 15 or temp_raw >= 35 or hum_raw <= 25 or hum_raw >= 75:
            main_program.set_color(255, 0, 0)
        else:
            main_program.set_color(0, 255, 0)
        temp = str(temp_raw)
        hum = str(hum_raw)
        if temp_raw < 10:
            temp = "0{}".format(temp_raw)
        if hum_raw < 10:
            hum = "0{}".format(hum_raw)
        time_send = "{}-{}-{} {}:{}:{}".format(
            date[0], date[1], date[2], date[3], date[4], date[5]
        )
        if i % 2 == 0:
            time_formated = "{}-{}-{} {}:{}".format(
                date[0], date[1], date[2], date[3], date[4]
            )
        else:
            time_formated = "{}-{}-{} {} {}".format(
                date[0], date[1], date[2], date[3], date[4]
            )
        main_program.display_measurement(temp_raw, temp, hum, time_formated)

        if i == 1 and not error:
            try:
                data = [
                    {
                        "time": time_send,
                        "value": temp_send,
                        "definition": "temperature",
                        "equLoggerId": LOGGER_ID,
                        "equSensorId": SENSOR_ID,
                    },
                    {
                        "time": time_send,
                        "value": hum_send,
                        "definition": "humidity",
                        "equLoggerId": LOGGER_ID,
                        "equSensorId": SENSOR_ID,
                    },
                    {
                        "time": time_send,
                        "value": pressure_send,
                        "definition": "atmPressure",
                        "equLoggerId": LOGGER_ID,
                        "equSensorId": SENSOR_ID,
                    },
                ]
                ntptime.settime()
                try:
                    get_token = requests.get(TOKEN_URL, timeout=2).text
                    token = json.loads(get_token)["token"]
                    send_package = requests.post(
                        DATA_URL,
                        headers={"Authorization": "Bearer {}".format(token)},
                        json=data,
                        timeout=2,
                    )
                    if (
                        send_package.status_code == 201
                        or send_package.status_code == 200
                    ):
                        main_program.set_color(255, 255, 255)
                    else:
                        main_program.send_error_log(
                            "Data sending error", str(send_package.status_code)
                        )
                        main_program.set_color(255, 0, 0)
                except Exception as e:
                    main_program.send_error_log("API communication error", str(e))
                    main_program.set_color(255, 0, 0)
            except Exception as e:
                main_program.send_error_log("Wrong data format", str(e))
                main_program.set_color(255, 0, 0)
            main_program.set_color(0, 255, 0)
            i = 0
        i += 1

    Timer(-1).init(mode=Timer.PERIODIC, period=3000, callback=counter_measurement)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Program critical error:", e)
