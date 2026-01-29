#pragma once

// Wi-Fi
#define WIFI_SSID       "TP-Link_0A7B"
#define WIFI_PASSWORD   "12345678"

// MQTT
#define MQTT_SERVER     "192.168.18.6"
#define MQTT_PORT       1883
#define MQTT_USER       "pico_user"
#define MQTT_PASSWORD   "HASLO"
#define MQTT_KEEPALIVE  7200

#define MQTT_TOPIC_SUB  "devices/2/cmd"
#define MQTT_TOPIC_PUB  "devices/2/status"

// NTP/SNTP
#define NTP_SERVER_IP "192.168.18.6"


// UART
#define UART_PORT       uart1
#define UART_TX_PIN     4
#define UART_RX_PIN     5
#define UART_BAUD       115200
