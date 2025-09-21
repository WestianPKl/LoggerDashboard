#include "pico/cyw43_arch.h"
#include <string>
#include <string.h>
#include <stdio.h>
#include "tcp.hpp"
#include "main.hpp"
#include "config.hpp"

extern "C" {
    #include "lwip/timeouts.h"
    #include "lwip/tcp.h"
}


const char* TCP::get_token() {
    return received_token;
}


struct tcp_context_base_t {
    volatile bool done = false;
    volatile bool failed = false;
};

struct token_ctx_t : public tcp_context_base_t {
    TCP* self = nullptr;
};

struct post_ctx_t : public tcp_context_base_t {
    char request[768];
    char response[1024];
    size_t response_len = 0;
};


bool TCP::send_token_get_request() {
    ip_addr_t server_ip;
    const auto &cfg = config_get();
    if (!ipaddr_aton(cfg.server_ip, &server_ip)) {
        return false;
    }

    recv_len = 0;
    memset(recv_buffer, 0, sizeof(recv_buffer));
    memset(received_token, 0, sizeof(received_token));

    token_ctx_t *ctx = (token_ctx_t*)calloc(1, sizeof(token_ctx_t));
    if (!ctx) return false;
    ctx->self = this;

    struct tcp_pcb* pcb = tcp_new();
    if (!pcb) {
        free(ctx);
        return false;
    }

    tcp_arg(pcb, ctx);

    tcp_err(pcb, [](void *arg, err_t) {
        auto *c = static_cast<token_ctx_t*>(arg);
        if (c) { c->failed = true; c->done = true; }
    });

    tcp_recv(pcb, [](void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err) -> err_t {
        auto *c = static_cast<token_ctx_t*>(arg);
        if (!c || !c->self) {
            if (p) pbuf_free(p);
            tcp_abort(pcb);
            return ERR_ABRT;
        }

        if (err != ERR_OK) {
            if (p) pbuf_free(p);
            c->failed = true; c->done = true;
            tcp_abort(pcb);
            return ERR_ABRT;
        }

        if (!p) {
            c->self->recv_buffer[c->self->recv_len] = '\0';
            char *json_start = strstr(c->self->recv_buffer, "\r\n\r\n");
            if (json_start) {
                json_start += 4;
                char token[512];
                if (sscanf(json_start, "{\"token\":\"%[^\"]\"}", token) == 1) {
                    strncpy(c->self->received_token, token, sizeof(c->self->received_token));
                    c->self->received_token[sizeof(c->self->received_token)-1] = '\0';
                }
            }
            c->done = true;
            return ERR_OK;
        }

        u16_t ack = 0;
        for (struct pbuf *q = p; q; q = q->next) {
            size_t copy = q->len;
            if (c->self->recv_len + copy >= sizeof(c->self->recv_buffer) - 1) {
                copy = (sizeof(c->self->recv_buffer) - 1) - c->self->recv_len;
            }
            if (copy > 0) {
                memcpy(c->self->recv_buffer + c->self->recv_len, q->payload, copy);
                c->self->recv_len += copy;
            }
            ack += q->len;
        }
        if (ack) tcp_recved(pcb, ack);
        pbuf_free(p);

        return ERR_OK;
    });

    tcp_poll(pcb, [](void *arg, struct tcp_pcb *pcb) -> err_t {
        static uint8_t ticks = 0;
        auto *c = static_cast<token_ctx_t*>(arg);
        if (++ticks > 20) {
            if (c) { c->failed = true; c->done = true; }
            tcp_abort(pcb);
            return ERR_ABRT;
        }
        return ERR_OK;
    }, 2);

    err_t result = tcp_connect(pcb, &server_ip, cfg.server_port,
        [](void *arg, struct tcp_pcb *pcb, err_t err) -> err_t {
            if (err != ERR_OK) return err;

            const auto &cfg2 = config_get();
            char host_line[64];
            snprintf(host_line, sizeof(host_line), "%s", cfg2.server_ip);

            std::string req = std::string("GET " TOKEN_PATH " HTTP/1.1\r\n")
                            + "Host: " + host_line + "\r\n"
                            + "Connection: close\r\n\r\n";

            err_t w = tcp_write(pcb, req.c_str(), req.size(), TCP_WRITE_FLAG_COPY);
            if (w != ERR_OK) return w;
            return tcp_output(pcb); 
        });

    if (result != ERR_OK) {
        tcp_abort(pcb);
        free(ctx);
        return false;
    }

    absolute_time_t deadline = make_timeout_time_ms(8000);
    while (!time_reached(deadline) && !ctx->done) {
        cyw43_arch_poll();
        sys_check_timeouts();
        sleep_ms(5);
    }

    if (!ctx->failed) {
        if (tcp_close(pcb) != ERR_OK) tcp_abort(pcb);
    } else {
        tcp_abort(pcb);
    }

    bool ok = strlen(received_token) > 0;
    free(ctx);
    return ok;
}

err_t TCP::tcp_connected_callback(void *arg, struct tcp_pcb *pcb, err_t err) {
    post_ctx_t *ctx = static_cast<post_ctx_t*>(arg);
    if (err != ERR_OK) return err;

    err_t w = tcp_write(pcb, ctx->request, strlen(ctx->request), TCP_WRITE_FLAG_COPY);
    if (w != ERR_OK) return w;
    return tcp_output(pcb);
}


bool TCP::send_data_post_request(const char* timestamp, float temp, float hum, float pressure) {
    const auto &cfg = config_get();

    char json_body[512];
    snprintf(json_body, sizeof(json_body),
        "["
        "{\"time\":\"%s\",\"value\":%.2f,\"definition\":\"temperature\",\"equLoggerId\":%u,\"equSensorId\":%u},"
        "{\"time\":\"%s\",\"value\":%.2f,\"definition\":\"humidity\",\"equLoggerId\":%u,\"equSensorId\":%u},"
        "{\"time\":\"%s\",\"value\":%.2f,\"definition\":\"atmPressure\",\"equLoggerId\":%u,\"equSensorId\":%u}"
        "]",
        timestamp ? timestamp : "", temp, cfg.logger_id, cfg.sensor_id,
        timestamp ? timestamp : "", hum, cfg.logger_id, cfg.sensor_id,
        timestamp ? timestamp : "", pressure, cfg.logger_id, cfg.sensor_id
    );

    post_ctx_t* ctx = (post_ctx_t*)calloc(1, sizeof(post_ctx_t));
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
        DATA_PATH, cfg.server_ip, received_token, (int)strlen(json_body), json_body
    );

    ip_addr_t server_ip;
    if (!ipaddr_aton(cfg.server_ip, &server_ip)) {
        free(ctx);
        return false;
    }

    struct tcp_pcb* pcb = tcp_new();
    if (!pcb) {
        free(ctx);
        return false;
    }

    tcp_arg(pcb, ctx);

    tcp_err(pcb, [](void *arg, err_t) {
        auto *c = static_cast<post_ctx_t*>(arg);
        if (c) { c->failed = true; c->done = true; }
    });

    tcp_recv(pcb, [](void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err) -> err_t {
        auto *c = static_cast<post_ctx_t*>(arg);
        if (!c) {
            if (p) pbuf_free(p);
            tcp_abort(pcb);
            return ERR_ABRT;
        }

        if (err != ERR_OK) {
            if (p) pbuf_free(p);
            c->failed = true; c->done = true;
            tcp_abort(pcb);
            return ERR_ABRT;
        }

        if (!p) {
            c->response[c->response_len] = '\0';
            c->done = true;
            return ERR_OK;
        }

        u16_t ack = 0;
        for (struct pbuf* q = p; q; q = q->next) {
            size_t copy = q->len;
            if (c->response_len + copy >= sizeof(c->response) - 1) {
                copy = (sizeof(c->response) - 1) - c->response_len;
            }
            if (copy > 0) {
                memcpy(c->response + c->response_len, q->payload, copy);
                c->response_len += copy;
            }
            ack += q->len;
        }
        if (ack) tcp_recved(pcb, ack);
        pbuf_free(p);

        return ERR_OK;
    });

    tcp_poll(pcb, [](void *arg, struct tcp_pcb *pcb) -> err_t {
        static uint8_t ticks = 0;
        auto *c = static_cast<post_ctx_t*>(arg);
        if (++ticks > 20) {
            if (c) { c->failed = true; c->done = true; }
            tcp_abort(pcb);
            return ERR_ABRT;
        }
        return ERR_OK;
    }, 2);

    err_t result = tcp_connect(pcb, &server_ip, cfg.server_port, tcp_connected_callback);
    if (result != ERR_OK) {
        tcp_abort(pcb);
        free(ctx);
        return false;
    }

    absolute_time_t deadline = make_timeout_time_ms(8000);
    while (!time_reached(deadline) && !ctx->done) {
        cyw43_arch_poll();
        sys_check_timeouts();
        sleep_ms(5);
    }

    if (!ctx->failed) {
        if (tcp_close(pcb) != ERR_OK) tcp_abort(pcb);
    } else {
        tcp_abort(pcb);
    }

    bool ok = !ctx->failed;
    free(ctx);
    return ok;
}

bool TCP::send_error_log(const char* message, const char* details) {
    const auto &cfg = config_get();

    char json_body[512];
    snprintf(json_body, sizeof(json_body),
        "{"
        "\"equipmentId\":%u,"
        "\"message\":\"%s\","
        "\"details\":\"%s\","
        "\"severity\":\"error\","
        "\"type\":\"Equipment\""
        "}",
        cfg.logger_id,
        message ? message : "",
        details ? details : ""
    );

    post_ctx_t* ctx = (post_ctx_t*)calloc(1, sizeof(post_ctx_t));
    if (!ctx) return false;

    snprintf(ctx->request, sizeof(ctx->request),
        "POST %s HTTP/1.1\r\n"
        "Host: %s\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: %d\r\n"
        "Connection: close\r\n"
        "\r\n"
        "%s",
        ERROR_PATH, cfg.server_ip, (int)strlen(json_body), json_body
    );

    ip_addr_t server_ip;
    if (!ipaddr_aton(cfg.server_ip, &server_ip)) {
        free(ctx);
        return false;
    }

    struct tcp_pcb* pcb = tcp_new();
    if (!pcb) {
        free(ctx);
        return false;
    }

    tcp_arg(pcb, ctx);

    tcp_err(pcb, [](void *arg, err_t) {
        auto *c = static_cast<post_ctx_t*>(arg);
        if (c) { c->failed = true; c->done = true; }
    });

    tcp_recv(pcb, [](void* arg, struct tcp_pcb* pcb, struct pbuf* p, err_t err) -> err_t {
        auto *c = static_cast<post_ctx_t*>(arg);
        if (!c) {
            if (p) pbuf_free(p);
            tcp_abort(pcb);
            return ERR_ABRT;
        }

        if (err != ERR_OK) {
            if (p) pbuf_free(p);
            c->failed = true; c->done = true;
            tcp_abort(pcb);
            return ERR_ABRT;
        }

        if (!p) {
            c->response[c->response_len] = '\0';
            c->done = true;
            return ERR_OK;
        }

        u16_t ack = 0;
        for (struct pbuf* q = p; q; q = q->next) {
            size_t copy = q->len;
            if (c->response_len + copy >= sizeof(c->response) - 1) {
                copy = (sizeof(c->response) - 1) - c->response_len;
            }
            if (copy > 0) {
                memcpy(c->response + c->response_len, q->payload, copy);
                c->response_len += copy;
            }
            ack += q->len;
        }
        if (ack) tcp_recved(pcb, ack);
        pbuf_free(p);

        return ERR_OK;
    });

    tcp_poll(pcb, [](void *arg, struct tcp_pcb *pcb) -> err_t {
        static uint8_t ticks = 0;
        auto *c = static_cast<post_ctx_t*>(arg);
        if (++ticks > 20) {
            if (c) { c->failed = true; c->done = true; }
            tcp_abort(pcb);
            return ERR_ABRT;
        }
        return ERR_OK;
    }, 2);

    err_t result = tcp_connect(pcb, &server_ip, cfg.server_port,
        [](void *arg, struct tcp_pcb *pcb, err_t err) -> err_t {
            auto *ctx = static_cast<post_ctx_t*>(arg);
            if (err != ERR_OK) return err;
            err_t w = tcp_write(pcb, ctx->request, strlen(ctx->request), TCP_WRITE_FLAG_COPY);
            if (w != ERR_OK) return w;
            return tcp_output(pcb);
        });

    if (result != ERR_OK) {
        tcp_abort(pcb);
        free(ctx);
        return false;
    }

    absolute_time_t deadline = make_timeout_time_ms(8000);
    while (!time_reached(deadline) && !ctx->done) {
        cyw43_arch_poll();
        sys_check_timeouts();
        sleep_ms(5);
    }

    if (!ctx->failed) {
        if (tcp_close(pcb) != ERR_OK) tcp_abort(pcb);
    } else {
        tcp_abort(pcb);
    }

    bool ok = !ctx->failed;
    free(ctx);
    return ok;
}
