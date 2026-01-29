#include "mqtt_app.h"
#include "config.h"
#include <stdio.h>
#include <string.h>
#include "lwip/apps/mqtt.h"
#include "lwip/ip_addr.h"

static mqtt_client_t *g_client;
static mqtt_msg_cb_t  g_on_msg;
static char           g_rx_topic[64];
static volatile bool  g_pub_pending = false;

static void on_pub(void *arg, const char *topic, u32_t len) {
    strncpy(g_rx_topic, topic, sizeof(g_rx_topic) - 1);
}

static void on_data(void *arg, const u8_t *data, u16_t len, u8_t flags) {
    if (g_on_msg && (flags & MQTT_DATA_FLAG_LAST)) {
        g_on_msg(g_rx_topic, data, len);
    }
}

static void on_sub(void *arg, err_t err) { (void)arg; (void)err; }

static void on_conn(mqtt_client_t *c, void *arg, mqtt_connection_status_t st) {
    printf("MQTT status=%d\n", st);
    if (st == MQTT_CONNECT_ACCEPTED) {
        printf("MQTT connected!\n");
        mqtt_set_inpub_callback(c, on_pub, on_data, NULL);
        mqtt_subscribe(c, MQTT_TOPIC_SUB, 0, on_sub, NULL);
    }
}

void mqtt_init(mqtt_msg_cb_t on_message) {
    g_on_msg = on_message;

    ip_addr_t addr;
    if (!ipaddr_aton(MQTT_SERVER, &addr)) {
        printf("MQTT: bad IP\n");
        return;
    }

    printf("MQTT connecting to %s:%d...\n", MQTT_SERVER, MQTT_PORT);
    g_client = mqtt_client_new();
    struct mqtt_connect_client_info_t ci = {0};
    ci.client_id   = "pico2w";
    ci.client_user = MQTT_USER;
    ci.client_pass = MQTT_PASSWORD;
    ci.keep_alive  = MQTT_KEEPALIVE;

    mqtt_client_connect(g_client, &addr, MQTT_PORT, on_conn, NULL, &ci);
}

static void on_pub_complete(void *arg, err_t err) {
    (void)arg;
    g_pub_pending = false;
    if (err != ERR_OK) {
        printf("MQTT pub err=%d\n", err);
    }
}

bool mqtt_connected(void) {
    return g_client && mqtt_client_is_connected(g_client);
}

bool mqtt_ready(void) {
    return mqtt_connected() && !g_pub_pending;
}

void mqtt_send(const char *topic, const uint8_t *data, uint16_t len) {
    if (!mqtt_ready()) {
        printf("MQTT busy\n");
        return;
    }
    g_pub_pending = true;
    err_t err = mqtt_publish(g_client, topic, data, len, 0, 0, on_pub_complete, NULL);
    if (err != ERR_OK) {
        printf("MQTT publish fail=%d\n", err);
        g_pub_pending = false;
    }
}

void mqtt_poll(void) {
    /* lwIP background mode handles this automatically */
}