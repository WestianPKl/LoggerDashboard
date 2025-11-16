from machine import UART, Pin
import utime


def crc16_modbus(data: bytes) -> int:
    crc = 0xFFFF
    for b in data:
        crc ^= b
        for _ in range(8):
            if crc & 0x0001:
                crc = (crc >> 1) ^ 0xA001
            else:
                crc >>= 1
    return crc & 0xFFFF


class ModbusRTUMaster:
    def __init__(self, uart: UART, de_re_pin: Pin, timeout_ms: int = 200):
        if uart is None or de_re_pin is None:
            raise ValueError("uart and de_re_pin are required")
        self.uart = uart
        self.de_re = de_re_pin
        self.de_re.init(Pin.OUT, value=0)
        self.timeout_ms = max(1, int(timeout_ms))

    def _tx_mode(self):
        self.de_re.value(1)

    def _rx_mode(self):
        self.de_re.value(0)

    def _write_frame(self, frame: bytes) -> bool:
        try:
            _ = self.uart.read()
        except Exception:
            pass

        try:
            self._tx_mode()
            utime.sleep_us(50)
            self.uart.write(frame)
            if hasattr(self.uart, "flush"):
                try:
                    self.uart.flush()
                except Exception:
                    pass
            utime.sleep_ms(5)
            return True
        except Exception:
            return False
        finally:
            self._rx_mode()

    def _read_exact(self, nbytes: int) -> bytes | None:
        if nbytes <= 0:
            return b""
        buf = bytearray()
        t0 = utime.ticks_ms()
        while len(buf) < nbytes:
            if utime.ticks_diff(utime.ticks_ms(), t0) > self.timeout_ms:
                return None
            try:
                chunk = self.uart.read(1)
            except Exception:
                return None
            if chunk:
                buf += chunk
        return bytes(buf)

    def _send_request(
        self, slave_addr: int, pdu: bytes, expected_min_len: int
    ) -> bytes | None:
        slave_addr &= 0xFF
        adu = bytes([slave_addr]) + pdu
        crc = crc16_modbus(adu)
        frame = adu + bytes([crc & 0xFF, (crc >> 8) & 0xFF])

        if not self._write_frame(frame):
            return None

        hdr = self._read_exact(2)
        if hdr is None:
            return None
        resp_addr, func = hdr[0], hdr[1]
        if resp_addr != slave_addr:
            return None

        if func & 0x80:
            rest = self._read_exact(1 + 2)
            return hdr + (rest or b"")

        utime.sleep_ms(5)
        buf = bytearray(hdr)
        t0 = utime.ticks_ms()
        while utime.ticks_diff(utime.ticks_ms(), t0) < self.timeout_ms:
            try:
                chunk = self.uart.read()
            except Exception:
                break
            if not chunk:
                utime.sleep_ms(1)
                continue
            buf += chunk

        if len(buf) < expected_min_len:
            return None

        if len(buf) < 4:
            return None
        data, crc_lo, crc_hi = buf[:-2], buf[-2], buf[-1]
        calc_crc = crc16_modbus(data)
        if (calc_crc & 0xFF) != crc_lo or ((calc_crc >> 8) & 0xFF) != crc_hi:
            return None

        return bytes(buf)

    def read_holding_registers(self, slave_addr: int, start_addr: int, count: int):
        if count <= 0 or count > 125:
            raise ValueError("Register count out of range 1..125")
        if not (0 <= start_addr <= 0xFFFF):
            raise ValueError("start_addr out of range 0..65535")
        if not (1 <= (slave_addr & 0xFF) <= 247):
            raise ValueError("slave_addr out of recommended range 1..247")

        pdu = bytes(
            [
                0x03,
                (start_addr >> 8) & 0xFF,
                start_addr & 0xFF,
                (count >> 8) & 0xFF,
                count & 0xFF,
            ]
        )

        expected_min = 2 + 1 + 2 * count + 2
        resp = self._send_request(slave_addr, pdu, expected_min)
        if resp is None:
            return None

        if resp[1] != 0x03:
            return None
        byte_count = resp[2]
        if byte_count != 2 * count:
            return None

        regs = []
        offset = 3
        for i in range(count):
            hi = resp[offset + 2 * i]
            lo = resp[offset + 2 * i + 1]
            regs.append((hi << 8) | lo)

        return regs

    def write_single_register(self, slave_addr: int, reg_addr: int, value: int) -> bool:
        if not (0 <= reg_addr <= 0xFFFF):
            raise ValueError("reg_addr out of range 0..65535")
        if not (0 <= value <= 0xFFFF):
            raise ValueError("value out of range 0..65535")
        if not (1 <= (slave_addr & 0xFF) <= 247):
            raise ValueError("slave_addr out of recommended range 1..247")
        value &= 0xFFFF
        pdu = bytes(
            [
                0x06,
                (reg_addr >> 8) & 0xFF,
                reg_addr & 0xFF,
                (value >> 8) & 0xFF,
                value & 0xFF,
            ]
        )

        expected_min = 2 + 5 + 2
        resp = self._send_request(slave_addr, pdu, expected_min)
        if resp is None:
            return False

        if resp[1] != 0x06:
            return False
        if resp[2:6] != pdu[1:5]:
            return False

        return True


class ModbusRTUSlave:
    def __init__(self, uart: UART, de_re_pin: Pin, slave_addr: int, num_regs: int = 32):
        if uart is None or de_re_pin is None:
            raise ValueError("uart and de_re_pin are required")
        if num_regs <= 0:
            raise ValueError("num_regs must be > 0")
        self.uart = uart
        self.de_re = de_re_pin
        self.de_re.init(Pin.OUT, value=0)
        self.slave_addr = slave_addr & 0xFF
        self.regs = [0] * int(num_regs)

    def _tx_mode(self):
        self.de_re.value(1)

    def _rx_mode(self):
        self.de_re.value(0)

    def _send_frame(self, pdu: bytes):
        adu = bytes([self.slave_addr]) + pdu
        crc = crc16_modbus(adu)
        frame = adu + bytes([crc & 0xFF, (crc >> 8) & 0xFF])
        try:
            self._tx_mode()
            utime.sleep_us(50)
            self.uart.write(frame)
            if hasattr(self.uart, "flush"):
                try:
                    self.uart.flush()
                except Exception:
                    pass
            utime.sleep_ms(5)
        except Exception:
            pass
        finally:
            self._rx_mode()

    def _handle_request(self, frame: bytes):
        if len(frame) < 4:
            return

        addr = frame[0]
        if addr != self.slave_addr:
            return

        data = frame[:-2]
        crc_lo = frame[-2]
        crc_hi = frame[-1]
        calc_crc = crc16_modbus(data)
        if (calc_crc & 0xFF) != crc_lo or ((calc_crc >> 8) & 0xFF) != crc_hi:
            return

        func = frame[1]

        if func == 0x03 and len(frame) >= 8:
            start = (frame[2] << 8) | frame[3]
            count = (frame[4] << 8) | frame[5]
            if count <= 0 or start + count > len(self.regs):
                self._send_frame(bytes([func | 0x80, 0x02]))
                return

            byte_count = count * 2
            resp = bytearray()
            resp.append(func)
            resp.append(byte_count)
            for i in range(count):
                val = self.regs[start + i] & 0xFFFF
                resp.append((val >> 8) & 0xFF)
                resp.append(val & 0xFF)
            self._send_frame(bytes(resp))
            return

        if func == 0x06 and len(frame) >= 8:
            reg_addr = (frame[2] << 8) | frame[3]
            value = (frame[4] << 8) | frame[5]
            if reg_addr >= len(self.regs):
                self._send_frame(bytes([func | 0x80, 0x02]))
                return
            self.regs[reg_addr] = value & 0xFFFF
            self._send_frame(frame[1:-2])
            return

        self._send_frame(bytes([func | 0x80, 0x01]))

    def poll(self):
        try:
            data = self.uart.read()
        except Exception:
            return
        if not data:
            return
        self._handle_request(data)
