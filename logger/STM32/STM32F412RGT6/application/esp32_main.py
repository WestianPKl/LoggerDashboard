import time
import esp32
import machine
from machine import Pin, RTC, UART
import network
import ntptime

WIFI_SSID = "TP-Link_0A7B"
WIFI_PASSWORD = "12345678"

LED_GPIO = 22

DEV_ADDR = 0xB2
FRAME_LEN_BOOT = 64
FRAME_LEN_APP = 16
FRAME_LEN = 64
STATUS_OK = 0x40
STATUS_ERR = 0x7F


def crc8_atm(data: bytes) -> int:
    crc = 0x00
    for b in data:
        crc ^= b
        for _ in range(8):
            if crc & 0x80:
                crc = ((crc << 1) ^ 0x07) & 0xFF
            else:
                crc = (crc << 1) & 0xFF
    return crc


def uart_message_boot(cmd: int, param_addr: int = 0, param: int = 0) -> bytes:
    frame = bytearray(FRAME_LEN_BOOT)
    frame[0] = DEV_ADDR
    frame[1] = 0x00
    frame[2] = cmd & 0xFF
    frame[3] = param_addr & 0xFF
    frame[4] = param & 0xFF
    frame[63] = crc8_atm(frame[:63])
    return bytes(frame)


def uart_message_application(
    cmd: int, param_addr: int = 0, payload: bytes = b""
) -> bytes:
    frame = bytearray(FRAME_LEN_APP)
    frame[0] = DEV_ADDR
    frame[1] = 0x00
    frame[2] = cmd & 0xFF
    frame[3] = param_addr & 0xFF
    for i, b in enumerate(payload):
        if 4 + i >= 15:
            break
        frame[4 + i] = b
    frame[15] = crc8_atm(frame[:15])
    return bytes(frame)


def read_exact(uart: UART, n: int, timeout_ms: int = 500) -> bytes | None:
    buf = bytearray()
    t0 = time.ticks_ms()
    while len(buf) < n and time.ticks_diff(time.ticks_ms(), t0) < timeout_ms:
        chunk = uart.read(n - len(buf))
        if chunk:
            buf.extend(chunk)
        else:
            time.sleep_ms(2)
    if len(buf) == n:
        return bytes(buf)
    return None


def uart_loop_application(uart: UART, frame: bytes) -> bytes | None:
    uart.write(frame)
    t0 = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), t0) < 800:
        b = uart.read(1)
        if not b:
            time.sleep_ms(2)
            continue
        if b[0] != DEV_ADDR:
            continue

        rest = read_exact(uart, FRAME_LEN_APP - 1, 400)
        if rest is None:
            return None

        data = bytes([DEV_ADDR]) + rest
        if crc8_atm(data[:15]) != data[15]:
            continue
        return data
    return None


def network_connection(timeout_s=20):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        wlan.disconnect()
        time.sleep(1)

    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    t0 = time.time()
    while not wlan.isconnected() and (time.time() - t0) < timeout_s:
        time.sleep(1)

    if wlan.isconnected():
        print("WiFi OK:", wlan.ifconfig())
        try:
            ntptime.settime()
            print("NTP time sync OK")
        except Exception as e:
            print("NTP time sync error:", e)
        return True

    print("WiFi connection failed! status=", wlan.status())
    return False


def parse_resp(resp: bytes):
    if not resp or len(resp) != 16:
        return None
    addr = resp[0]
    status = resp[1]
    cmd = resp[2]
    param = resp[3]
    payload = resp[4:15]
    crc = resp[15]
    return addr, status, cmd, param, payload, crc


def i16_from_be(payload, offset=0) -> int:
    v = (payload[offset] << 8) | payload[offset + 1]
    if v & 0x8000:
        v -= 0x10000
    return v


def u16_from_be(payload, offset=0) -> int:
    return (payload[offset] << 8) | payload[offset + 1]


def i32_from_be(payload, offset=0) -> int:
    v = (
        (payload[offset] << 24)
        | (payload[offset + 1] << 16)
        | (payload[offset + 2] << 8)
        | payload[offset + 3]
    )
    if v & 0x80000000:
        v -= 0x100000000
    return v


def u32_from_be(payload, offset=0) -> int:
    return (
        (payload[offset] << 24)
        | (payload[offset + 1] << 16)
        | (payload[offset + 2] << 8)
        | payload[offset + 3]
    )


# ── Request helpers ──────────────────────────────────────────────────────────


def req_ping(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x00, 0x00))
    parsed = parse_resp(resp)
    if not parsed:
        print("PING: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    print(
        "PING:", hex(addr), hex(status), hex(cmd), hex(param), payload.hex(), hex(crc)
    )


def req_serial(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x01, 0x00))
    parsed = parse_resp(resp)
    if not parsed:
        print("SERIAL: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    serial = u32_from_be(payload, 0)
    print("SERIAL:", serial)


def req_fw_hw_version(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x01, 0x01))
    parsed = parse_resp(resp)
    if not parsed:
        print("VERSION: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    fw_major, fw_minor, fw_patch = payload[0], payload[1], payload[2]
    hw_major, hw_minor = payload[3], payload[4]
    print(f"FW: {fw_major}.{fw_minor}.{fw_patch}  HW: {hw_major}.{hw_minor}")


def req_build_date(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x01, 0x02))
    parsed = parse_resp(resp)
    if not parsed:
        print("BUILD DATE: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    build_date = bytes(payload[:10]).split(b"\x00")[0].decode("ascii")
    print("Build date:", build_date)


def req_prod_date(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x01, 0x03))
    parsed = parse_resp(resp)
    if not parsed:
        print("PROD DATE: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    prod_date = bytes(payload[:10]).split(b"\x00")[0].decode("ascii")
    print("Prod date:", prod_date)


def req_adc(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x02, 0x00))
    parsed = parse_resp(resp)
    if not parsed:
        print("ADC: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    v0 = u16_from_be(payload, 0)
    v1 = u16_from_be(payload, 2)
    print("ADC0:", v0, " ADC1:", v1)


def req_sht40(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x03, 0x00))
    parsed = parse_resp(resp)
    if not parsed:
        print("SHT40: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("SHT40 error code:", payload[0])
        return
    t_raw = i16_from_be(payload, 0)
    rh_raw = u16_from_be(payload, 2)
    print(f"SHT40: {t_raw / 100.0:.2f} C  {rh_raw / 100.0:.2f} %")


def req_output_states(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x04, 0x00))
    parsed = parse_resp(resp)
    if not parsed:
        print("OUTPUTS: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("OUTPUTS: error")
        return
    led1, led2, r, g, b = payload[0], payload[1], payload[2], payload[3], payload[4]
    print(f"LED1: {led1}  LED2: {led2}  RGB: ({r}, {g}, {b})")


def req_set_led1(uart: UART, on: int):
    resp = uart_loop_application(
        uart, uart_message_application(0x04, 0x01, bytes([on & 0xFF]))
    )
    parsed = parse_resp(resp)
    if not parsed:
        print("LED1: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("LED1: error")
        return
    print("LED1 set to:", payload[0])


def req_set_led2(uart: UART, on: int):
    resp = uart_loop_application(
        uart, uart_message_application(0x04, 0x02, bytes([on & 0xFF]))
    )
    parsed = parse_resp(resp)
    if not parsed:
        print("LED2: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("LED2: error")
        return
    print("LED2 set to:", payload[0])


def req_set_rgb(uart: UART, r: int, g: int, b: int):
    resp = uart_loop_application(
        uart,
        uart_message_application(0x04, 0x03, bytes([r & 0xFF, g & 0xFF, b & 0xFF])),
    )
    parsed = parse_resp(resp)
    if not parsed:
        print("RGB: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("RGB: error")
        return
    print(f"RGB set to: ({payload[0]}, {payload[1]}, {payload[2]})")


def req_set_buzzer(uart: UART, freq: int, volume: int):
    pl = bytes([(freq >> 8) & 0xFF, freq & 0xFF, volume & 0xFF])
    resp = uart_loop_application(uart, uart_message_application(0x04, 0x04, pl))
    parsed = parse_resp(resp)
    if not parsed:
        print("BUZZER: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("BUZZER: error")
        return
    f = u16_from_be(payload, 0)
    print(f"Buzzer: {f} Hz  vol: {payload[2]}%")


def req_buzzer_off(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x04, 0x05))
    parsed = parse_resp(resp)
    if not parsed:
        print("BUZZER OFF: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("BUZZER OFF: error")
        return
    print("Buzzer OFF")


def req_bme280(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x05, 0x00))
    parsed = parse_resp(resp)
    if not parsed:
        print("BME280: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("BME280: error")
        return
    temp = i32_from_be(payload, 0)
    hum = u32_from_be(payload, 4)
    press = u32_from_be(payload, 8)
    print(
        f"BME280: {temp / 100.0:.2f} C  {hum / 1024.0:.2f} %  {press / 25600.0:.2f} hPa"
    )


def req_rtc_read(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x06, 0x00))
    parsed = parse_resp(resp)
    if not parsed:
        print("RTC READ: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("RTC READ: error")
        return
    yy, mo, dd, wd = payload[0], payload[1], payload[2], payload[3]
    hh, mi, ss = payload[4], payload[5], payload[6]
    print(f"RTC: 20{yy:02d}-{mo:02d}-{dd:02d} (wd={wd}) {hh:02d}:{mi:02d}:{ss:02d}")


def req_rtc_write(
    uart: UART, yy: int, mo: int, dd: int, wd: int, hh: int, mi: int, ss: int
):
    pl = bytes(
        [yy & 0xFF, mo & 0xFF, dd & 0xFF, wd & 0xFF, hh & 0xFF, mi & 0xFF, ss & 0xFF]
    )
    resp = uart_loop_application(uart, uart_message_application(0x06, 0x01, pl))
    parsed = parse_resp(resp)
    if not parsed:
        print("RTC WRITE: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("RTC WRITE: error")
        return
    yy, mo, dd, wd = payload[0], payload[1], payload[2], payload[3]
    hh, mi, ss = payload[4], payload[5], payload[6]
    print(f"RTC set: 20{yy:02d}-{mo:02d}-{dd:02d} (wd={wd}) {hh:02d}:{mi:02d}:{ss:02d}")


def req_rtc_wakeup(uart: UART, seconds: int):
    pl = bytes([(seconds >> 8) & 0xFF, seconds & 0xFF])
    resp = uart_loop_application(uart, uart_message_application(0x06, 0x02, pl))
    parsed = parse_resp(resp)
    if not parsed:
        print("WAKEUP: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("WAKEUP: error")
        return
    print(f"Wakeup set: {seconds} s")


def req_alarm_set(uart: UART, hh: int, mi: int, ss: int, daily: int = 1):
    pl = bytes([hh & 0xFF, mi & 0xFF, ss & 0xFF, daily & 0xFF])
    resp = uart_loop_application(uart, uart_message_application(0x06, 0x03, pl))
    parsed = parse_resp(resp)
    if not parsed:
        print("ALARM SET: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("ALARM SET: error")
        return
    print(f"Alarm A set: {hh:02d}:{mi:02d}:{ss:02d} daily={daily}")


def req_alarm_off(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x06, 0x04))
    parsed = parse_resp(resp)
    if not parsed:
        print("ALARM OFF: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("ALARM OFF: error")
        return
    print("Alarm A OFF")


def req_timestamp(uart: UART):
    resp = uart_loop_application(uart, uart_message_application(0x06, 0x05))
    parsed = parse_resp(resp)
    if not parsed:
        print("TIMESTAMP: no response")
        return
    addr, status, cmd, param, payload, crc = parsed
    if status != STATUS_OK:
        print("TIMESTAMP: error (no event)")
        return
    mo, dd, wd = payload[1], payload[2], payload[3]
    hh, mi, ss = payload[4], payload[5], payload[6]
    print(f"Timestamp: {mo:02d}-{dd:02d} (wd={wd}) {hh:02d}:{mi:02d}:{ss:02d}")


# ── Main ─────────────────────────────────────────────────────────────────────


def main():
    # rtc = RTC()
    # network_connection()

    uart = UART(1, baudrate=115200, tx=20, rx=21, timeout=50, timeout_char=10)

    # 0x00 - Ping
    req_ping(uart)

    # 0x01 - Device info
    req_serial(uart)
    req_fw_hw_version(uart)
    req_build_date(uart)
    req_prod_date(uart)

    # 0x02 - ADC
    req_adc(uart)

    # 0x03 - SHT40
    req_sht40(uart)

    # 0x04 - Outputs
    req_output_states(uart)
    req_set_led1(uart, 1)
    req_set_led2(uart, 1)
    req_set_led1(uart, 0)
    req_set_led2(uart, 0)
    req_set_rgb(uart, 0, 0, 255)
    req_set_rgb(uart, 0, 0, 0)
    req_set_buzzer(uart, 1000, 50)
    time.sleep(1)
    req_buzzer_off(uart)
    req_output_states(uart)

    # 0x05 - BME280
    req_bme280(uart)

    # 0x06 - RTC
    req_rtc_read(uart)
    req_rtc_write(uart, 26, 2, 18, 3, 12, 0, 0)
    # req_rtc_wakeup(uart, 10)
    # req_alarm_set(uart, 12, 0, 0, 1)
    # req_alarm_off(uart)
    # req_timestamp(uart)

    led = Pin(LED_GPIO, Pin.OUT)
    while True:
        led.on()
        time.sleep(2)
        led.off()
        time.sleep(2)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Error:", e)
