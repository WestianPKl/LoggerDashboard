#pragma once
#include <stdint.h>
#include <stdbool.h>

typedef void (*mqtt_msg_cb_t)(const char *topic, const uint8_t *data, uint16_t len);

void mqtt_init(mqtt_msg_cb_t on_message);
bool mqtt_connected(void);
bool mqtt_ready(void);
void mqtt_send(const char *topic, const uint8_t *data, uint16_t len);
void mqtt_poll(void);