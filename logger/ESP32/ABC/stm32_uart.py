import time
from machine import UART

DEV_ADDR = 0xB2
FRAME_LEN_BOOT = 64
FRAME_LEN_APP = 24
FRAME_LEN = 64
STATUS_OK = 0x40
STATUS_ERR = 0x7F


class STM32UART:
    def __init__(self, uart_device: UART):
        self.uart = uart_device

    def crc8_atm(self, data: bytes) -> int:
        crc = 0x00
        for b in data:
            crc ^= b
            for _ in range(8):
                if crc & 0x80:
                    crc = ((crc << 1) ^ 0x07) & 0xFF
                else:
                    crc = (crc << 1) & 0xFF
        return crc

    def uart_message_boot(self, cmd: int, param_addr: int = 0, param: int = 0) -> bytes:
        frame = bytearray(FRAME_LEN_BOOT)
        frame[0] = DEV_ADDR
        frame[1] = 0x00
        frame[2] = cmd & 0xFF
        frame[3] = param_addr & 0xFF
        frame[4] = param & 0xFF
        frame[63] = self.crc8_atm(frame[:63])
        return bytes(frame)

    def uart_message_application(
        self, cmd: int, param_addr: int = 0, payload: bytes = b""
    ) -> bytes:
        frame = bytearray(FRAME_LEN_APP)
        frame[0] = DEV_ADDR
        frame[1] = 0x00
        frame[2] = cmd & 0xFF
        frame[3] = param_addr & 0xFF

        for i, b in enumerate(payload):
            if 4 + i >= FRAME_LEN_APP - 1:
                break
            frame[4 + i] = b

        frame[FRAME_LEN_APP - 1] = self.crc8_atm(frame[: FRAME_LEN_APP - 1])
        return bytes(frame)

    def read_exact(self, n: int, timeout_ms: int = 500) -> bytes | None:
        buf = bytearray()
        t0 = time.ticks_ms()
        while len(buf) < n and time.ticks_diff(time.ticks_ms(), t0) < timeout_ms:
            chunk = self.uart.read(n - len(buf))
            if chunk:
                buf.extend(chunk)
            else:
                time.sleep_ms(2)
        if len(buf) == n:
            return bytes(buf)
        return None

    def uart_loop_application(self, frame: bytes) -> bytes | None:
        self.uart.write(frame)
        t0 = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), t0) < 1500:
            b = self.uart.read(1)
            if not b:
                time.sleep_ms(2)
                continue
            if b[0] != DEV_ADDR:
                continue

            rest = self.read_exact(FRAME_LEN_APP - 1, 1200)
            if rest is None:
                return None

            data = bytes([DEV_ADDR]) + rest
            if self.crc8_atm(data[: FRAME_LEN_APP - 1]) != data[FRAME_LEN_APP - 1]:
                continue
            return data
        return None

    def parse_resp(self, resp: bytes):
        if not resp or len(resp) != FRAME_LEN_APP:
            return None
        addr = resp[0]
        status = resp[1]
        cmd = resp[2]
        param = resp[3]
        payload = resp[4 : FRAME_LEN_APP - 1]
        crc = resp[FRAME_LEN_APP - 1]
        return addr, status, cmd, param, payload, crc

    def i16_from_be(self, payload: bytes, offset=0) -> int:
        v = (payload[offset] << 8) | payload[offset + 1]
        if v & 0x8000:
            v -= 0x10000
        return v

    def u16_from_be(self, payload, offset=0) -> int:
        return (payload[offset] << 8) | payload[offset + 1]

    def i32_from_be(self, payload, offset=0) -> int:
        v = (
            (payload[offset] << 24)
            | (payload[offset + 1] << 16)
            | (payload[offset + 2] << 8)
            | payload[offset + 3]
        )
        if v & 0x80000000:
            v -= 0x100000000
        return v

    def u32_from_be(self, payload, offset=0) -> int:
        return (
            (payload[offset] << 24)
            | (payload[offset + 1] << 16)
            | (payload[offset + 2] << 8)
            | payload[offset + 3]
        )

    def adc_to_voltage(self, adc_value, vref=3.3):
        return (adc_value / 4095.0) * vref

    def vadc_to_vin(self, vadc, r_top=200_000.0, r_bottom=68_000.0):
        return vadc * (r_top + r_bottom) / r_bottom

    def req_ping(self):
        resp = self.uart_loop_application(self.uart_message_application(0x00, 0x00))
        parsed = self.parse_resp(resp)
        if not parsed:
            return ["", "", "", "", "", ""]
        addr, status, cmd, param, payload, crc = parsed
        return [
            hex(addr),
            hex(status),
            hex(cmd),
            hex(param),
            payload.hex(),
            hex(crc),
        ]

    def req_serial(self):
        resp = self.uart_loop_application(self.uart_message_application(0x01, 0x00))
        parsed = self.parse_resp(resp)
        if not parsed:
            return 0
        addr, status, cmd, param, payload, crc = parsed
        serial = self.u32_from_be(payload, 0)
        return serial

    def req_fw_hw_version(self):
        resp = self.uart_loop_application(self.uart_message_application(0x01, 0x01))
        parsed = self.parse_resp(resp)
        if not parsed:
            return ["", ""]
        addr, status, cmd, param, payload, crc = parsed
        fw_major, fw_minor, fw_patch = payload[0], payload[1], payload[2]
        hw_major, hw_minor = payload[3], payload[4]
        return [f"{fw_major}.{fw_minor}.{fw_patch}", f"{hw_major}.{hw_minor}"]

    def req_build_date(self):
        resp = self.uart_loop_application(self.uart_message_application(0x01, 0x02))
        parsed = self.parse_resp(resp)
        if not parsed:
            return ""
        addr, status, cmd, param, payload, crc = parsed
        build_date = bytes(payload[:10]).split(b"\x00")[0].decode("ascii")
        return build_date

    def req_prod_date(self):
        resp = self.uart_loop_application(self.uart_message_application(0x01, 0x03))
        parsed = self.parse_resp(resp)
        if not parsed:
            return ""
        addr, status, cmd, param, payload, crc = parsed
        prod_date = bytes(payload[:10]).split(b"\x00")[0].decode("ascii")
        return prod_date

    def req_adc(self):
        resp = self.uart_loop_application(self.uart_message_application(0x02, 0x00))
        parsed = self.parse_resp(resp)
        if not parsed:
            return [0, 0]
        addr, status, cmd, param, payload, crc = parsed
        v0 = self.u16_from_be(payload, 0)
        v1 = self.u16_from_be(payload, 2)
        return [v0, v1]

    def req_sht40(self):
        resp = self.uart_loop_application(self.uart_message_application(0x03, 0x00))
        parsed = self.parse_resp(resp)
        if not parsed:
            return [0.0, 0.0]
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return [0.0, 0.0]
        t_raw = self.i16_from_be(payload, 0)
        rh_raw = self.u16_from_be(payload, 2)
        return [t_raw / 100.0, rh_raw / 100.0]

    def req_bme280(self):
        resp = self.uart_loop_application(self.uart_message_application(0x03, 0x01))
        parsed = self.parse_resp(resp)
        if not parsed:
            return [0.0, 0.0, 0.0]
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return [0.0, 0.0, 0.0]
        temp = self.i32_from_be(payload, 0)
        hum = self.u32_from_be(payload, 4)
        press = self.u32_from_be(payload, 8)
        return [temp / 100.0, hum / 1024.0, press / 25600.0]

    def req_get_input_states(self, channel: int):
        resp = self.uart_loop_application(self.uart_message_application(0x02, channel))
        parsed = self.parse_resp(resp)
        if not parsed:
            return 0
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return 0
        return payload[0]

    def req_output_states(self):
        resp = self.uart_loop_application(self.uart_message_application(0x04, 0x00))
        parsed = self.parse_resp(resp)
        if not parsed:
            return [0, 0, 0, 0, 0]
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return [0, 0, 0, 0, 0]
        led1, led2, r, g, b = payload[0], payload[1], payload[2], payload[3], payload[4]
        return [led1, led2, r, g, b]

    def req_set_output(self, channel: int, on: int):
        resp = self.uart_loop_application(
            self.uart_message_application(0x04, channel, bytes([on & 0xFF]))
        )
        parsed = self.parse_resp(resp)
        if not parsed:
            return 0
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return 0
        return payload[0]

    def req_set_pwm(self, channel: int, duty: int):
        resp = self.uart_loop_application(
            self.uart_message_application(0x05, channel, bytes([duty & 0xFF])),
        )
        parsed = self.parse_resp(resp)
        if not parsed:
            return 0
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return 0
        return payload[0]

    def req_set_rgb(self, r: int, g: int, b: int):
        resp = self.uart_loop_application(
            self.uart_message_application(
                0x05, 0x05, bytes([r & 0xFF, g & 0xFF, b & 0xFF])
            ),
        )
        parsed = self.parse_resp(resp)
        if not parsed:
            return [0, 0, 0]
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return [0, 0, 0]
        return [payload[0], payload[1], payload[2]]

    def req_set_buzzer(self, freq: int, volume: int):
        pl = bytes([(freq >> 8) & 0xFF, freq & 0xFF, volume & 0xFF])
        resp = self.uart_loop_application(self.uart_message_application(0x05, 0x06, pl))
        parsed = self.parse_resp(resp)
        if not parsed:
            return 0
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return 0
        f = self.u16_from_be(payload, 0)
        return f

    def req_rtc_read(self):
        resp = self.uart_loop_application(self.uart_message_application(0x06, 0x00))
        parsed = self.parse_resp(resp)
        if not parsed:
            return ""
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return ""
        yy, mo, dd, wd = payload[0], payload[1], payload[2], payload[3]
        hh, mi, ss = payload[4], payload[5], payload[6]
        return "20{:02d}-{:02d}-{:02d}T{:02d}:{:02d}:{:02d}Z".format(
            yy, mo, dd, hh, mi, ss
        )

    def req_rtc_write(
        self, yy: int, mo: int, dd: int, wd: int, hh: int, mi: int, ss: int
    ):
        pl = bytes(
            [
                yy & 0xFF,
                mo & 0xFF,
                dd & 0xFF,
                wd & 0xFF,
                hh & 0xFF,
                mi & 0xFF,
                ss & 0xFF,
            ]
        )
        resp = self.uart_loop_application(self.uart_message_application(0x06, 0x01, pl))
        parsed = self.parse_resp(resp)
        if not parsed:
            return ""
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return ""
        yy, mo, dd, wd = payload[0], payload[1], payload[2], payload[3]
        hh, mi, ss = payload[4], payload[5], payload[6]
        return "20{:02d}-{:02d}-{:02d} {:02d}:{:02d}:{:02d}".format(
            yy, mo, dd, hh, mi, ss
        )

    def req_rtc_wakeup(self, seconds: int):
        pl = bytes([(seconds >> 8) & 0xFF, seconds & 0xFF])
        resp = self.uart_loop_application(self.uart_message_application(0x06, 0x02, pl))
        parsed = self.parse_resp(resp)
        if not parsed:
            return 0
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return 0
        return payload[0]

    def req_alarm_set(self, hh: int, mi: int, ss: int, daily: int = 1):
        pl = bytes([hh & 0xFF, mi & 0xFF, ss & 0xFF, daily & 0xFF])
        resp = self.uart_loop_application(self.uart_message_application(0x06, 0x03, pl))
        parsed = self.parse_resp(resp)
        if not parsed:
            return 0
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return 0
        return payload[0]

    def req_alarm_off(self):
        resp = self.uart_loop_application(self.uart_message_application(0x06, 0x04))
        parsed = self.parse_resp(resp)
        if not parsed:
            return 0
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return 0
        return payload[0]

    def req_timestamp(self):
        resp = self.uart_loop_application(self.uart_message_application(0x06, 0x05))
        parsed = self.parse_resp(resp)
        if not parsed:
            return ""
        addr, status, cmd, param, payload, crc = parsed
        if status != STATUS_OK:
            return ""
        mo, dd, wd = payload[1], payload[2], payload[3]
        hh, mi, ss = payload[4], payload[5], payload[6]
        return "20{:02d}-{:02d}-{:02d} {:02d}:{:02d}:{:02d}".format(
            0, mo, dd, hh, mi, ss
        )
