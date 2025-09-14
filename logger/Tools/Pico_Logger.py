"""
Pico Logger GUI for Pico Loggers :).

@author: piotrklys
@mail: piotr.klys92@gmail.com
"""

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tkinter as tk
from pico_logger.__main__ import App
from pico_logger.config.config import ConfigInformations

if __name__ == "__main__":
    root = tk.Tk()
    img = tk.PhotoImage(data=ConfigInformations().get_icon_path())
    root.iconphoto(False, img)
    app = App(root)
    root.mainloop()
