import threading
import time
import re
import csv
import sys
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import serial
from serial.tools import list_ports
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
import matplotlib.pyplot as plt


class SerialPlotApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("INA226 Live")

        self.serial_port = None
        self.reader_thread = None
        self.stop_event = threading.Event()
        self.connected = False
        self.baudrate = 115200

        self.timestamps = []
        self.voltage_v = []
        self.current_a = []
        self.power_w = []

        self.csv_re = re.compile(
            r"^\s*([+-]?(?:\d+\.\d+|\d+))(?:\s*),(?:\s*)([+-]?(?:\d+\.\d+|\d+))(?:\s*),(?:\s*)([+-]?(?:\d+\.\d+|\d+))\s*$"
        )

        self._build_ui()
        self._refresh_ports()
        self._schedule_plot_update()

    def _build_ui(self):
        top = ttk.Frame(self.root)
        top.pack(side=tk.TOP, fill=tk.X, padx=8, pady=8)

        ttk.Label(top, text="Port").pack(side=tk.LEFT)
        self.port_var = tk.StringVar()
        self.port_combo = ttk.Combobox(
            top, textvariable=self.port_var, width=28, state="readonly"
        )
        self.port_combo.pack(side=tk.LEFT, padx=6)

        self.refresh_btn = ttk.Button(top, text="Refresh", command=self._refresh_ports)
        self.refresh_btn.pack(side=tk.LEFT, padx=4)

        self.connect_btn = ttk.Button(top, text="Connect", command=self._toggle_connect)
        self.connect_btn.pack(side=tk.LEFT, padx=12)

        self.status_var = tk.StringVar(value="Disconnected")
        ttk.Label(top, textvariable=self.status_var).pack(side=tk.LEFT, padx=12)

        plot_frame = ttk.Frame(self.root)
        plot_frame.pack(side=tk.TOP, fill=tk.BOTH, expand=True, padx=8, pady=4)

        self.fig, self.ax = plt.subplots(figsize=(9, 5))
        (self.line_v,) = self.ax.plot([], [], label="Voltage [V]", color="#1f77b4")
        (self.line_i,) = self.ax.plot([], [], label="Current [A]", color="#ff7f0e")
        (self.line_p,) = self.ax.plot([], [], label="Power [W]", color="#2ca02c")
        self.ax.set_xlabel("Samples")
        self.ax.set_ylabel("Value")
        self.ax.grid(True, linestyle=":", alpha=0.6)
        self.ax.legend(loc="upper right")

        self.canvas = FigureCanvasTkAgg(self.fig, master=plot_frame)
        self.canvas.draw()
        self.canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=True)

        self.toolbar = NavigationToolbar2Tk(self.canvas, plot_frame)
        self.toolbar.update()

        actions = ttk.Frame(self.root)
        actions.pack(side=tk.TOP, fill=tk.X, padx=8, pady=8)

        self.save_img_btn = ttk.Button(
            actions, text="Save Plot Image", command=self._save_image
        )
        self.save_img_btn.pack(side=tk.LEFT)

        self.save_csv_btn = ttk.Button(
            actions, text="Export CSV", command=self._save_csv
        )
        self.save_csv_btn.pack(side=tk.LEFT, padx=8)

        self.clear_btn = ttk.Button(
            actions, text="Clear Data", command=self._clear_data
        )
        self.clear_btn.pack(side=tk.LEFT, padx=8)

        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    def _refresh_ports(self):
        ports = [p.device for p in list_ports.comports()]
        self.port_combo["values"] = ports
        if ports and not self.port_var.get():
            self.port_var.set(ports[0])

    def _toggle_connect(self):
        if self.connected:
            self._disconnect()
        else:
            self._connect()

    def _connect(self):
        port = self.port_var.get()
        if not port:
            messagebox.showwarning("No Port", "Please select a COM port.")
            return

        try:
            self.serial_port = serial.Serial(
                port=port, baudrate=self.baudrate, timeout=1
            )
        except Exception as e:
            messagebox.showerror("Connection Error", f"Failed to open {port}:\n{e}")
            return

        self.stop_event.clear()
        self.reader_thread = threading.Thread(target=self._reader_loop, daemon=True)
        self.reader_thread.start()

        self.connected = True
        self.status_var.set(f"Connected to {port} @ {self.baudrate} baud")
        self.connect_btn.configure(text="Disconnect")
        self.port_combo.configure(state="disabled")
        self.refresh_btn.configure(state="disabled")

    def _disconnect(self):
        self.stop_event.set()
        if self.reader_thread and self.reader_thread.is_alive():
            try:
                self.reader_thread.join(timeout=2)
            except Exception:
                pass
        if self.serial_port and self.serial_port.is_open:
            try:
                self.serial_port.close()
            except Exception:
                pass
        self.reader_thread = None
        self.serial_port = None
        self.connected = False
        self.status_var.set("Disconnected")
        self.connect_btn.configure(text="Connect")
        self.port_combo.configure(state="readonly")
        self.refresh_btn.configure(state="normal")

    def _reader_loop(self):
        while not self.stop_event.is_set():
            try:
                line_bytes = self.serial_port.readline()
            except Exception:
                break
            if not line_bytes:
                continue
            try:
                line = line_bytes.decode("utf-8", errors="ignore").strip()
            except Exception:
                continue
            m = self.csv_re.match(line)
            if not m:
                continue
            try:
                v = float(m.group(1))
                i = float(m.group(2))
                p = float(m.group(3))
            except ValueError:
                continue

            ts = time.time()
            self.timestamps.append(ts)
            self.voltage_v.append(v)
            self.current_a.append(i)
            self.power_w.append(p)

    def _schedule_plot_update(self):
        self._update_plot()
        self.root.after(200, self._schedule_plot_update)

    def _update_plot(self):
        n = len(self.voltage_v)
        if n == 0:
            return
        x = list(range(n))
        self.line_v.set_data(x, self.voltage_v)
        self.line_i.set_data(x, self.current_a)
        self.line_p.set_data(x, self.power_w)

        # Autoscale axes to data
        self.ax.relim()
        self.ax.autoscale_view()
        self.canvas.draw_idle()

    def _save_image(self):
        path = filedialog.asksaveasfilename(
            title="Save Plot Image",
            defaultextension=".png",
            filetypes=[
                ("PNG", "*.png"),
                ("JPEG", "*.jpg"),
                ("SVG", "*.svg"),
                ("All Files", "*.*"),
            ],
        )
        if not path:
            return
        try:
            self.fig.savefig(path, dpi=150)
            messagebox.showinfo("Saved", f"Image saved to:\n{path}")
        except Exception as e:
            messagebox.showerror("Save Error", f"Failed to save image:\n{e}")

    def _save_csv(self):
        if not self.timestamps:
            messagebox.showwarning("No Data", "There is no data to export.")
            return
        path = filedialog.asksaveasfilename(
            title="Export CSV",
            defaultextension=".csv",
            filetypes=[("CSV", "*.csv"), ("All Files", "*.*")],
        )
        if not path:
            return
        try:
            with open(path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["timestamp", "voltage_V", "current_A", "power_W"])
                for ts, v, i, p in zip(
                    self.timestamps, self.voltage_v, self.current_a, self.power_w
                ):
                    writer.writerow([ts, v, i, p])
            messagebox.showinfo("Saved", f"CSV exported to:\n{path}")
        except Exception as e:
            messagebox.showerror("Save Error", f"Failed to save CSV:\n{e}")

    def _clear_data(self):
        self.timestamps.clear()
        self.voltage_v.clear()
        self.current_a.clear()
        self.power_w.clear()
        self.line_v.set_data([], [])
        self.line_i.set_data([], [])
        self.line_p.set_data([], [])
        self.ax.relim()
        self.ax.autoscale_view()
        self.canvas.draw_idle()

    def _on_close(self):
        try:
            if self.connected:
                self._disconnect()
        finally:
            self.root.destroy()


def main():
    try:
        if sys.platform.startswith("win"):
            from ctypes import windll

            windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        pass

    root = tk.Tk()
    app = SerialPlotApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
