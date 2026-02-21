import time, esp32, ntptime, machine
from machine import Pin, RTC, UART
from wireless import WiFi
from stm32_uart import STM32UART
from program import Program

SLEEP_GPIO = 1
STATUS_GPIO = 18
STM32_GPIO = 19
LED_GPIO = 22

SSID = "TP-Link_0A7B"
PASSWORD = "12345678"

NTP_SERVER_IP = "192.168.18.158"


def main():
    status_gpio = Pin(STATUS_GPIO, Pin.IN, Pin.PULL_UP)
    stm32_gpio = Pin(STM32_GPIO, Pin.OUT)
    led = Pin(LED_GPIO, Pin.OUT)

    # wake = Pin(SLEEP_GPIO, Pin.IN, Pin.PULL_DOWN)
    # esp32.wake_on_ext0(wake, esp32.WAKEUP_ANY_HIGH)

    led.on()

    wifi = WiFi(SSID, PASSWORD)

    program = Program()

    try:
        wifi.connect()
        ip_address = wifi.get_ip()
    except Exception as e:
        ip_address = None
        program.errors["WIFI_CONNECT"] = e
    if ip_address is None:
        program.error_management(
            program.status_data, "WIFI", "Wifi could not be connected"
        )
        program.set_client(None)
    else:
        program.set_ip_address(ip_address)
        try:
            ntptime.host = NTP_SERVER_IP
            ntptime.settime()
            program.mqtt_initialization()
        except Exception as e:
            program.error_management(
                program.status_data,
                "MQTT",
                "MQTT client initialization failed: {}".format(e),
            )
            program.set_client(None)

    rtc = RTC()

    if program.get_client() is not None:
        try:
            program.send_status(
                "START",
                "STATUS",
                {
                    "ipAddress": ip_address,
                    "controllerSw": program.status_data.get("version", ""),
                },
            )
        except Exception as e:
            program.error_management(
                program.status_data, "MQTT", "Failed to send status: {}".format(e)
            )

    try:
        uart_device = UART(
            1, baudrate=115200, tx=20, rx=21, timeout=50, timeout_char=10
        )
        stm32 = STM32UART(uart_device)

        program.stm32 = stm32

        stm32_gpio.value(1)
        if stm32.req_get_input_states(0x03):
            serial = stm32.req_serial()
            fw, hw = stm32.req_fw_hw_version()
            build_data = stm32.req_build_date()
            prod_date = stm32.req_prod_date()
            v0, v1 = stm32.req_adc()
            t, h = stm32.req_sht40()
            tb, hb, pb = stm32.req_bme280()
            bme280_error = 0
            sht40_error = 0
            if tb == 0 and hb == 0 and pb == 0:
                bme280_error = 1
            if t == 0 and h == 0:
                sht40_error = 1
            date_time = rtc.datetime()
            stm32.req_rtc_read()
            stm32.req_rtc_write(
                date_time[0] - 2000,
                date_time[1],
                date_time[2],
                date_time[3],
                date_time[4],
                date_time[5],
                date_time[6],
            )
            date = stm32.req_rtc_read()

            v0_voltage = stm32.adc_to_voltage(v0)
            v1_voltage = stm32.adc_to_voltage(v1)

            calc_v0 = stm32.vadc_to_vin(v0_voltage)
            calc_v1 = stm32.vadc_to_vin(v1_voltage)

            data = {
                "serial": serial,
                "chipSw": fw,
                "hw": hw,
                "build_date": build_data,
                "prod_date": prod_date,
                "adc": [v0, v1],
                "adc_voltage": [v0_voltage, v1_voltage],
                "vin": [calc_v0, calc_v1],
                "sht40": {"temperature": t, "humidity": h},
                "bme280": {"temperature": tb, "humidity": hb, "pressure": pb},
                "rtc": date,
                "controllerSw": program.status_data.get("version", ""),
                "loggerId": program.status_data.get("loggerId", ""),
                "sensorId": program.status_data.get("sensorId", ""),
                "ipAddress": ip_address,
                "bme280_error": bme280_error,
                "sht40_error": sht40_error,
            }
        else:
            data = {
                "controllerSw": program.status_data.get("version", ""),
                "loggerId": program.status_data.get("loggerId", ""),
                "sensorId": program.status_data.get("sensorId", ""),
                "ipAddress": ip_address,
            }
        program.send_status("DATA", "DATA", data)
        stm32_gpio.value(0)
    except Exception as e:
        program.error_management(
            program.status_data, "STM32", "STM32 communication failed: {}".format(e)
        )
        uart_device = None

    led.off()
    # machine.deepsleep()
    while True:
        if program.get_client() is not None:
            try:
                program.get_client().check_msg()
            except Exception as e:
                program.error_management(
                    program.status_data, "MQTT", "MQTT check_msg failed: {}".format(e)
                )
                program.set_client(None)
        time.sleep(0.05)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Fatal error: {}".format(e))
