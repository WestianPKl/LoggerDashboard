#include "uart_dma.h"

#define PA2 2U
#define PA3 3U
#define UART_BAUDRATE 115200U

static uint32_t get_pclk1_hz(void)
{
    uint32_t hclk = SystemCoreClock;
    uint32_t ppre1 = (RCC->CFGR >> 8) & 0x7;
    uint32_t div = 1;
    if (ppre1 >= 4) {
        div = 1U << (ppre1 - 3U);
    }
    return hclk / div;
}

static uint32_t compute_uart_div(uint32_t clk, uint32_t baud)
{
    return (clk + (baud / 2U)) / baud;
}

static void uart_set_baudrate(USART_TypeDef *USARTx, uint32_t pclk, uint32_t baud)
{
    USARTx->BRR = compute_uart_div(pclk, baud);
}

void uart2_rxtx_init(void)
{
    RCC->AHB2ENR |= RCC_AHB2ENR_GPIOAEN;
    (void)RCC->AHB2ENR;

    RCC->CCIPR &= ~(3U << 2);

    GPIOA->MODER &= ~((3U << (PA2 * 2U)) | (3U << (PA3 * 2U)));
    GPIOA->MODER |=  (2U << (PA2 * 2U)) | (2U << (PA3 * 2U));

    GPIOA->PUPDR &= ~((3U << (PA2 * 2U)) | (3U << (PA3 * 2U)));
    GPIOA->OSPEEDR |= (2U << (PA2 * 2U)) | (2U << (PA3 * 2U));

    GPIOA->AFR[0] &= ~((0xFU << (PA2 * 4U)) | (0xFU << (PA3 * 4U)));
    GPIOA->AFR[0] |=  ((7U   << (PA2 * 4U)) | (7U   << (PA3 * 4U)));

    RCC->APB1ENR1 |= RCC_APB1ENR1_USART2EN;
    (void)RCC->APB1ENR1;

    uint32_t pclk1 = get_pclk1_hz();
    uart_set_baudrate(USART2, pclk1, UART_BAUDRATE);

    USART2->CR3 |= USART_CR3_DMAR | USART_CR3_DMAT;

    USART2->CR1 = 0;
    USART2->CR1 |= USART_CR1_TE | USART_CR1_RE;
    USART2->CR1 |= USART_CR1_IDLEIE;

    USART2->ICR = USART_ICR_IDLECF | USART_ICR_TCCF;

    USART2->CR1 |= USART_CR1_UE;

    NVIC_EnableIRQ(USART2_IRQn);
}