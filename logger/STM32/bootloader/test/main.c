#include <stdint.h>
#include <stdbool.h>
#include <string.h>
#include "stm32l4xx.h"
#include "uart.h"
#include "systick.h"
#include "version.h"

#define APP_ADDR        0x08008000u
#define INFO_ADDR       0x080FF800u
#define META_ADDR       0x080F0000u

#define DEV_ADDR 0xB2
#define RESP_LEN 16
#define FRAME_LEN 16
#define PAYLOAD_MAX 11

#define STATUS_OK   0x40
#define STATUS_ERR  0x7F

#define OTA_FLAG_PENDING   (1u << 0)
#define OTA_FLAG_FORCE_BL  (1u << 1)

#define RX_BUF_SZ 256
static volatile uint8_t rx_buf[RX_BUF_SZ];
static volatile uint16_t rx_w = 0, rx_r = 0;

static inline void rx_push(uint8_t b)
{
    uint16_t next = (uint16_t)((rx_w + 1u) % RX_BUF_SZ);
    if (next != rx_r) {
        rx_buf[rx_w] = b;
        rx_w = next;
    }
}

static bool rx_pop(uint8_t *out)
{
    if (rx_r == rx_w) return false;
    *out = rx_buf[rx_r];
    rx_r = (uint16_t)((rx_r + 1u) % RX_BUF_SZ);
    return true;
}

typedef void (*func_ptr)(void);

#define OTA_MAGIC 0x4F544131u
typedef struct __attribute__((packed)) {
    uint32_t magic;
    uint32_t flags;
    uint32_t app_crc32;
    uint32_t app_size;
} ota_meta_t;

static inline const ota_meta_t* ota_meta(void) {
    return (const ota_meta_t*)META_ADDR;
}

static void bootloader_init(void){
    RCC->AHB2ENR |= RCC_AHB2ENR_GPIOAEN;
    (void)RCC->AHB2ENR;

    GPIOA->MODER &= ~(3U << (5U * 2U));
    GPIOA->MODER |=  (1U << (5U * 2U));

    GPIOA->OTYPER &= ~(1U << 5U);
    GPIOA->PUPDR &= ~(3U << (5U * 2U));
    systick_delay_ms(100);

    uart2_rxtx_init();
}

static bool app_vectors_look_valid(void)
{
    uint32_t msp   = *(uint32_t*)APP_ADDR;
    uint32_t reset = *(uint32_t*)(APP_ADDR + 4u);

    if ((msp & 0x2FFE0000u) != 0x20000000u) return false;

    if ((reset & 0xFF000000u) != 0x08000000u) return false;

    return true;
}

static bool force_bootloader_button(void)
{
    return false;
}

static bool should_jump_to_app(void)
{
    if (!app_vectors_look_valid())
        return false;

    if (force_bootloader_button())
        return false;

    const ota_meta_t *m = ota_meta();
    if (m->magic == OTA_MAGIC)
    {
        const uint32_t FORCE_BL     = (1u << 1);
        const uint32_t PENDING_UPD  = (1u << 0);

        if (m->flags & FORCE_BL)    return false;
        if (m->flags & PENDING_UPD) return false;
    }

    return true;
}

static void jump_to_app(void)
{
    uint32_t app_msp   = *(uint32_t*)APP_ADDR;
    uint32_t app_reset = *(uint32_t*)(APP_ADDR + 4u);
    func_ptr app_entry = (func_ptr)(app_reset | 1u);

    __disable_irq();

    NVIC_DisableIRQ(USART2_IRQn);
    USART2->CR1 &= ~USART_CR1_RXNEIE;
    USART2->CR1 &= ~USART_CR1_UE;

    SysTick->CTRL = 0;
    SysTick->LOAD = 0;
    SysTick->VAL  = 0;

    for (uint32_t i = 0; i < 8; i++) {
        NVIC->ICER[i] = 0xFFFFFFFFu;
        NVIC->ICPR[i] = 0xFFFFFFFFu;
    }

    SCB->VTOR = APP_ADDR;
    __DSB(); __ISB();

    __set_MSP(app_msp);
    __DSB(); __ISB();

    app_entry();
}

static bool uart_read_frame(uint8_t *frame)
{
    static uint8_t tmp[16];
    static uint8_t idx = 0;
    uint8_t b;
    while (rx_pop(&b))
    {
        if (idx == 0)
        {
            if (b != 0xB2) continue;
            tmp[idx++] = b;
        }
        else
        {
            tmp[idx++] = b;
            if (idx == 16)
            {
                uint8_t calc = crc8_atm(tmp, 15);
                uint8_t rxcrc = tmp[15];
                idx = 0;

                if (calc != rxcrc) return false;

                memcpy(frame, tmp, 16);
                return true;
            }
        }
    }
    return false;
}

static void handle_response(uint8_t status, uint8_t cmd, uint8_t param,
                            const uint8_t *payload, uint32_t payload_len)
{
    static uint8_t resp[16];
    memset(resp, 0, sizeof(resp));

    resp[0] = DEV_ADDR;
    resp[1] = status;
    resp[2] = cmd;
    resp[3] = param;

    if (payload && payload_len) {
        if (payload_len > PAYLOAD_MAX) payload_len = PAYLOAD_MAX;
        memcpy(&resp[4], payload, payload_len);
    }

    resp[15] = crc8_atm(resp, 15);
    uart2_send(resp, 16);
}

static void ota_start(const uint8_t *req)
{
    ota_meta_t *m = (ota_meta_t*)META_ADDR;
    m->magic = OTA_MAGIC;
    m->flags = OTA_FLAG_PENDING;
    m->app_crc32 = 0;
    m->app_size = 0;
    __DSB(); __ISB();
    handle_response(STATUS_OK, 0x90, 0, NULL, 0);
}

static void ota_data(const uint8_t *req)
{
    uint32_t offset = ((uint32_t)req[4] << 0u) |
                      ((uint32_t)req[5] << 8u) |
                      ((uint32_t)req[6] << 16u) |
                      ((uint32_t)req[7] << 24u);
    uint8_t  len    = req[8];
    const uint8_t *data = &req[9];

    if (len > PAYLOAD_MAX) {
        handle_response(STATUS_ERR, 0x95, 0, NULL, 0);
        return;
    }

    uint32_t write_addr = APP_ADDR + offset;
    if (write_addr < APP_ADDR ||
        write_addr + len > META_ADDR)
    {
        handle_response(STATUS_ERR, 0x95, 0, NULL, 0);
        return;
    }

    FLASH->KEYR = 0x45670123u;
    FLASH->KEYR = 0xCDEF89ABu;

    for (uint32_t i = 0; i < len; i += 8)
    {
        while (!(FLASH->SR & FLASH_SR_BSY) && (FLASH->SR & FLASH_SR_EOP)) {
            FLASH->SR |= FLASH_SR_EOP;
        }

        FLASH->CR |= FLASH_CR_PG;

        uint64_t half_word = 0xFFFFFFFFFFFFFFFFu;
        memcpy(&half_word, &data[i], (len - i) >= 8 ? 8 : (len - i));

        *(volatile uint64_t*)(write_addr + i) = half_word;

        while (FLASH->SR & FLASH_SR_BSY);

        FLASH->CR &= ~FLASH_CR_PG;
    }

    FLASH->CR |= FLASH_CR_LOCK;

    handle_response(STATUS_OK, 0x95, 0, NULL, 0);
}

static void ota_finish(void)
{
    ota_meta_t *m = (ota_meta_t*)META_ADDR;
    m->flags &= ~OTA_FLAG_PENDING;
    __DSB(); __ISB();
    handle_response(STATUS_OK, 0x99, 0, NULL, 0);
}

static void bootloader_loop(void)
{
    while (1)
    {

        uint8_t req[16];
        if (!uart_read_frame(req)) continue;

        uint8_t addr       = req[0];
        uint8_t cmd        = req[1];
        uint8_t param_addr = req[3];
        uint8_t param      = req[4];

        (void)addr; (void)param_addr; (void)param;
        switch (cmd)
        {
            case 0x10: {
                uint8_t data[3] = {
                    BL_VERSION_MAJOR,
                    BL_VERSION_MINOR,
                    BL_VERSION_PATCH
                };
                handle_response(STATUS_OK, cmd, 0, data, 3);
                break;
            }

            case 0x11: {
                handle_response(STATUS_OK, cmd, 0,
                                (uint8_t*)BL_BUILD_DATE,
                                strlen(BL_BUILD_DATE));
                break;
            }

            case 0x20: {
                const device_info_t *info = (const device_info_t*)INFO_ADDR;
                handle_response(STATUS_OK, cmd, 0,
                                (const uint8_t*)info,
                                sizeof(device_info_t));
                break;
            }

            case 0x90: {
                ota_start(req);
                break;
            }

            case 0x95: {
                ota_data(req);
                break;
            }

            case 0x99: {
                ota_finish();
                break;
            }

            default:
                handle_response(STATUS_ERR, cmd, 0, NULL, 0);
                break;
        }
    }
}

int main(void)
{
    bootloader_init();

    if (should_jump_to_app())
        jump_to_app();

    bootloader_loop();
}

void USART2_IRQHandler(void)
{
    if (USART2->ISR & USART_ISR_RXNE)
    {
        uint8_t b = (uint8_t)(USART2->RDR & 0xFF);
        rx_push(b);
    }
}