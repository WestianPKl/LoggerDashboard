import machine, time, ujson, os
from mqtt_simple import MQTTClient
from stm32_uart import STM32UART

MQTT_SERVER = "192.168.18.6"
MQTT_PORT = 1883
MQTT_USER = "pico_user"
MQTT_PASSWORD = "HASLO"
MQTT_KEEPALIVE = 7200


class Program:
    def __init__(self):
        self.client = None
        self.topic_status = None
        self.status_data = []
        self.load_data()
        self.device_id = str(self.status_data.get("loggerId", "2"))
        self.ip_address = None
        self.stm32: STM32UART = None
        self.errors = {}

        self.input_channels = [
            (0x01, "BTN1"),
            (0x02, "BTN2"),
            (0x03, "ESP32_STATUS"),
        ]

        self.output_channels = [
            (0x01, "LED1"),
            (0x02, "LED2"),
            (0x03, "PB12"),
            (0x04, "PC0"),
            (0x05, "PC1"),
            (0x06, "PC2"),
            (0x07, "PC3"),
            (0x08, "ESP32_STATUS"),
        ]

        self.pwm_channels = [
            (0x01, "TIM1_CH1"),
            (0x02, "TIM2_CH3"),
            (0x03, "TIM4_CH3"),
            (0x04, "TIM4_CH4"),
        ]

    def get_client(self):
        return self.client

    def set_client(self, client):
        self.client = client

    def set_ip_address(self, ip_address):
        self.ip_address = ip_address

    def mqtt_initialization(self):
        self.client = MQTTClient(
            client_id=self.device_id,
            server=MQTT_SERVER,
            port=MQTT_PORT,
            user=MQTT_USER,
            password=MQTT_PASSWORD,
            keepalive=MQTT_KEEPALIVE,
        )

        self.client.set_callback(self.message_mqtt)
        self.client.connect()
        self.client.subscribe(f"devices/{self.device_id}/cmd")
        return self.client

    def send_status(self, result, typeData="STATUS", info=None):
        payload = {
            "result": result,
            "info": info,
            "type": typeData,
            "timestamp": time.time(),
        }
        if self.client is None:
            raise Exception("MQTT client is not connected")
        self.client.publish(self.topic_status, ujson.dumps(payload))

    def message_mqtt(self, topic, msg):
        data = ujson.loads(msg)
        cmd = data.get("cmd")
        params = data.get("params", {})
        if cmd == "PING":
            self.send_status("ALIVE")
        elif cmd == "RESET":
            machine.reset()
        elif cmd == "READ_INPUTS":
            inputs = {}
            for channel_id, channel_name in self.input_channels:
                value = self.stm32.req_get_input_states(channel_id)
                inputs[channel_name] = value
            self.send_status("DATA", "DATA", inputs)
        elif cmd == "SET_OUTPUT":
            channel_name = params.get("channel")
            value = params.get("value", 0)
            channel_id = None
            for ch_id, ch_name in self.output_channels:
                if ch_name == channel_name:
                    channel_id = ch_id
                    break
            if channel_id is None:
                raise Exception("Unknown output channel: {}".format(channel_name))
            self.stm32.req_set_output(channel_id, value)
        elif cmd == "SET_PWM":
            channel_name = params.get("channel")
            duty_cycle = params.get("duty_cycle", 0)
            channel_id = None
            for ch_id, ch_name in self.pwm_channels:
                if ch_name == channel_name:
                    channel_id = ch_id
                    break
            if channel_id is None:
                raise Exception("Unknown PWM channel: {}".format(channel_name))
            self.stm32.req_set_pwm(channel_id, duty_cycle)
        elif cmd == "RGB":
            r = params.get("r", 0)
            g = params.get("g", 0)
            b = params.get("b", 0)
            self.stm32.req_set_rgb(r, g, b)
        elif cmd == "BUZZER":
            freq = params.get("freq", 1000)
            volume = params.get("volume", 100)
            self.stm32.req_set_buzzer(freq, volume)
        else:

            raise Exception("Unknown cmd: {}".format(cmd))

    def load_data(self, filename="status.json"):
        try:
            with open(filename, "r") as f:
                self.status_data = ujson.load(f)
                if "pendingErrors" not in self.status_data or not isinstance(
                    self.status_data["pendingErrors"], list
                ):
                    self.status_data["pendingErrors"] = []
                self.device_id = str(self.status_data.get("loggerId", "2"))
                self.topic_status = f"devices/{self.device_id}/status"
        except Exception:
            self.status_data = {
                "version": "",
                "loggerId": "",
                "sensorId": "",
                "pendingErrors": [],
            }

    def save_data(self, filename="status.json"):
        tmp = filename + ".tmp"
        with open(tmp, "w") as f:
            ujson.dump(self.status_data, f)
        os.rename(tmp, filename)

    def error_dict(self, source, msg):
        return {"timestamp": time.time(), "source": source, "msg": str(msg)}

    def error_queue(self, status_data, payload, max_len=50):
        status_data["pendingErrors"].append(payload)
        if len(status_data["pendingErrors"]) > max_len:
            status_data["pendingErrors"] = status_data["pendingErrors"][-max_len:]
        try:
            self.save_data(status_data)
        except Exception as e:
            self.errors["SAVE_STATUS"] = e

    def error_management(self, status_data, source, msg):
        payload = self.error_dict(source, msg)
        if client is None:
            self.error_queue(status_data, payload)
            return
        try:
            self.send_status("ERROR", "ERROR", payload)
        except Exception as e:
            self.error_queue(status_data, payload)
            self.error_queue(status_data, self.error_dict("SEND_STATUS", e))

    def send_errors(self, status_data):
        global client
        if client is None:
            return
        if not status_data.get("pendingErrors"):
            return
        try:
            self.send_status(
                "ERRORS_FLUSH", "ERROR", {"items": status_data["pendingErrors"]}
            )
            status_data["pendingErrors"] = []
            self.save_data(status_data)
        except Exception as e:
            self.errors["SEND_ERRORS"] = e
