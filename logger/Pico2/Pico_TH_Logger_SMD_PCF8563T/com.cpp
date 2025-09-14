#include "com.hpp"

#include <cstring>
#include <cctype>
#include <cstdio>
#include <cstdarg>

#include "pico/stdlib.h"
#include "tusb.h"
extern "C" {
    #include "lwip/timeouts.h"
}

#include "config.hpp"

extern volatile bool wifi_reconnect_flag;
extern volatile bool wifi_apply_flag;
extern volatile bool device_reset_flag;

static bool s_ready_banner_sent = false;
static volatile bool s_pending_show = false;
static volatile bool s_pending_help = false;
static char s_pending_help_args[64] = {0};

// Help content
static size_t s_help_index = 0;       // current index for paged help
static int s_help_page = 10;          // default page size
static const char* s_help_lines[] = {
    "Commands:",
    "  show                               - print current config",
    "  set k=v | set k v                  - update config key",
    "  save | load | defaults             - persist/load/reset config",
    "  reconnect                          - reconnect Wi-Fi (if enabled)",
    "  reset                              - reboot the device",
    "  echo <text>                        - echo back text",
    "  help [next|reset|all|size=N]       - paged help control",
    "",
    "Keys for set:",
    "  logger_id, sensor_id, server_ip, server_port",
    "  temperature, humidity, pressure, sht",
    "  clock, set_time, wifi_enabled",
    "  wifi_ssid, wifi_password",
    "  post_time_ms (ms)",
    "",
    "Examples:",
    "  show",
    "  set server_ip=192.168.1.10",
    "  set wifi_enabled 1",
    "  set wifi_enabled 0",
    "  set logger_id 42",
    "  save",
    "  help size=8   (set page size)",
    "  help reset    (go to the beginning)",
    "  help all      (print everything)",
};
static const size_t s_help_count = sizeof(s_help_lines)/sizeof(s_help_lines[0]);

/**
 * @brief Best-effort write of a buffer to the USB CDC interface with flushing and a timeout.
 *
 * Writes up to len bytes from data to the TinyUSB CDC endpoint, flushing after each
 * successful chunk. If the endpoint cannot accept data, the function yields to the USB
 * stack to progress transfers. The operation ends when all bytes are written, the CDC
 * connection is lost, or a ~1 second overall deadline expires.
 *
 * Notes:
 * - Returns immediately if len <= 0.
 * - May perform a partial write if the device disconnects or the timeout elapses.
 * - Does not report how many bytes were written; callers that require this must track it externally.
 * - Treats the buffer as raw bytes; no null terminator is appended.
 * - Calls into tud_task() and may spin via tight_loop_contents() to give the USB stack time.
 *
 * Preconditions:
 * - TinyUSB must be initialized and running.
 * - data must be non-null if len > 0.
 *
 * Thread-safety:
 * - Not safe for concurrent use on the same CDC interface; serialize access to CDC writes.
 *
 * @param data Pointer to the bytes to write.
 * @param len  Number of bytes to write.
 */
static void cdc_write_all(const char* data, int len) {
    if (len <= 0) return;
    int written = 0;
    absolute_time_t deadline = make_timeout_time_ms(1000); // up to ~1s per chunk
    while (written < len) {
        if (!tud_cdc_connected()) break;
        int n = tud_cdc_write(data + written, (uint32_t)(len - written));
        if (n > 0) {
            written += n;
            tud_cdc_write_flush();
        } else {
            // Give USB stack time to progress
            tud_task();
            tight_loop_contents();
            if (absolute_time_diff_us(get_absolute_time(), deadline) < 0) {
                // timeout: don't block forever
                break;
            }
        }
    }
}

/**
 * Formats and writes a string to the CDC endpoint without appending a newline.
 *
 * Renders the printf-style formatted text into a fixed 160-byte stack buffer and
 * transmits the resulting bytes via cdc_write_all.
 *
 * Behavior:
 * - On formatting error, nothing is sent.
 * - If the formatted output fits, exactly the number of formatted bytes is sent
 *   (the NUL terminator is not transmitted).
 * - If the formatted output exceeds the buffer capacity, the output is truncated;
 *   exactly 160 bytes are sent, which includes the NUL terminator as the last byte.
 *
 * Notes:
 * - No newline is appended; include '\n' in the format string if needed.
 * - Maximum payload per call is 160 bytes.
 *
 * @param fmt  printf-style format string.
 * @param ...  Arguments corresponding to the format specifiers in fmt.
 *
 * @see cdc_write_all
 */
static void cdc_write_linef(const char* fmt, ...) {
    char line[160];
    va_list ap; va_start(ap, fmt);
    int m = vsnprintf(line, sizeof(line), fmt, ap);
    va_end(ap);
    if (m < 0) return;
    if (m > (int)sizeof(line)) m = (int)sizeof(line);
    cdc_write_all(line, m);
}

/**
 * @brief Emit the current configuration over the CDC interface in a stable key=value format.
 *
 * Retrieves the active configuration via config_get() and writes it line-by-line using cdc_write_linef.
 * The following keys are emitted in order, each followed by a newline:
 *  - logger_id, sensor_id
 *  - server_ip, server_port
 *  - temperature, humidity, pressure, sht
 *  - clock, set
 *  - wifi, wifi_ssid, wifi_password
 * The sequence is terminated with a final line: "SHOW_END".
 *
 * Preconditions:
 *  - CDC/I/O subsystem is initialized and ready to transmit.
 *  - config_get() returns a valid configuration; string fields are NUL-terminated.
 *
 * Side effects:
 *  - Writes multiple lines to the CDC output.
 *
 * Format notes:
 *  - Numeric fields are printed with %u, strings with %s.
 *  - Each key is emitted as "key=value\n".
 *
 * Security considerations:
 *  - wifi_password is emitted in clear text; use only in trusted/debug environments.
 *
 * Thread-safety:
 *  - Not inherently thread-safe; ensure external synchronization if accessed concurrently.
 *
 * Example output:
 *  logger_id=1
 *  sensor_id=42
 *  server_ip=192.168.1.10
 *  server_port=8080
 *  temperature=1
 *  humidity=1
 *  pressure=0
 *  sht=1
 *  clock=1
 *  set=0
 *  wifi=1
 *  wifi_ssid=MyNetwork
 *  wifi_password=Secret123
 *  SHOW_END
 */
static void process_show_output() {
    const auto &cfg = config_get();
    cdc_write_linef("logger_id=%u\n", cfg.logger_id);
    cdc_write_linef("sensor_id=%u\n", cfg.sensor_id);
    cdc_write_linef("server_ip=%s\n", cfg.server_ip);
    cdc_write_linef("server_port=%u\n", cfg.server_port);
    cdc_write_linef("temperature=%u\n", cfg.temperature);
    cdc_write_linef("humidity=%u\n", cfg.humidity);
    cdc_write_linef("pressure=%u\n", cfg.pressure);
    cdc_write_linef("sht=%u\n", cfg.sht);
    cdc_write_linef("clock=%u\n", cfg.clock_enabled);
    cdc_write_linef("set_time=%u\n", cfg.set_time_enabled);
    cdc_write_linef("wifi_enabled=%u\n", cfg.wifi_enabled);
    cdc_write_linef("wifi_ssid=%s\n", cfg.wifi_ssid);
    cdc_write_linef("wifi_password=%s\n", cfg.wifi_password);
    cdc_write_linef("post_time_ms=%u\n", (unsigned)cfg.post_time_ms);
    // Diagnostic: where config came from at boot
    auto src = config_last_source();
    const char *src_s = (src == ConfigSource::Loaded) ? "loaded" : (src == ConfigSource::DefaultsSaved) ? "defaults" : "unknown";
    cdc_write_linef("config_source=%s\n", src_s);
    cdc_write_linef("SHOW_END\n");
}

/**
 * Processes the argument to the "help" command and emits paginated help text via cdc_write_linef.
 *
 * Behavior:
 * - Interprets the input argument case-insensitively; leading/trailing whitespace is trimmed.
 * - Input is copied into a 64-byte buffer and truncated if longer (always null-terminated).
 * - Always terminates a response with the line "HELP_END".
 *
 * Accepted arguments:
 * - "" (empty) or "next":
 *   - Prints the next page of help starting at s_help_index, up to s_help_page lines.
 *   - Updates s_help_index to the next unread position.
 *   - Prints a continuation marker:
 *     - "-- more (help | help next | help all) --" if more lines remain,
 *     - "-- end (help reset | help size=N) --" if at the end.
 *
 * - "reset":
 *   - Resets s_help_index to 0.
 *   - Prints "HELP_RESET".
 *
 * - "all":
 *   - Prints all help lines in order, then "-- end --".
 *   - Sets s_help_index to s_help_count (marks as fully consumed).
 *
 * - "size=N":
 *   - Sets the page size s_help_page to N, clamped to [1, 50].
 *   - Echoes the new size as "HELP_PAGE_SIZE=N".
 *
 * - "<page>":
 *   - Interprets a positive integer as a 1-based page number.
 *   - Prints that page (starting at (page-1)*s_help_page), then either "-- more --" or "-- end --".
 *   - Updates s_help_index to the position after the printed page.
 *
 * Errors:
 * - For any unrecognized/invalid argument, prints "ERR help args".
 *
 * Output format:
 * - Each help line is printed as a numbered entry: "%2u. %s\n" (1-based index).
 *
 * Side effects:
 * - May modify global pagination state: s_help_index and s_help_page.
 *
 * Preconditions:
 * - rest_arg must point to a valid null-terminated string (may be empty).
 *
 * Parameters:
 * - rest_arg: Raw user-supplied argument following the "help" command.
 *
 * Returns:
 * - None (writes output via cdc_write_linef).
 */
static void process_help_output(const char* rest_arg) {
    auto trim_inplace = [](char *s) {
        size_t start = 0; while (s[start] && isspace((unsigned char)s[start])) ++start;
        if (start) memmove(s, s + start, strlen(s + start) + 1);
        size_t len = strlen(s);
        while (len > 0 && isspace((unsigned char)s[len - 1])) s[--len] = '\0';
    };
    auto tolower_copy = [](const char *src, char *dst, size_t dst_size) {
        if (dst_size == 0) return; size_t i = 0; for (; src[i] && i + 1 < dst_size; ++i) dst[i] = (char)tolower((unsigned char)src[i]); dst[i] = '\0';
    };

    char rest_lc[64]; tolower_copy(rest_arg, rest_lc, sizeof(rest_lc)); trim_inplace(rest_lc);
    auto print_range = [&](size_t start, size_t count){
        size_t end = start + count; if (end > s_help_count) end = s_help_count;
        for (size_t i = start; i < end; ++i) {
            cdc_write_linef("%2u. %s\n", (unsigned)(i + 1), s_help_lines[i]);
        }
        return end;
    };

    bool did_print = false;
    if (rest_lc[0] == '\0' || strcmp(rest_lc, "next") == 0) {
        size_t new_idx = print_range(s_help_index, s_help_page);
        did_print = true; s_help_index = new_idx;
        if (s_help_index >= s_help_count) {
            cdc_write_linef("-- end (help reset | help size=N) --\n");
        } else {
            cdc_write_linef("-- more (help | help next | help all) --\n");
        }
        cdc_write_linef("HELP_END\n");
    } else if (strcmp(rest_lc, "reset") == 0) {
        s_help_index = 0; cdc_write_linef("HELP_RESET\n"); cdc_write_linef("HELP_END\n"); did_print = true;
    } else if (strcmp(rest_lc, "all") == 0) {
        print_range(0, s_help_count); cdc_write_linef("-- end --\n"); cdc_write_linef("HELP_END\n"); s_help_index = s_help_count; did_print = true;
    } else if (strncmp(rest_lc, "size=", 5) == 0) {
        int sz = (int)strtoul(rest_lc + 5, nullptr, 10); if (sz < 1) sz = 1; if (sz > 50) sz = 50; s_help_page = sz;
        cdc_write_linef("HELP_PAGE_SIZE=%d\n", s_help_page); cdc_write_linef("HELP_END\n"); did_print = true;
    } else {
        char *endp = nullptr; long pn = strtol(rest_lc, &endp, 10);
        if (endp && *endp == '\0' && pn >= 1) {
            size_t start = (size_t)(pn - 1) * (size_t)s_help_page; if (start > s_help_count) start = s_help_count;
            s_help_index = print_range(start, s_help_page);
            if (s_help_index >= s_help_count) cdc_write_linef("-- end --\n"); else cdc_write_linef("-- more --\n");
            cdc_write_linef("HELP_END\n"); did_print = true;
        }
    }
    if (!did_print) { cdc_write_linef("ERR help args\n"); cdc_write_linef("HELP_END\n"); }
}


bool com_ready_banner_sent() {
    return s_ready_banner_sent;
}

/**
 * @brief Polls communication and USB CDC tasks; processes pending outputs.
 *
 * Performs periodic maintenance by:
 * - Running TinyUSB device tasks and system timeout checks.
 * - If a CDC connection is present:
 *   - Sending a one-time "READY v2" banner on the first connection.
 *   - Processing any pending "show" output request.
 *   - Processing any pending "help" output request, then clearing its args buffer.
 *
 * Call this frequently from the main loop to service USB and deferred work.
 * The function is non-blocking and uses global state to determine pending actions.
 *
 * Preconditions:
 * - TinyUSB device stack has been initialized.
 * - Global flags/buffers (s_ready_banner_sent, s_pending_show, s_pending_help,
 *   s_pending_help_args) are initialized.
 *
 * Side effects:
 * - Writes to the USB CDC interface and flushes it.
 * - Mutates global flags and zero-terminates the help-args buffer.
 *
 * Thread safety:
 * - Not thread-safe; intended for single-threaded main-loop usage.
 *
 * @return void
 */
void com_poll() {
    tud_task();
    sys_check_timeouts();

    if (!s_ready_banner_sent && tud_cdc_connected()) {
        tud_cdc_write_str("READY v2\n");
        tud_cdc_write_flush();
        s_ready_banner_sent = true;
    }
    if (s_pending_show && tud_cdc_connected()) {
        s_pending_show = false;
        process_show_output();
    }
    if (s_pending_help && tud_cdc_connected()) {
        s_pending_help = false;
        process_help_output(s_pending_help_args);
        s_pending_help_args[0] = '\0';
    }
}


/**
 * @brief TinyUSB CDC receive callback implementing a line-oriented command parser.
 *
 * Accumulates incoming CDC bytes into a static command buffer until a newline '\n'
 * is received (carriage returns '\r' are ignored). Upon receiving a complete line,
 * the command is trimmed, the first token is treated as a case-insensitive keyword,
 * and the remainder is parsed as command arguments. Responses are written back over
 * CDC and flushed immediately.
 *
 * Supported commands:
 * - show
 *   - Sets a deferred flag to print status elsewhere.
 *   - Reply: none immediately (printing deferred).
 *
 * - set key=value | set key value
 *   - Whitespace around key/value is trimmed. Key is case-insensitive with aliases:
 *     wifi -> wifi_enabled, set -> set_time, clock_enabled -> clock.
 *   - Updates configuration fields:
 *     logger_id (u32), sensor_id (u32), server_ip (str), server_port (u16),
 *     temperature (u8), humidity (u8), pressure (u8), sht (u8),
 *     clock (u8 -> clock_enabled), set_time (u8 -> set_time_enabled),
 *     wifi_enabled (u8; also sets wifi_apply_flag),
 *     wifi_ssid (str), wifi_password (str), post_time_ms (u32).
 *   - Reply: "OK\n" on success, "ERR unknown key\n" if key is not recognized,
 *            "ERR format\n" on parsing errors.
 *
 * - save
 *   - Persists current configuration.
 *   - Reply: "SAVED wifi_enabled=%u\n" on success, "SAVE_ERR\n" on failure.
 *
 * - load
 *   - Loads configuration from storage; sets wifi_apply_flag on success.
 *   - Reply: "LOADED wifi_enabled=%u\n" on success, "LOAD_ERR\n" on failure.
 *
 * - defaults
 *   - Resets configuration to defaults and attempts to save; sets wifi_apply_flag.
 *   - Reply: "DEFAULTS_SAVED\n" if saved, otherwise "DEFAULTS_SET\n".
 *
 * - reconnect
 *   - Requests Wi-Fi reconnect (sets wifi_reconnect_flag).
 *   - Reply: "RECONNECTING\n".
 *
 * - help [args]
 *   - Stores help arguments (bounded copy) and defers help printing.
 *   - Reply: none immediately (printing deferred).
 *
 * - reset
 *   - Requests device reset (sets device_reset_flag).
 *   - Reply: "RESETTING\n".
 *
 * - echo [text]
 *   - Echoes the provided text followed by a newline.
 *
 * - Unknown command
 *   - Reply: "Unknown cmd\n".
 *
 * Buffering and limits:
 * - Command buffer: 96 bytes including terminator. If exceeded, the buffer is cleared
 *   and "ERR too long\n" is sent.
 * - Read chunk size: 64 bytes.
 * - Parsing is whitespace-tolerant; commands and keys are case-insensitive.
 *
 * Side effects:
 * - Modifies runtime configuration via config_mut().
 * - May persist/load configuration (config_save/config_load).
 * - Sets flags: s_pending_show, s_pending_help (+ s_pending_help_args),
 *   wifi_apply_flag, wifi_reconnect_flag, device_reset_flag.
 * - Writes responses to the CDC interface (tud_cdc_write*, flushed).
 *
 * Threading/Context:
 * - Intended to be called by TinyUSB when CDC data is available.
 * - Uses static locals for command accumulation; no dynamic allocation.
 *
 * @param itf CDC interface index provided by TinyUSB (unused).
 * @return void
 */
extern "C" void tud_cdc_rx_cb(uint8_t itf) {
    static char cmd_buf[96];
    static size_t cmd_len = 0;

    char tmp[64];
    uint32_t n = tud_cdc_read(tmp, sizeof(tmp));
    for (uint32_t i = 0; i < n; ++i) {
        char ch = tmp[i];
        if (ch == '\r') continue;
        if (ch == '\n') {
            cmd_buf[cmd_len] = '\0';
            auto trim_inplace = [](char *s) {
                size_t start = 0; while (s[start] && isspace((unsigned char)s[start])) ++start;
                if (start) memmove(s, s + start, strlen(s + start) + 1);
                size_t len = strlen(s);
                while (len > 0 && isspace((unsigned char)s[len - 1])) s[--len] = '\0';
            };
            auto tolower_copy = [](const char *src, char *dst, size_t dst_size) {
                if (dst_size == 0) return; 
                size_t i = 0; 
                for (; src[i] && i + 1 < dst_size; ++i) dst[i] = (char)tolower((unsigned char)src[i]);
                dst[i] = '\0';
            };

            trim_inplace(cmd_buf);

            char cmd_kw[16];
            size_t k = 0; while (cmd_buf[k] && !isspace((unsigned char)cmd_buf[k]) && k + 1 < sizeof(cmd_kw)) { cmd_kw[k] = (char)tolower((unsigned char)cmd_buf[k]); ++k; }
            cmd_kw[k] = '\0';

            const char *rest = cmd_buf + k;
            while (*rest && isspace((unsigned char)*rest)) ++rest;

            if (strcmp(cmd_kw, "show") == 0 && (*rest == '\0')) {
                s_pending_show = true; // defer printing to com_poll
            } else if (strcmp(cmd_kw, "set") == 0) {
                char key_raw[48];
                char val_raw[64];
                key_raw[0] = '\0'; val_raw[0] = '\0';
                const char *eqp = strchr(rest, '=');
                const char *key = nullptr;
                const char *val = nullptr;
                if (eqp) {
                    size_t key_len = (size_t)(eqp - rest);
                    if (key_len >= sizeof(key_raw)) key_len = sizeof(key_raw) - 1;
                    memcpy(key_raw, rest, key_len); key_raw[key_len] = '\0';
                    strncpy(val_raw, eqp + 1, sizeof(val_raw) - 1); val_raw[sizeof(val_raw) - 1] = '\0';
                } else {
                    const char *sp = rest;
                    while (*sp && !isspace((unsigned char)*sp)) ++sp;
                    size_t key_len = (size_t)(sp - rest);
                    if (key_len >= sizeof(key_raw)) key_len = sizeof(key_raw) - 1;
                    memcpy(key_raw, rest, key_len); key_raw[key_len] = '\0';
                    while (*sp && isspace((unsigned char)*sp)) ++sp;
                    strncpy(val_raw, sp, sizeof(val_raw) - 1); val_raw[sizeof(val_raw) - 1] = '\0';
                }
                auto trim_inplace2 = [](char *s) {
                    size_t start = 0; while (s[start] && isspace((unsigned char)s[start])) ++start;
                    if (start) memmove(s, s + start, strlen(s + start) + 1);
                    size_t len = strlen(s);
                    while (len > 0 && isspace((unsigned char)s[len - 1])) s[--len] = '\0';
                };
                trim_inplace2(key_raw);
                trim_inplace2(val_raw);
                char key_lc[48];
                size_t i = 0; for (; key_raw[i] && i + 1 < sizeof(key_lc); ++i) key_lc[i] = (char)tolower((unsigned char)key_raw[i]);
                key_lc[i] = '\0';
                // Provide backward-compatible aliases
                if (strcmp(key_lc, "wifi") == 0) {
                    strcpy(key_lc, "wifi_enabled");
                } else if (strcmp(key_lc, "set") == 0) {
                    strcpy(key_lc, "set_time");
                } else if (strcmp(key_lc, "clock_enabled") == 0) {
                    strcpy(key_lc, "clock");
                }
                key = key_lc; val = val_raw;
                if (key && val) {
                    auto &cfg = config_mut();
                    bool ok = true;
                    if (strcmp(key, "logger_id") == 0) cfg.logger_id = (uint32_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "sensor_id") == 0) cfg.sensor_id = (uint32_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "server_ip") == 0) snprintf(cfg.server_ip, sizeof(cfg.server_ip), "%s", val);
                    else if (strcmp(key, "server_port") == 0) cfg.server_port = (uint16_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "temperature") == 0) cfg.temperature = (uint8_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "humidity") == 0) cfg.humidity = (uint8_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "pressure") == 0) cfg.pressure = (uint8_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "sht") == 0) cfg.sht = (uint8_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "clock") == 0) cfg.clock_enabled = (uint8_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "set_time") == 0) cfg.set_time_enabled = (uint8_t)strtoul(val, nullptr, 10);
                    else if (strcmp(key, "wifi_enabled") == 0 ) { cfg.wifi_enabled = (uint8_t)strtoul(val, nullptr, 10); wifi_apply_flag = true; }
                    else if (strcmp(key, "wifi_ssid") == 0) snprintf(cfg.wifi_ssid, sizeof(cfg.wifi_ssid), "%s", val);
                    else if (strcmp(key, "wifi_password") == 0) snprintf(cfg.wifi_password, sizeof(cfg.wifi_password), "%s", val);
                    else if (strcmp(key, "post_time_ms") == 0) cfg.post_time_ms = (uint32_t)strtoul(val, nullptr, 10);
                    else ok = false;
                    tud_cdc_write_str(ok ? "OK\n" : "ERR unknown key\n");
                    tud_cdc_write_flush();
                } else {
                    tud_cdc_write_str("ERR format\n");
                    tud_cdc_write_flush();
                }
            } else if (strcmp(cmd_kw, "save") == 0 && (*rest == '\0')) {
                bool ok = config_save();
                if (ok) {
                    const auto &c = config_get();
                    cdc_write_linef("SAVED wifi_enabled=%u\n", c.wifi_enabled);
                } else {
                    tud_cdc_write_str("SAVE_ERR\n");
                }
                tud_cdc_write_flush();
            } else if (strcmp(cmd_kw, "load") == 0 && (*rest == '\0')) {
                bool ok = config_load();
                if (ok) { 
                    wifi_apply_flag = true; 
                    const auto &c = config_get();
                    cdc_write_linef("LOADED wifi_enabled=%u\n", c.wifi_enabled);
                } else {
                    tud_cdc_write_str("LOAD_ERR\n");
                }
                tud_cdc_write_flush();
            } else if (strcmp(cmd_kw, "defaults") == 0 && (*rest == '\0')) {
                config_set_defaults();
                bool ok = config_save();
                wifi_apply_flag = true;
                tud_cdc_write_str(ok ? "DEFAULTS_SAVED\n" : "DEFAULTS_SET\n");
                tud_cdc_write_flush();
            } else if (strcmp(cmd_kw, "reconnect") == 0 && (*rest == '\0')) {
                wifi_reconnect_flag = true;
                tud_cdc_write_str("RECONNECTING\n");
                tud_cdc_write_flush();
            } else if (strcmp(cmd_kw, "help") == 0) {
                size_t arg_len = strlen(rest);
                if (arg_len >= sizeof(s_pending_help_args)) arg_len = sizeof(s_pending_help_args) - 1;
                memcpy(s_pending_help_args, rest, arg_len);
                s_pending_help_args[arg_len] = '\0';
                s_pending_help = true;
            } else if (strcmp(cmd_kw, "reset") == 0 && (*rest == '\0')) {
                device_reset_flag = true;
                tud_cdc_write_str("RESETTING\n");
                tud_cdc_write_flush();
            } else if (strcmp(cmd_kw, "echo") == 0) {
                tud_cdc_write(rest, strlen(rest));
                tud_cdc_write_str("\n");
                tud_cdc_write_flush();
            } else {
                tud_cdc_write_str("Unknown cmd\n");
                tud_cdc_write_flush();
            }

            cmd_len = 0;
        } else if (cmd_len + 1 < sizeof(cmd_buf)) {
            cmd_buf[cmd_len++] = ch;
        } else {
            cmd_len = 0;
            tud_cdc_write_str("ERR too long\n");
            tud_cdc_write_flush();
        }
    }
}
