import time
import threading
from typing import Dict, List

try:
    import serial
    import serial.tools.list_ports
except Exception as e:
    serial = None

import tkinter as tk
from tkinter import ttk, messagebox
from tkinter.scrolledtext import ScrolledText
from .config.config import ConfigInformations
from .serial_manager import SerialManager


def list_serial_ports() -> List[str]:
    if serial is None:
        return []
    return [p.device for p in serial.tools.list_ports.comports()]


def parse_show(text: str) -> Dict[str, str]:
    cfg: Dict[str, str] = {}
    for line in text.splitlines():
        if not line.strip():
            continue
        if "=" not in line:
            continue
        key, val = line.split("=", 1)
        cfg[key.strip()] = val.strip()
    return cfg


class App:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Pico Logger Config Tool")
        self.serman = SerialManager()
        self.last_cfg: Dict[str, str] = {}

        self.port_var = tk.StringVar()
        self.baud_var = tk.IntVar(value=115200)
        self.status_var = tk.StringVar(value="Disconnected")
        self.echo_var = tk.StringVar(value="")

        menubar = tk.Menu(root)
        file = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file)
        file.add_command(label="Exit", command=root.destroy)
        root.config(menu=menubar)

        self.vars_num: Dict[str, tk.IntVar] = {
            k: tk.IntVar(value=0) for k in ConfigInformations().get_num_keys()
        }
        self.vars_str: Dict[str, tk.StringVar] = {
            k: tk.StringVar(value="") for k in ConfigInformations().get_str_keys()
        }

        self._build_ui()
        self._refresh_ports()

    def _build_ui(self):
        top = ttk.Frame(self.root)
        top.pack(fill=tk.X, padx=8, pady=8)

        ttk.Label(top, text="Port:").pack(side=tk.LEFT)
        self.ports_cb = ttk.Combobox(
            top, textvariable=self.port_var, width=30, state="readonly"
        )
        self.ports_cb.pack(side=tk.LEFT, padx=4)
        ttk.Button(top, text="Refresh", command=self._refresh_ports).pack(
            side=tk.LEFT, padx=4
        )

        ttk.Label(top, text="Baud:").pack(side=tk.LEFT, padx=(12, 0))
        self.baud_cb = ttk.Combobox(
            top,
            textvariable=self.baud_var,
            width=10,
            state="readonly",
            values=[9600, 19200, 38400, 57600, 115200, 230400, 460800],
        )
        self.baud_cb.pack(side=tk.LEFT, padx=4)

        self.connect_btn = ttk.Button(top, text="Connect", command=self.on_connect)
        self.connect_btn.pack(side=tk.LEFT, padx=8)
        self.disconnect_btn = ttk.Button(
            top, text="Disconnect", command=self.on_disconnect, state=tk.DISABLED
        )
        self.disconnect_btn.pack(side=tk.LEFT, padx=4)

        ttk.Label(top, textvariable=self.status_var).pack(side=tk.LEFT, padx=12)

        fields = ttk.LabelFrame(self.root, text="Configuration")
        fields.pack(fill=tk.X, padx=8, pady=8)

        def add_row(parent, r, label, widget):
            ttk.Label(parent, text=label, width=18, anchor=tk.W).grid(
                row=r, column=0, sticky=tk.W, padx=4, pady=2
            )
            widget.grid(row=r, column=1, sticky=tk.W + tk.E, padx=4, pady=2)

        r = 0
        for key in ["logger_id", "sensor_id", "server_port"]:
            if key == "logger_id":
                name = "Logger ID (0-255)"
            elif key == "sensor_id":
                name = "Sensor ID (0-255)"
            elif key == "server_port":
                name = "Server Port (1-65535)"
            add_row(
                fields,
                r,
                name,
                ttk.Entry(fields, textvariable=self.vars_num[key], width=20),
            )
            r += 1

        # post_time combobox (maps to vars_num["post_time_ms"]) with presets
        self.post_time_combo_var = tk.StringVar(value="10 min")
        self.post_time_combo = ttk.Combobox(
            fields,
            textvariable=self.post_time_combo_var,
            state="readonly",
            width=20,
            values=["1 min", "5 min", "10 min"],
        )

        def _on_post_time_change():
            label = self.post_time_combo_var.get()
            mapping = {"1 min": 60000, "5 min": 300000, "10 min": 600000}
            self.vars_num["post_time_ms"].set(mapping.get(label, 600000))

        self.post_time_combo.bind(
            "<<ComboboxSelected>>", lambda e: _on_post_time_change()
        )
        add_row(fields, r, "Logging Interval", self.post_time_combo)
        r += 1

        for key in [
            "temperature",
            "humidity",
            "pressure",
            "sht",
            "clock",
            "set_time",
            "logging_enabled",
            "wifi_enabled",
        ]:
            match key:
                case "set_time":
                    name = "Set time on connect"
                case "wifi_enabled":
                    name = "Wi-Fi Enabled"
                case "logging_enabled":
                    name = "Logging Enabled"
                case "sht":
                    name = "SHT Sensor"
                case "clock":
                    name = "Real Time Clock"
                case "temperature":
                    name = "Temperature"
                case "humidity":
                    name = "Humidity"
                case "pressure":
                    name = "Pressure"
            add_row(
                fields, r, name, ttk.Checkbutton(fields, variable=self.vars_num[key])
            )
            r += 1

        add_row(
            fields,
            r,
            "Server IP",
            ttk.Entry(fields, textvariable=self.vars_str["server_ip"], width=32),
        )
        r += 1
        add_row(
            fields,
            r,
            "Wi-Fi SSID",
            ttk.Entry(fields, textvariable=self.vars_str["wifi_ssid"], width=32),
        )
        r += 1
        self._pw_entry = ttk.Entry(
            fields, textvariable=self.vars_str["wifi_password"], width=32, show="*"
        )
        add_row(fields, r, "Wi-Fi Password", self._pw_entry)
        r += 1
        self._show_pw = tk.BooleanVar(value=False)

        def toggle_pw():
            self._pw_entry.config(show="" if self._show_pw.get() else "*")

        ttk.Checkbutton(
            fields, text="Show password", variable=self._show_pw, command=toggle_pw
        ).grid(row=r - 1, column=2, sticky=tk.W, padx=6)

        actions = ttk.Frame(self.root)
        actions.pack(fill=tk.X, padx=8, pady=4)
        ttk.Button(actions, text="Apply (set)", command=self.on_apply).pack(
            side=tk.LEFT, padx=4
        )
        ttk.Button(actions, text="Refresh (show)", command=self.on_refresh).pack(
            side=tk.LEFT, padx=4
        )
        ttk.Button(actions, text="Reconnect Wi‑Fi", command=self.on_reconnect).pack(
            side=tk.LEFT, padx=8
        )
        ttk.Button(actions, text="Help (all)", command=self.on_help_all).pack(
            side=tk.LEFT, padx=4
        )
        ttk.Button(actions, text="Reset device", command=self.on_reset).pack(
            side=tk.LEFT, padx=8
        )

        echo_bar = ttk.Frame(self.root)
        echo_bar.pack(fill=tk.X, padx=8, pady=(0, 6))
        ttk.Label(echo_bar, text="Echo:").pack(side=tk.LEFT)
        ttk.Entry(echo_bar, textvariable=self.echo_var, width=30).pack(
            side=tk.LEFT, padx=4
        )
        ttk.Button(echo_bar, text="Send", command=self.on_echo).pack(
            side=tk.LEFT, padx=4
        )

        logf = ttk.LabelFrame(self.root, text="Log")
        logf.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)
        self.log = ScrolledText(logf, height=12, wrap=tk.WORD)
        self.log.pack(fill=tk.BOTH, expand=True)

    def log_msg(self, msg: str):
        self.log.insert(tk.END, msg + "\n")
        self.log.see(tk.END)

    def _refresh_ports(self):
        ports = list_serial_ports()
        self.ports_cb["values"] = ports
        if ports:
            preferred = [p for p in ports if "/dev/cu." in p]
            self.port_var.set(preferred[0] if preferred else ports[0])
        else:
            self.port_var.set("")

    def on_connect(self):
        if self.serman.is_open():
            return
        port = self.port_var.get().strip()
        baud = int(self.baud_var.get())
        if not port:
            messagebox.showwarning("Port", "Select COM port")
            return
        self._set_ui_busy(True)

        def worker():
            try:
                self.serman.open(port, baud)
                self._set_status("Connected: %s @ %d" % (port, baud))
                self.log_msg(f"[INFO] Connected to {port} @ {baud}")
                time.sleep(0.25)
                ready = self.serman._drain_input(0.15)
                if ready:
                    for line in ready.splitlines():
                        self.log_msg("[DEV] " + line)
                self._do_show_and_fill()
            except Exception as e:
                self._set_status("Connection error")
                self.log_msg(f"[ERR] {e}")
                messagebox.showerror("Connection", str(e))
            finally:
                self._set_ui_busy(False)

        threading.Thread(target=worker, daemon=True).start()

    def on_disconnect(self):
        self.serman.close()
        self._set_status("Disconnected")
        self.log_msg("[INFO] Disconnected")

    def _set_language(self):
        if ConfigInformations().get_language() == "english":
            ConfigInformations().set_language("polish")
            messagebox.showinfo(
                "Language", "Language set to Polish. Restart app to apply."
            )
        else:
            ConfigInformations().set_language("english")
            messagebox.showinfo(
                "Language", "Language set to English. Restart app to apply."
            )

    def _set_status(self, txt: str):
        self.status_var.set(txt)

    def _set_ui_busy(self, busy: bool):
        state = tk.DISABLED if busy else tk.NORMAL
        self.connect_btn["state"] = tk.DISABLED if busy else tk.NORMAL
        self.disconnect_btn["state"] = state

    def _do_show_and_fill(self):
        if not self.serman.is_open():
            return
        self.log_msg("[TX] show")
        resp = self.serman.send_command("show", total_timeout=3.0, idle_timeout=0.5)
        for line in resp.splitlines():
            self.log_msg("[RX] " + line)
        cfg = parse_show(resp)
        if not cfg:
            self.log_msg("[WARN] No data from 'show'")
            return
        self.last_cfg = cfg
        self._fill_fields_from_cfg(cfg)

    def _fill_fields_from_cfg(self, cfg: Dict[str, str]):
        for k in ConfigInformations().get_num_keys():
            if k in cfg:
                try:
                    self.vars_num[k].set(int(cfg[k]))
                except Exception:
                    self.vars_num[k].set(0)
        for k in ConfigInformations().get_str_keys():
            if k in cfg:
                self.vars_str[k].set(cfg[k])
        # sync combobox label with post_time_ms
        try:
            ms = int(cfg.get("post_time_ms", "600000") or 600000)
        except Exception:
            ms = 600000
        if ms <= 60000:
            self.post_time_combo_var.set("1 min")
            self.vars_num["post_time_ms"].set(60000)
        elif ms <= 300000:
            self.post_time_combo_var.set("5 min")
            self.vars_num["post_time_ms"].set(300000)
        else:
            self.post_time_combo_var.set("10 min")
            self.vars_num["post_time_ms"].set(600000)

    def _collect_cfg_from_fields(self) -> Dict[str, str]:
        out: Dict[str, str] = {}
        for k, v in self.vars_num.items():
            out[k] = str(int(v.get()))
        for k, v in self.vars_str.items():
            out[k] = v.get()
        return out

    def on_refresh(self):
        if not self.serman.is_open():
            messagebox.showinfo("Refresh", "First connect to the device")
            return
        self._set_ui_busy(True)
        threading.Thread(target=self._thread_refresh, daemon=True).start()

    def _thread_refresh(self):
        try:
            self._do_show_and_fill()
        finally:
            self._set_ui_busy(False)

    def on_save(self):
        if not self.serman.is_open():
            messagebox.showinfo("Save", "First connect to the device")
            return
        self._set_ui_busy(True)

        def worker():
            try:
                self.log_msg("[TX] save")
                resp = self.serman.send_command("save")
                for line in resp.splitlines():
                    self.log_msg("[RX] " + line)
            finally:
                self._set_ui_busy(False)

        threading.Thread(target=worker, daemon=True).start()

    def on_load(self):
        if not self.serman.is_open():
            messagebox.showinfo("Load", "First connect to the device")
            return
        self._set_ui_busy(True)

        def worker():
            try:
                self.log_msg("[TX] load")
                resp = self.serman.send_command("load")
                for line in resp.splitlines():
                    self.log_msg("[RX] " + line)
                time.sleep(0.1)
                self._do_show_and_fill()
            finally:
                self._set_ui_busy(False)

        threading.Thread(target=worker, daemon=True).start()

    def on_reconnect(self):
        if not self.serman.is_open():
            messagebox.showinfo("Reconnect", "First connect to the device")
            return
        self._set_ui_busy(True)

        def worker():
            try:
                self.log_msg("[TX] reconnect")
                resp = self.serman.send_command("reconnect")
                for line in resp.splitlines():
                    self.log_msg("[RX] " + line)
            finally:
                self._set_ui_busy(False)

        threading.Thread(target=worker, daemon=True).start()

    def on_help_all(self):
        if not self.serman.is_open():
            messagebox.showinfo("Help", "First connect to the device")
            return
        self._set_ui_busy(True)

        def worker():
            try:
                self.log_msg("[TX] help all")
                resp = self.serman.send_command(
                    "help all", total_timeout=5.0, idle_timeout=0.4
                )
                for line in resp.splitlines():
                    self.log_msg("[RX] " + line)
            finally:
                self._set_ui_busy(False)

        threading.Thread(target=worker, daemon=True).start()

    def on_reset(self):
        if not self.serman.is_open():
            messagebox.showinfo("Reset", "First connect to the device")
            return
        if not messagebox.askyesno(
            "Reset device",
            "Are you sure you want to reboot the device now?\n\nThe serial connection will drop for a moment.",
        ):
            return
        self._set_ui_busy(True)

        def worker():
            try:
                self.log_msg("[TX] reset")
                try:
                    resp = self.serman.send_command(
                        "reset", total_timeout=1.5, idle_timeout=0.2
                    )
                except Exception as e:
                    # It's normal that port may drop during reset; log and proceed
                    self.log_msg(f"[WARN] {e}")
                    resp = ""
                if resp:
                    for line in resp.splitlines():
                        self.log_msg("[RX] " + line)
                self._set_status("Rebooting... wait 2-3s, then reconnect")
            finally:
                # We don't auto-disconnect; device will reboot and port may change state
                self._set_ui_busy(False)

        threading.Thread(target=worker, daemon=True).start()

    def on_echo(self):
        if not self.serman.is_open():
            messagebox.showinfo("Echo", "First connect to the device")
            return
        txt = (self.echo_var.get() or "").strip()
        if txt == "":
            messagebox.showinfo("Echo", "Enter text to send")
            return
        self._set_ui_busy(True)

        def worker():
            try:
                cmd = f"echo {txt}"
                self.log_msg(f"[TX] {cmd}")
                resp = self.serman.send_command(cmd)
                for line in resp.splitlines():
                    self.log_msg("[RX] " + line)
            finally:
                self._set_ui_busy(False)

        threading.Thread(target=worker, daemon=True).start()

    def on_apply(self):
        if not self.serman.is_open():
            messagebox.showinfo("Apply", "First connect to the device")
            return
        desired = self._collect_cfg_from_fields()
        to_update: List[tuple[str, str]] = []
        if not self.last_cfg:
            for k in ConfigInformations().get_all_keys():
                if k in desired:
                    to_update.append((k, desired[k]))
        else:
            for k in ConfigInformations().get_all_keys():
                if k in desired:
                    if self.last_cfg.get(k, "") != desired[k]:
                        to_update.append((k, desired[k]))
        if not to_update:
            self.log_msg("[INFO] No changes to send")
            return

        self._set_ui_busy(True)

        def worker():
            try:
                for key, val in to_update:
                    cmd = self._format_set_cmd(key, val)
                    self.log_msg(f"[TX] {cmd.strip()}")
                    resp = self.serman.send_command(cmd)
                    for line in resp.splitlines():
                        self.log_msg("[RX] " + line)
                    time.sleep(0.06)
                # Auto-save after applying changes so they persist after restart
                self.log_msg("[TX] save")
                resp = self.serman.send_command("save")
                for line in resp.splitlines():
                    self.log_msg("[RX] " + line)
                time.sleep(0.12)
                self._do_show_and_fill()
            finally:
                self._set_ui_busy(False)

        threading.Thread(target=worker, daemon=True).start()

    def _format_set_cmd(self, key: str, val: str) -> str:
        if key in ConfigInformations().get_str_keys():
            return f"set {key}={val}"
        else:
            return f"set {key} {val}"
