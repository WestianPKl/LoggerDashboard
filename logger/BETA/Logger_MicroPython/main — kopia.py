import machine, os, sdcard, ujson, time, ntptime, ubinascii
from machine import Pin, SPI
from wireless import WiFi
from mqtt_simple import MQTTClient
from uart import UARTDevice

SSID = "TP-Link_0A7B"
PASSWORD = "12345678"

MQTT_SERVER = "192.168.18.6"
MQTT_PORT = 1883
MQTT_USER = "pico_user"
MQTT_PASSWORD = "HASLO"
MQTT_KEEPALIVE = 7200

REQUIRED_KEYS = {
    "ADC",
    "VERSION",
    "T",
    "RH",
    "YEAR",
    "MONTH",
    "DAY",
    "HOUR",
    "MIN",
    "SEC",
    "SENSOR_ERROR",
    "RTC_ERROR",
    "RTC_VL",
    "RTC_VL_ERROR",
    "LCD_ERROR",
    "UART_FE",
    "UART_DOR",
    "FRAME",
    "RESET_CAUSE",
}

TOPIC_STATUS = None

CSV_FILE = "/sd/data.csv"
CSV_HEADER = "datetime,temperature,humidity,logger_id,sensor_id\n"

last_err_vals = {"UART_FE": 0, "UART_DOR": 0}

errors = {}
client = None


def card_mount():
    spi = SPI(
        0,
        baudrate=1_000_000,
        polarity=0,
        phase=0,
        sck=Pin(18),
        mosi=Pin(19),
        miso=Pin(16),
    )
    cs = Pin(17, Pin.OUT, value=1)
    sd = sdcard.SDCard(spi, cs)
    try:
        os.mount(os.VfsFat(sd), "/sd")
    except OSError:
        os.listdir("/sd")
    spi.init(baudrate=10_000_000, polarity=0, phase=0)
    return sd, spi


def card_unmount():
    try:
        os.sync()
    except Exception:
        pass
    try:
        os.umount("/sd")
    except Exception:
        pass


def append_csv_line(
    datetime_str, temperature, humidity, logger_id, sensor_id, filename=CSV_FILE
):
    try:
        need_header = False
        try:
            st = os.stat(filename)
            if st[6] == 0:
                need_header = True
        except OSError:
            need_header = True
        with open(filename, "a") as f:
            if need_header:
                f.write(CSV_HEADER)
            f.write(
                "{},{},{},{},{}\n".format(
                    datetime_str, temperature, humidity, logger_id, sensor_id
                )
            )
        return True
    except Exception as e:
        print("append_csv_line error:", e)
        return False


def mqtt_initialization(device_id):
    client = MQTTClient(
        client_id=device_id,
        server=MQTT_SERVER,
        port=MQTT_PORT,
        user=MQTT_USER,
        password=MQTT_PASSWORD,
        keepalive=MQTT_KEEPALIVE,
    )

    client.set_callback(message_mqtt)
    client.connect()
    client.subscribe(f"devices/{device_id}/cmd")
    return client


def send_status(result, typeData="STATUS", info=None):
    global client
    payload = {
        "result": result,
        "info": info,
        "type": typeData,
        "timestamp": time.time(),
    }
    if client is None:
        raise Exception("MQTT client is not connected")
    client.publish(TOPIC_STATUS, ujson.dumps(payload))


def message_mqtt(topic, msg):
    data = ujson.loads(msg)
    cmd = data.get("cmd")
    if cmd == "ota_update":
        ota_update()
    elif cmd == "PING":
        send_status("ALIVE")
    else:
        raise Exception("Unknown cmd: {}".format(cmd))


def parse_kv_list(lines):
    out = {}
    for s in lines:
        s = s.strip()
        if not s or "=" not in s:
            continue
        k, v = s.split("=", 1)
        k = k.strip()
        v = v.strip()
        try:
            v2 = int(v)
        except ValueError:
            try:
                v2 = float(v)
            except ValueError:
                v2 = v
        out[k] = v2
    return out


def load_data(filename="status.json"):
    try:
        with open(filename, "r") as f:
            data = ujson.load(f)
            if "pendingErrors" not in data or not isinstance(
                data["pendingErrors"], list
            ):
                data["pendingErrors"] = []
            return data
    except Exception:
        return {
            "version": "",
            "loggerId": "",
            "sensorId": "",
            "params": [],
            "pendingErrors": [],
        }


def save_data(data, filename="status.json"):
    tmp = filename + ".tmp"
    with open(tmp, "w") as f:
        ujson.dump(data, f)
    os.rename(tmp, filename)


def error_dict(source, msg):
    return {"timestamp": time.time(), "source": source, "msg": str(msg)}


def error_queue(status_data, payload, max_len=50):
    status_data["pendingErrors"].append(payload)
    if len(status_data["pendingErrors"]) > max_len:
        status_data["pendingErrors"] = status_data["pendingErrors"][-max_len:]
    try:
        save_data(status_data)
    except Exception as e:
        errors["SAVE_STATUS"] = e


def error_management(status_data, source, msg):
    payload = error_dict(source, msg)
    if client is None:
        error_queue(status_data, payload)
        return
    try:
        send_status("ERROR", "ERROR", payload)
    except Exception as e:
        error_queue(status_data, payload)
        error_queue(status_data, error_dict("SEND_STATUS", e))


def send_errors(status_data):
    global client
    if client is None:
        return
    if not status_data.get("pendingErrors"):
        return
    try:
        send_status("ERRORS_FLUSH", "ERROR", {"items": status_data["pendingErrors"]})
        status_data["pendingErrors"] = []
        save_data(status_data)
    except Exception as e:
        errors["SEND_ERRORS"] = e


def process_frame_errors(status_data, d):
    global last_err_vals
    error_map = {
        "LCD_ERROR": "LCD",
        "SENSOR_ERROR": "SHT30",
        "RTC_ERROR": "RTC",
        "RTC_VL_ERROR": "RTC_VL",
    }
    frame = d.get("FRAME", "?")
    for key, source in error_map.items():
        val = d.get(key, 0)
        if isinstance(val, int) and val != 0:
            error_management(status_data, source, f"{key}={val} (frame={frame})")
    for key in ("UART_FE", "UART_DOR"):
        val = d.get(key, 0)
        if not isinstance(val, int):
            continue
        last = last_err_vals.get(key, 0)
        if val > last:
            error_management(
                status_data, key, f"{key} increased {last}->{val} (frame={frame})"
            )
        last_err_vals[key] = val


def send_time(uart_device):
    tm = time.gmtime()
    line = "TIME={:04d}-{:02d}-{:02d} {:02d}:{:02d}:{:02d}\n".format(
        tm[0], tm[1], tm[2], tm[3], tm[4], tm[5]
    )
    uart_device.write(line.encode())


def main():
    global client, TOPIC_STATUS

    set_time_status = False

    sd, spi = None, None

    status_data = load_data()
    device_id = str(status_data.get("loggerId", "2"))
    TOPIC_STATUS = f"devices/{device_id}/status"

    wifi = WiFi(SSID, PASSWORD)
    try:
        wifi.connect()
        ip_address = wifi.get_ip()
        print(ip_address)
    except Exception as e:
        ip_address = None
        errors["WIFI_CONNECT"] = e
    if ip_address is None:
        error_management(status_data, "WIFI", "Wifi could not be connected")
        client = None
    else:
        try:
            ntptime.settime()
            set_time_status = True
            client = mqtt_initialization(device_id)
        except Exception as e:
            client = None
            error_management(status_data, "MQTT_INIT", e)

    if client is not None:
        try:
            send_status(
                "START",
                "STATUS",
                {
                    "ipAddress": ip_address,
                    "controllerSw": status_data.get("version", ""),
                },
            )
        except Exception as e:
            error_management(status_data, "SEND_START", e)

        send_errors(status_data)
    try:
        uart_device = UARTDevice(uart_id=1, tx_pin=4, rx_pin=5, baudrate=19200)
        if set_time_status:
            send_time(uart_device)
        uart_device.write(b"u\r\n")
        time.sleep(0.05)
        uart_device.write(b"u\r\n")
    except Exception as e:
        uart_device = None
        error_management(status_data, "UART_INIT", e)

    uart_buffer = b""
    frame_acc = {}

    while True:
        if client is not None:
            try:
                client.check_msg()
            except Exception as e:
                error_management(status_data, "MQTT_CHECK", e)
                client = None
        time.sleep(0.05)

        if uart_device is None:
            continue
        uart_data = []
        try:
            time.sleep(0.05)
            buf = uart_buffer
            while uart_device.any():
                chunk = uart_device.read(64)
                if chunk:
                    buf += chunk

            if b"\n" in buf:
                parts = buf.split(b"\n")
                uart_buffer = parts[-1]
                for line in parts[:-1]:
                    text = line.decode("utf-8", "ignore").strip()
                    if text:
                        uart_data.append(text)
            else:
                uart_buffer = buf

        except Exception as e:
            error_management(status_data, "UART_READ", e)
        for line in uart_data:
            if line == "END":
                d = frame_acc
                frame_acc = {}
                if REQUIRED_KEYS.issubset(d.keys()):
                    process_frame_errors(status_data, d)
                    try:
                        timestamp = "{:04d}-{:02d}-{:02d} {:02d}:{:02d}:{:02d}".format(
                            d["YEAR"],
                            d["MONTH"],
                            d["DAY"],
                            d["HOUR"],
                            d["MIN"],
                            d["SEC"],
                        )
                    except Exception:
                        timestamp = ""
                    data_send = {
                        "temperature": d.get("T", 0),
                        "humidity": d.get("RH", 0),
                        "date": timestamp,
                        "chipSw": d.get("VERSION", ""),
                        "batteryVoltage": d.get("ADC", 0),
                        "controllerSw": status_data.get("version", ""),
                        "loggerId": status_data.get("loggerId", ""),
                        "sensorId": status_data.get("sensorId", ""),
                        "params": status_data.get("params", []),
                        "ipAddress": ip_address,
                        "sensorError": d.get("SENSOR_ERROR", 0),
                        "rtcError": d.get("RTC_ERROR", 0),
                        "rtcVl": d.get("RTC_VL", 0),
                        "rtcVlError": d.get("RTC_VL_ERROR", 0),
                        "lcdError": d.get("LCD_ERROR", 0),
                        "uartFe": d.get("UART_FE", 0),
                        "uartDor": d.get("UART_DOR", 0),
                        "frame": d.get("FRAME", 0),
                        "resetCause": d.get("RESET_CAUSE", 0),
                        "ok": (
                            1
                            if (
                                d.get("SENSOR_ERROR", 0) == 0
                                and d.get("RTC_ERROR", 0) == 0
                            )
                            else 0
                        ),
                    }
                    try:
                        sd, spi = card_mount()
                        try:
                            append_csv_line(timestamp, d.get("T", 0), d.get("RH", 0), status_data.get("loggerId", ""), status_data.get("sensorId", ""))
                        finally:
                            card_unmount()
                    except Exception as e:
                        error_management(status_data, "CARD_SAVE", e)
                    if client is not None:
                        try:
                            send_status("DATA", "DATA", data_send)
                            time.sleep(0.2)
                            try:
                                client.disconnect()
                            except Exception:
                                pass
                            client = None
                        except Exception as e:
                            error_management(status_data, "SEND_DATA", e)
                            client = None
                    uart_device.write(b"d\r\n")
                    time.sleep(0.05)
                    uart_device.write(b"d\r\n")
                else:
                    error_management(
                        status_data,
                        "FRAME",
                        f"Missing keys: {sorted(REQUIRED_KEYS - set(d.keys()))}",
                    )
                    uart_device.write(b"u\r\n")
                    time.sleep(0.05)
                    uart_device.write(b"u\r\n")
                break
            else:
                kv = parse_kv_list([line])
                if kv:
                    frame_acc.update(kv)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        errors["Program critical error"] = e
