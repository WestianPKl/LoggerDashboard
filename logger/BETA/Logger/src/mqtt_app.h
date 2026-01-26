#pragma once
#include <stdint.h>
#include <stdbool.h>
#include "settings.h"
#include "rtc_pcf8563.h"

void mqtt_app_start(const settings_t *cfg);
void mqtt_publish_telemetry(const char *topic, const datetime_t *dt, float t, float h);