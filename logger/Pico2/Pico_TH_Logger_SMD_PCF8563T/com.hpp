/**
 * @file com.hpp
 * @brief Communication service layer for USB CDC (TinyUSB) console integration.
 *
 * Declares the polling routine and the TinyUSB CDC receive callback used to
 * integrate the USB serial console with the application's main loop.
 */

/**
 * @brief Service the communication layer.
 *
 * Non-blocking pump that processes received data, advances protocol/state machines,
 * and emits pending responses. Call this frequently from the main loop.
 *
 * Safe to call even when USB is not connected.
 */
 
/**
 * @brief Check whether the "ready" banner has been sent to the host.
 *
 * Use this to ensure the banner is printed only once per boot/session.
 * @return true if the banner was already sent; false otherwise.
 */

/**
 * @brief TinyUSB CDC receive callback.
 *
 * Invoked by TinyUSB when new data is available on a CDC interface.
 * Do minimal work here and avoid blocking. Typically, stash incoming bytes
 * into a buffer and let com_poll() process them later.
 *
 * @param itf CDC interface number that received data.
 * @note Called from TinyUSB context; avoid heavy work and blocking calls.
 */
#pragma once

#ifndef __COM_HPP__
#define __COM_HPP__

#include <cstddef>
#include <cstdint>

void com_poll();
bool com_ready_banner_sent();
extern "C" void tud_cdc_rx_cb(uint8_t);

#endif /* __COM_HPP__ */