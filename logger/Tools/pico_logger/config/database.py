import os
import sys
import sqlite3


class DatabaseConnection:
    def __init__(self, query, data=""):
        self.__path = "pico_logger/data/config.db"
        self.query = query
        self.data = data
        self.__relative_path = self.__resource_path()

    def __resource_path(self):
        try:
            base_path = sys._MEIPASS
        except Exception:
            base_path = os.path.abspath(".")
        return os.path.join(base_path, self.__path)

    def __init_connection(self):
        print(self.__relative_path)
        self.__conn = sqlite3.connect(self.__relative_path)
        self.__cur = self.__conn.cursor()

    def get_one_data(self):
        self.__init_connection()
        self.__cur.execute(self.query)
        data = self.__cur.fetchone()[0]
        self.__conn.close()
        return data

    def update_data(self):
        self.__init_connection()
        self.__cur.execute(self.query, self.data)
        self.__conn.commit()
        self.__conn.close()
