
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