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

// I2C
#define I2C_PORT        i2c1
#define I2C_SDA_PIN     6
#define I2C_SCL_PIN     7
#define I2C_BAUD        400000

#define RTC_ADDR        0x51
#define EEPROM_ADDR     0x50

#define RTC_ON          15
#define EEPROM_ON       11
