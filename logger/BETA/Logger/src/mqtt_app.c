#include "mqtt_app.h"
#include "config.h"

#include <stdio.h>
#include <string.h>

#include "pico/cyw43_arch.h"
#include "lwip/apps/mqtt.h"
#include "lwip/ip_addr.h"

#ifndef MQTT_MAX_TOPIC
#define MQTT_MAX_TOPIC  63
#endif

#ifndef MQTT_MAX_PAYLOAD
#define MQTT_MAX_PAYLOAD 320
#endif

#ifndef MQTT_RX_COPY_BUF
#define MQTT_RX_COPY_BUF 256
#endif

static mqtt_client_t *g_client = NULL;
static mqtt_msg_cb_t  g_on_msg = NULL;

static char           g_rx_topic[MQTT_MAX_TOPIC + 1];

static volatile bool  g_pub_pending = false;
static uint8_t        g_pub_buf[MQTT_MAX_PAYLOAD];
static uint16_t       g_pub_len = 0;

static uint8_t        g_rx_buf[MQTT_RX_COPY_BUF];
static uint16_t       g_rx_len = 0;

static void on_pub_complete(void *arg, err_t err);

static void on_incoming_publish(void *arg, const char *topic, u32_t tot_len) {
    (void)arg;
    (void)tot_len;

    strncpy(g_rx_topic, topic, MQTT_MAX_TOPIC);
    g_rx_topic[MQTT_MAX_TOPIC] = '\0';

    g_rx_len = 0;
}

static void on_incoming_data(void *arg, const u8_t *data, u16_t len, u8_t flags) {
    (void)arg;

    if (len) {
        uint16_t space = (g_rx_len < MQTT_RX_COPY_BUF) ? (MQTT_RX_COPY_BUF - g_rx_len) : 0;
        uint16_t to_copy = (len < space) ? len : space;
        if (to_copy) {
            memcpy(&g_rx_buf[g_rx_len], data, to_copy);
            g_rx_len += to_copy;
        }
    }

    if ((flags & MQTT_DATA_FLAG_LAST) && g_on_msg) {
        g_on_msg(g_rx_topic, g_rx_buf, g_rx_len);
    }
}

static void on_subscribe_done(void *arg, err_t err) {
    (void)arg;
    if (err != ERR_OK) {
        printf("MQTT subscribe err=%d\n", err);
    } else {
        printf("MQTT subscribed\n");
    }
}

static void on_connection(mqtt_client_t *c, void *arg, mqtt_connection_status_t status) {
    (void)arg;
    printf("MQTT status=%d\n", status);

    if (status == MQTT_CONNECT_ACCEPTED) {
        printf("MQTT connected!\n");

        cyw43_arch_lwip_begin();
        mqtt_set_inpub_callback(c, on_incoming_publish, on_incoming_data, NULL);
        cyw43_arch_lwip_end();

        cyw43_arch_lwip_begin();
        err_t e = mqtt_subscribe(c, MQTT_TOPIC_SUB, 0, on_subscribe_done, NULL);
        cyw43_arch_lwip_end();

        if (e != ERR_OK) {
            printf("MQTT subscribe call failed err=%d\n", e);
        }
    } else {
        g_pub_pending = false;
    }
}

void mqtt_init(mqtt_msg_cb_t on_message) {
    g_on_msg = on_message;

    ip_addr_t addr;
    if (!ipaddr_aton(MQTT_SERVER, &addr)) {
        printf("MQTT: bad IP\n");
        return;
    }

    if (!g_client) {
        g_client = mqtt_client_new();
    }
    if (!g_client) {
        printf("MQTT: mqtt_client_new failed\n");
        return;
    }

    struct mqtt_connect_client_info_t ci;
    memset(&ci, 0, sizeof(ci));
    ci.client_id   = "pico2w";
    ci.client_user = MQTT_USER;
    ci.client_pass = MQTT_PASSWORD;
    ci.keep_alive  = MQTT_KEEPALIVE;

    printf("MQTT connecting to %s:%d...\n", MQTT_SERVER, MQTT_PORT);

    cyw43_arch_lwip_begin();
    err_t e = mqtt_client_connect(g_client, &addr, MQTT_PORT, on_connection, NULL, &ci);
    cyw43_arch_lwip_end();

    if (e != ERR_OK) {
        printf("MQTT connect call failed err=%d\n", e);
    }
}

bool mqtt_connected(void) {
    return g_client && mqtt_client_is_connected(g_client);
}

bool mqtt_ready(void) {
    return mqtt_connected() && !g_pub_pending;
}

static void on_pub_complete(void *arg, err_t err) {
    (void)arg;

    g_pub_pending = false;

    if (err != ERR_OK) {
        printf("MQTT pub complete err=%d\n", err);
    }
}

void mqtt_send(const char *topic, const uint8_t *data, uint16_t len) {
    if (!mqtt_connected()) {
        printf("MQTT not connected\n");
        return;
    }
    if (g_pub_pending) {
        printf("MQTT busy\n");
        return;
    }
    if (!topic || !data || len == 0) {
        printf("MQTT bad args\n");
        return;
    }
    if (len > MQTT_MAX_PAYLOAD) {
        printf("MQTT msg too long: %u (max %u)\n", (unsigned)len, (unsigned)MQTT_MAX_PAYLOAD);
        return;
    }

    memcpy(g_pub_buf, data, len);
    g_pub_len = len;

    g_pub_pending = true;

    cyw43_arch_lwip_begin();
    err_t e = mqtt_publish(g_client, topic, g_pub_buf, g_pub_len,
                          0 /* qos */, 0 /* retain */,
                          on_pub_complete, NULL);
    cyw43_arch_lwip_end();

    if (e == ERR_MEM) {
        printf("MQTT publish ERR_MEM (backpressure)\n");
        g_pub_pending = false;
        return;
    }

    if (e != ERR_OK) {
        printf("MQTT publish failed err=%d\n", e);
        g_pub_pending = false;
        return;
    }
}