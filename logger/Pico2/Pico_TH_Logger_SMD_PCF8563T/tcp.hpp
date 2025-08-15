
/**
 * @file tcp.hpp
 * @brief TCP communication class for handling HTTP requests and responses using lwIP.
 *
 * This header defines the TCP class, which provides methods to send HTTP GET and POST requests,
 * log errors, and manage received tokens over a TCP connection. It utilizes the lwIP stack for
 * low-level TCP operations and is designed for embedded systems.
 *
 * Dependencies:
 *   - lwIP TCP/IP stack (lwip/err.h, lwip/tcp.h)
 *
 * Class TCP:
 *   - Manages a receive buffer and token storage.
 *   - Provides methods to send GET/POST requests and error logs.
 *   - Handles TCP connection callbacks.
 *
 * Methods:
 *   - send_token_get_request(): Sends a GET request to retrieve a token.
 *   - send_data_post_request(const char*, float, float, float): Sends a POST request with data.
 *   - send_error_log(const char*, const char* details = nullptr): Sends an error log message.
 *   - get_token(): Returns the last received token.
 */
#ifndef __TCP_HPP__
#define __TCP_HPP__

extern "C" {
    #include "lwip/err.h"
    #include "lwip/tcp.h"
}

class TCP{
    private:
        char recv_buffer[1024] = {0};
        size_t recv_len = 0;
        char received_token[256] = {0};
        static err_t tcp_connected_callback(void *, struct tcp_pcb *, err_t);

    public:
        bool send_token_get_request();
        bool send_data_post_request(const char*, float, float, float);
        bool send_error_log(const char*, const char* details = nullptr);
        const char* get_token();
};

#endif /* __TCP__ */