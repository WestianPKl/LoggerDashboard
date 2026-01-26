import time
import ujson
import os
import machine
import ubinascii
from wireless import WiFi
from mqtt_simple import MQTTClient
from uart import UARTDevice

SSID = "TP-Link_0A7B"
PASSWORD = "12345678"

MQTT_TOPIC_PING = "devices/pico/cmd"
MQTT_TOPIC_STATUS = "devices/pico/status"

MQTT_SERVER = "192.168.18.6"
MQTT_PORT = 1883
MQTT_USER = "pico_user"
MQTT_PASSWORD = "HASLO"
MQTT_KEEPALIVE = 7200

DEVICE_ID = "2"

TOPIC_CMD = f"devices/{DEVICE_ID}/cmd"
TOPIC_STATUS = f"devices/{DEVICE_ID}/status"

REQUIRED_KEYS = {
    "adc", "version", "T", "RH",
    "YEAR", "MONTH", "DAY",
    "HOUR", "MIN", "SEC"
}

client = None

def wifi_initialization(wifi):
    try:
        print("Connecting WiFi...")
        ip_info = wifi.connect()
        print("WiFi OK:", ip_info[0])
    except Exception as e:
        print("WiFi error:", e)
    
def mqtt_initialization():
    try:
        client = MQTTClient(
            client_id=DEVICE_ID.encode(),
            server=MQTT_SERVER,
            port=MQTT_PORT,
            user=MQTT_USER,
            password=MQTT_PASSWORD,
            keepalive=MQTT_KEEPALIVE,
        )

        client.set_callback(message_mqtt)
        client.connect()
        client.subscribe(TOPIC_CMD)
        print("Subscribed:", TOPIC_CMD)

        return client
    except Exception as e:
        print('Error connecting to MQTT:', e)
        raise
    
def publish_mqtt(client, topic, value):
    client.publish(topic, value)
    print("MQTT TX:", topic, value)
    
def send_status(result, info=None, data=None):
    payload = {
        "result": result,
        "info": info,
        "type": "STATUS",
        "timestamp": time.time(),
    }
    if data:
        for key in data:
            payload[key] = data[key]
    print(payload)
    client.publish(TOPIC_STATUS, ujson.dumps(payload))
    
def message_mqtt(topic, msg):
    print("RX:", topic, msg)
    try:
        data = ujson.loads(msg)
    except Exception as e:
        print("Bad JSON:", e)
        return
    cmd = data.get("cmd")
    if cmd == "ota_update":
        ota_update()
    elif cmd == "PING":
        send_status("ALIVE")
    else:
        print("Unknown cmd:", cmd)
        

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

def save_data(filename, data):
    tmp = filename + ".tmp"

    with open(tmp, "w") as f:
        ujson.dump(data, f)

    os.rename(tmp, filename)
    
def main():
    global client
    wifi = WiFi(SSID, PASSWORD)
    wifi.connect()
    
    uart_device = UARTDevice(uart_id=1, tx_pin=4, rx_pin=5, baudrate=9600)

    client = mqtt_initialization()
    
    with open("status.json", "r") as f:
        data = ujson.load(f)
    
    pico_sw = data['version']
    
    send_status("START")
    
    uart_buffer = b"" 
    
    while True:
        client.check_msg()
        time.sleep(0.05)
        
        uart_data = []
        
        try:
            #uart_device.write(b"-")
            time.sleep(0.2)
            buf = uart_buffer
            while uart_device.any():
                data = uart_device.read(64)
                if data:
                    buf += data
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
            print("UART error:", e)
        d = parse_kv_list(uart_data)
        if REQUIRED_KEYS.issubset(d.keys()):
            try:
                timestamp = "{:04d}-{:02d}-{:02d} {:02d}:{:02d}:{:02d}".format(d["YEAR"], d["MONTH"], d["DAY"], d["HOUR"], d["MIN"], d["SEC"])
            except:
                timestamp = ""
            data_send = {"t": d["T"], "rh": d["RH"], "date": timestamp, "chip_sw": d["version"], "pico_sw": pico_sw}
            print(data_send)
        #send_status("DATA", None, data_send)

            
                    
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Program critical error:", e)