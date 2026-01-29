#include "mqtt_app.h"
#include "config.h"
#include <stdio.h>
#include <string.h>
#include "lwip/apps/mqtt.h"
#include "lwip/ip_addr.h"

static mqtt_client_t *g_client;
static char g_pub_topic[32];

static void incoming_publish_cb(void *arg, const char *topic, u32_t tot_len) {
    printf("MQTT RX topic=%s len=%lu\n", topic, (unsigned long)tot_len);
}

static void incoming_data_cb(void *arg, const u8_t *data, u16_t len, u8_t flags) {
    printf("MQTT RX data len=%u last=%d\n", len, (flags & MQTT_DATA_FLAG_LAST) != 0);
}

static void sub_cb(void *arg, err_t result) {
    printf("MQTT SUB result=%d\n", result);
}

static void conn_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status) {
    printf("MQTT conn status=%d\n", status);
    if (status == MQTT_CONNECT_ACCEPTED) {
        mqtt_set_inpub_callback(client, incoming_publish_cb, incoming_data_cb, NULL);
        mqtt_subscribe(client, MQTT_TOPIC_SUB, 0, sub_cb, NULL);
    }
}

void mqtt_app_start(const settings_t *cfg) {
    strncpy(g_pub_topic, cfg->pub_topic, sizeof(g_pub_topic)-1);

    ip_addr_t addr;
    if (!ipaddr_aton(MQTT_SERVER, &addr)) {
        printf("Bad MQTT_SERVER ip\n");
        return;
    }

    g_client = mqtt_client_new();

    struct mqtt_connect_client_info_t ci = {0};
    ci.client_id = "pico2w-logger";
    ci.client_user = MQTT_USER;
    ci.client_pass = MQTT_PASSWORD;
    ci.keep_alive  = MQTT_KEEPALIVE;

    printf("MQTT connect %s:%d ...\n", MQTT_SERVER, MQTT_PORT);
    mqtt_client_connect(g_client, &addr, MQTT_PORT, conn_cb, NULL, &ci);
}

void mqtt_publish_telemetry(const char *topic, const datetime_t *dt, float t, float h) {
    if (!g_client || !mqtt_client_is_connected(g_client)) return;

    char payload[128];
    int n = snprintf(payload, sizeof(payload),
        "{\"ts\":\"%04u-%02u-%02uT%02u:%02u:%02uZ\",\"t\":%.2f,\"h\":%.2f}",
        dt->year, dt->month, dt->day, dt->hour, dt->min, dt->sec, t, h
    );

    err_t e = mqtt_publish(g_client, topic, payload, (u16_t)n, 0, 0, NULL, NULL);
    if (e != ERR_OK) printf("MQTT publish err=%d\n", e);
}