#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import time
import threading
from dataclasses import dataclass
from typing import Optional

try:
    import serial
except Exception as e:
    serial = None


@dataclass
class SerialConfig:
    port: str
    baud: int


class SerialManager:
    def __init__(self):
        self.ser: Optional[serial.Serial] = None  # type: ignore
        self.lock = threading.Lock()

    def is_open(self) -> bool:
        return bool(self.ser and self.ser.is_open)

    def open(self, port: str, baud: int) -> None:
        if serial is None:
            raise RuntimeError(
                "No serial module available. Please install pyserial package."
            )
        with self.lock:
            if self.is_open():
                self.close()
            self.ser = serial.Serial(
                port=port,
                baudrate=baud,
                timeout=1.5,
                write_timeout=1.5,
            )
            time.sleep(0.4)
            self._drain_input(0.25)

    def close(self) -> None:
        with self.lock:
            if self.ser:
                try:
                    self.ser.close()
                except Exception:
                    pass
                self.ser = None

    def _drain_input(self, idle_timeout: float = 0.25) -> str:
        if not self.is_open():
            return ""
        assert self.ser
        out = bytearray()
        last = time.time()
        while True:
            n = self.ser.in_waiting
            if n:
                chunk = self.ser.read(n)
                if chunk:
                    out.extend(chunk)
                    last = time.time()
            else:
                if time.time() - last >= idle_timeout:
                    break
                time.sleep(0.01)
        return out.decode("utf-8", errors="replace")

    def send_command(
        self, cmd: str, total_timeout: float = 2.0, idle_timeout: float = 0.3
    ) -> str:
        if not self.is_open():
            raise RuntimeError("Port is not open")
        with self.lock:
            assert self.ser
            data = (cmd.rstrip("\r\n") + "\n").encode("utf-8")
            self.ser.write(data)
            self.ser.flush()
            cmd_l = cmd.strip().lower()
            expect_show_end = cmd_l == "show"
            expect_help_end = cmd_l.startswith("help")
            out = bytearray()
            start = time.time()
            deadline = start + total_timeout
            last = start
            while True:
                n = self.ser.in_waiting
                if n:
                    chunk = self.ser.read(n)
                    if chunk:
                        out.extend(chunk)
                        last = time.time()
                        if expect_show_end and (
                            b"\nSHOW_END\n" in out or b"\r\nSHOW_END\r\n" in out
                        ):
                            break
                        if expect_help_end and (
                            b"\nHELP_END\n" in out or b"\r\nHELP_END\r\n" in out
                        ):
                            break
                else:
                    now = time.time()
                    if now >= deadline:
                        break
                    if not (expect_show_end or expect_help_end):
                        if (now - last) >= idle_timeout:
                            break
                    time.sleep(0.01)
            time.sleep(0.1)
            tail = self._drain_input(0.2)
            if tail:
                out.extend(tail.encode("utf-8", errors="replace"))
            text = out.decode("utf-8", errors="replace")
            if expect_show_end:
                text = text.replace("\r\nSHOW_END\r\n", "\n").replace(
                    "\nSHOW_END\n", "\n"
                )
            if expect_help_end:
                text = text.replace("\r\nHELP_END\r\n", "\n").replace(
                    "\nHELP_END\n", "\n"
                )
            return text
