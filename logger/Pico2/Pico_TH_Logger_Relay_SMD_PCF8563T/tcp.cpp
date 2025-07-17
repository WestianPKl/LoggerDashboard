#include "pico/cyw43_arch.h"
#include <string.h>
#include <stdio.h>
#include "tcp.hpp"
#include "main.hpp"

const char* TCP::get_token() {
    return received_token;
}

bool TCP::send_token_get_request() {
    ip_addr_t server_ip;
    if (!ipaddr_aton(SERVER_IP, &server_ip)) {
        printf("❌ Invalid IP\n");
        return false;
    }
    struct tcp_pcb* pcb = tcp_new();
    if (!pcb) return false;

    recv_len = 0;
    memset(recv_buffer, 0, sizeof(recv_buffer));

    tcp_arg(pcb, this);

    tcp_recv(pcb, [](void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err) -> err_t {
        TCP* self = static_cast<TCP*>(arg);
        if (!p) {
            self->recv_buffer[self->recv_len] = '\0';
            printf("📥 Received:\n%s\n", self->recv_buffer);

            printf("🔍 Bufor (%zu bajtów):\n%s\n", self->recv_len, self->recv_buffer);  

            char *json_start = strstr(self->recv_buffer, "\r\n\r\n");
            if (json_start) {
                json_start += 4;
                char *token_pos = strstr(json_start, "\"token\":\"");
                if (token_pos) {
                    token_pos += strlen("\"token\":\"");
                    char *end_quote = strchr(token_pos, '"');
                    if (end_quote) {
                        size_t len = end_quote - token_pos;
                        if (len < sizeof(self->received_token)) {
                            strncpy(self->received_token, token_pos, len);
                            self->received_token[len] = '\0';
                            printf("🔐 Parsed token: %s\n", self->received_token);
                        }
                    }
                }
            }
            char token[512];
            if (sscanf(json_start, "{\"token\":\"%[^\"]\"}", token) == 1) {
                strncpy(self->received_token, token, sizeof(self->received_token));
                self->received_token[sizeof(self->received_token)-1] = '\0';
                printf("🔐 Parsed token: %s\n", self->received_token);
            }
            if (strlen(self->received_token) > 10) {
                printf("🔐 TOKEN OK\n");
            } else {
                printf("⚠️ Token za krótki lub niepoprawny\n");
            }
            tcp_close(pcb);
            return ERR_OK;
        }

        while (p && self->recv_len + p->len < sizeof(self->recv_buffer) - 1) {
            memcpy(self->recv_buffer + self->recv_len, p->payload, p->len);
            self->recv_len += p->len;
            struct pbuf *next = p->next;
            pbuf_free(p);
            p = next;
        }

        return ERR_OK;
    });

    err_t result = tcp_connect(pcb, &server_ip, SERVER_PORT, [](void *arg, struct tcp_pcb *pcb, err_t err) -> err_t {
        if (err != ERR_OK) {
            printf("❌ Connect failed: %d\n", err);
            return err;
        }

        const char* http_request =
            "GET " TOKEN_PATH " HTTP/1.1\r\n"
            "Host: " SERVER_IP "\r\n"
            "Connection: close\r\n"
            "\r\n";

        err_t write_err = tcp_write(pcb, http_request, strlen(http_request), TCP_WRITE_FLAG_COPY);
        if (write_err == ERR_OK) {
            printf("✅ GET sent to %s:%d%s\n", SERVER_IP, SERVER_PORT, TOKEN_PATH);
        } else {
            printf("❌ Write failed: %d\n", write_err);
        }

        return write_err;
    });

    if (result != ERR_OK) {
        printf("❌ TCP connect failed: %d\n", result);
        tcp_close(pcb);
        return false;
    }

    for (int i = 0; i < 300; ++i) {
        cyw43_arch_poll();
        sleep_ms(10);
    }

    return strlen(received_token) > 0;
}


struct tcp_context_t {
    char request[768];
};

err_t TCP::tcp_connected_callback(void *arg, struct tcp_pcb *pcb, err_t err) {
    tcp_context_t *ctx = static_cast<tcp_context_t*>(arg);
    if (err != ERR_OK) {
        printf("❌ Connect failed: %d\n", err);
        return err;
    }

    err_t write_err = tcp_write(pcb, ctx->request, strlen(ctx->request), TCP_WRITE_FLAG_COPY);
    if (write_err == ERR_OK) {
        printf("✅ POST sent:\n%s\n", ctx->request);
    } else {
        printf("❌ Write failed: %d\n", write_err);
    }

    return write_err;
}

bool TCP::send_data_post_request(const char* timestamp, float temp, float hum, float pressure) {
    char json_body[512];

    snprintf(json_body, sizeof(json_body),
        "[" 
        "{\"time\":\"%s\",\"value\":%.2f,\"definition\":\"temperature\",\"equLoggerId\":%d,\"equSensorId\":%d},"
        "{\"time\":\"%s\",\"value\":%.2f,\"definition\":\"humidity\",\"equLoggerId\":%d,\"equSensorId\":%d},"
        "{\"time\":\"%s\",\"value\":%.2f,\"definition\":\"atmPressure\",\"equLoggerId\":%d,\"equSensorId\":%d}"
        "]",
        timestamp, temp, LOGGER_ID, SENSOR_ID,
        timestamp, hum, LOGGER_ID, SENSOR_ID,
        timestamp, pressure, LOGGER_ID, SENSOR_ID
    );

    tcp_context_t* ctx = (tcp_context_t*)calloc(1, sizeof(tcp_context_t));
    if (!ctx) return false;

    snprintf(ctx->request, sizeof(ctx->request),
        "POST %s HTTP/1.1\r\n"
        "Host: %s\r\n"
        "Authorization: Bearer %s\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: %d\r\n"
        "Connection: close\r\n"
        "\r\n"
        "%s",
        DATA_PATH, SERVER_IP, received_token, (int)strlen(json_body), json_body
    );

    ip_addr_t server_ip;
    if (!ipaddr_aton(SERVER_IP, &server_ip)) {
        printf("❌ Invalid server IP\n");
        free(ctx);
        return false;
    }

    struct tcp_pcb* pcb = tcp_new();
    if (!pcb) {
        printf("❌ Failed to create TCP PCB\n");
        free(ctx);
        return false;
    }

    static char response_buffer[1024] = {0};
    static size_t response_len = 0;

    tcp_arg(pcb, ctx);

    tcp_recv(pcb, [](void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err) -> err_t {
        if (!p) {
            response_buffer[response_len] = '\0';
            printf("📥 POST response:\n%s\n", response_buffer);

            if (strncmp(response_buffer, "HTTP/1.1 200", 12) == 0) {
                printf("✅ POST OK\n");
            } else {
                printf("⚠️ POST error or unexpected response\n");
            }

            tcp_close(pcb);
            return ERR_OK;
        }

        while (p && response_len + p->len < sizeof(response_buffer) - 1) {
            memcpy(response_buffer + response_len, p->payload, p->len);
            response_len += p->len;
            struct pbuf *next = p->next;
            pbuf_free(p);
            p = next;
        }

        return ERR_OK;
    });

    err_t result = tcp_connect(pcb, &server_ip, SERVER_PORT, tcp_connected_callback);
    if (result != ERR_OK) {
        printf("❌ TCP connect failed: %d\n", result);
        tcp_close(pcb);
        free(ctx);
        return false;
    }

    for (int i = 0; i < 200; ++i) {
        cyw43_arch_poll();
        sleep_ms(10);
    }

    tcp_close(pcb);
    free(ctx);
    return true;
}

bool TCP::send_error_log(const char* message, const char* details) {
    char json_body[512];

    snprintf(json_body, sizeof(json_body),
        "{"
        "\"equipmentId\":%d,"
        "\"message\":\"%s\","
        "\"details\":\"%s\","
        "\"severity\":\"error\","
        "\"type\":\"Equipment\""
        "}",
        LOGGER_ID,
        message,
        details ? details : ""
    );

    tcp_context_t* ctx = (tcp_context_t*)calloc(1, sizeof(tcp_context_t));
    if (!ctx) return false;

    snprintf(ctx->request, sizeof(ctx->request),
        "POST %s HTTP/1.1\r\n"
        "Host: %s\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: %d\r\n"
        "Connection: close\r\n"
        "\r\n"
        "%s",
        ERROR_PATH, SERVER_IP, (int)strlen(json_body), json_body
    );

    ip_addr_t server_ip;
    if (!ipaddr_aton(SERVER_IP, &server_ip)) {
        printf("❌ Invalid server IP\n");
        free(ctx);
        return false;
    }

    struct tcp_pcb* pcb = tcp_new();
    if (!pcb) {
        printf("❌ Failed to create TCP PCB\n");
        free(ctx);
        return false;
    }

    static char response_buffer[512] = {0};
    static size_t response_len = 0;

    tcp_arg(pcb, ctx);

    tcp_recv(pcb, [](void* arg, struct tcp_pcb* pcb, struct pbuf* p, err_t err) -> err_t {
        if (!p) {
            response_buffer[response_len] = '\0';
            printf("📥 Error log response:\n%s\n", response_buffer);
            tcp_close(pcb);
            return ERR_OK;
        }

        while (p && response_len + p->len < sizeof(response_buffer) - 1) {
            memcpy(response_buffer + response_len, p->payload, p->len);
            response_len += p->len;
            struct pbuf* next = p->next;
            pbuf_free(p);
            p = next;
        }

        return ERR_OK;
    });

    err_t result = tcp_connect(pcb, &server_ip, SERVER_PORT, tcp_connected_callback);
    if (result != ERR_OK) {
        printf("❌ TCP connect failed: %d\n", result);
        tcp_close(pcb);
        free(ctx);
        return false;
    }

    for (int i = 0; i < 200; ++i) {
        cyw43_arch_poll();
        sleep_ms(10);
    }

    tcp_close(pcb);
    free(ctx);
    return true;
}