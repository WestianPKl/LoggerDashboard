#include "hardware/i2c.h"
#include "hardware/pwm.h"
#include "hardware/rtc.h"
#include "pico/cyw43_arch.h"
extern "C" {
    #include "lwip/apps/sntp.h"
    #include "lwip/dns.h"
    #include "lwip/ip_addr.h"
    #include "lwip/timeouts.h"
}
#include <time.h>
#include "program_main.hpp"
#include "lcd_1602_i2c.hpp"
#include "rtc_clock.hpp"
#include "main.hpp"

#define LED_BLUE    7
#define LED_GREEN   6
#define LED_RED     8
#define BUZZER      11

using namespace std;

volatile bool time_synced = false;
static volatile bool dns_resolved = false;
static ip_addr_t resolved_ip;

/**
 * @brief DNS resolution callback function.
 *
 * This function is called when a DNS query completes. If the IP address is successfully resolved,
 * it updates the global variables `resolved_ip` and `dns_resolved`.
 *
 * @param name         The hostname that was resolved.
 * @param ipaddr       Pointer to the resolved IP address, or nullptr if resolution failed.
 * @param callback_arg User-defined argument passed to the callback (unused).
 */
static void dns_callback(const char* name, const ip_addr_t* ipaddr, void* callback_arg) {
    if (ipaddr) {
        resolved_ip = *ipaddr;
        dns_resolved = true;
    }
}

/**
 * @brief Configures the specified GPIO pin for PWM output and enables the corresponding PWM slice.
 *
 * This function sets the function of the given GPIO pin to PWM, determines the PWM slice
 * associated with the pin, and enables PWM output on that slice.
 *
 * @param gpio The GPIO pin number to configure for PWM output.
 */
void ProgramMain::setup_pwm(uint gpio) {
    gpio_set_function(gpio, GPIO_FUNC_PWM);
    uint slice_num = pwm_gpio_to_slice_num(gpio);
    pwm_set_enabled(slice_num, true);
}

/**
 * @brief Sets the PWM duty cycle for a specified GPIO pin.
 *
 * This function configures the PWM hardware to set the duty cycle for the given GPIO pin.
 * It determines the PWM slice and channel associated with the pin and updates the channel's
 * level to the specified duty value.
 *
 * @param gpio The GPIO pin number to set the PWM duty cycle for.
 * @param duty The duty cycle value to set (typically between 0 and the PWM wrap value).
 */
void ProgramMain::set_pwm_duty(uint gpio, uint16_t duty) {
    uint slice_num = pwm_gpio_to_slice_num(gpio);
    uint channel = pwm_gpio_to_channel(gpio);
    pwm_set_chan_level(slice_num, channel, duty);
}

/**
 * @brief Synchronizes the system time using SNTP with a specified NTP server.
 *
 * This function performs the following steps:
 * 1. Sets the timezone environment variable for Central European Time (CET/CEST).
 * 2. Resolves the IP address of the NTP server "tempus1.gum.gov.pl" using DNS.
 *    - If DNS resolution is successful, proceeds immediately.
 *    - If DNS resolution is in progress, polls for completion with a timeout.
 *    - On DNS failure or timeout, logs an error and returns false.
 * 3. Initializes the SNTP client with the resolved server address.
 * 4. Waits for the SNTP time synchronization callback to confirm time sync,
 *    polling and timing out after a fixed period.
 *    - On successful synchronization, stops SNTP and returns true.
 *    - On timeout, logs an error and returns false.
 *
 * @return true if time synchronization was successful, false otherwise.
 */
bool ProgramMain::synchronize_time() {
    setenv("TZ", "CET-1CEST,M3.5.0/2,M10.5.0/3", 1);
    tzset();

    err_t err = dns_gethostbyname("tempus1.gum.gov.pl", &resolved_ip, dns_callback, NULL);
    if (err == ERR_OK) {
        dns_resolved = true;
    } else if (err == ERR_INPROGRESS) {
        for (int i = 0; i < 100 && !dns_resolved; i++) {
            cyw43_arch_poll();
            sleep_ms(100);
        }
    } else {
        printf("❌ DNS error: %d\n", err);
        return false;
    }

    if (!dns_resolved) {
        printf("❌ DNS timeout\n");
        return false;
    }

    printf("🌐 NTP resolved to: %s\n", ipaddr_ntoa(&resolved_ip));

    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setserver(0, &resolved_ip);
    sntp_init();

    for (int i = 0; i < 30; ++i) {
        cyw43_arch_poll();
        if (time_synced) {
            printf("✅ SNTP time confirmed via callback\n");
            sntp_stop();
            return true;
        }
        sleep_ms(300);
    }

    printf("❌ SNTP timeout\n");
    return false;
}

/**
 * @brief Initializes all hardware equipment and peripherals required for the program.
 *
 * This function performs the following initialization steps:
 * - Sets up PWM for RGB LEDs and buzzer, configures their wrap values, and sets initial duty cycles.
 * - Sets the initial RGB LED color to white.
 * - Initializes the I2C interface at 400kHz, configures SDA and SCL pins, enables pull-ups, and declares the pins for board information.
 * - Initializes and clears the LCD, then displays a startup message.
 * - Instantiates the BME280 sensor and TCP communication objects.
 * - Initializes the real-time clock, choosing between PCF8563T (via I2C) or the internal RTC based on the CLOCK macro.
 * - Sets the RGB LED color to green to indicate successful initialization.
 * - Prints a confirmation message to the console.
 */
void ProgramMain::init_equipment() {
    setup_pwm(LED_RED);
    setup_pwm(LED_GREEN);
    setup_pwm(LED_BLUE);
    setup_pwm(BUZZER);

    pwm_set_wrap(pwm_gpio_to_slice_num(LED_RED), 255);
    pwm_set_wrap(pwm_gpio_to_slice_num(LED_GREEN), 255);
    pwm_set_wrap(pwm_gpio_to_slice_num(LED_BLUE), 255);

    set_pwm_duty(LED_RED, 0);
    set_pwm_duty(LED_GREEN, 0);
    set_pwm_duty(LED_BLUE, 0);
    set_pwm_duty(BUZZER, 0);

    set_rgb_color(255, 255, 255);

    i2c_init(i2c_default, 400 * 1000);
    gpio_set_function(I2C_SDA, GPIO_FUNC_I2C);
    gpio_set_function(I2C_SCL, GPIO_FUNC_I2C);
    gpio_pull_up(I2C_SDA);
    gpio_pull_up(I2C_SCL);
    bi_decl(bi_2pins_with_func(I2C_SDA, I2C_SCL, GPIO_FUNC_I2C));

    lcd_init();
    lcd_clear();
    lcd_string("Starting...");

    myBME280 = new BME280(BME280::MODE::MODE_FORCED);
    myTCP = new TCP();

    if (CLOCK == 1){
        pcf8563t_init(I2C_PORT);
    } else {
        rtc_init();
    }

    set_rgb_color(0, 255, 0);
    printf("✅ Equipment initialized correctly\n");
}

/**
 * @brief Initializes the Wi-Fi connection for the program.
 *
 * This function attempts to initialize the Wi-Fi hardware and connect to a predefined
 * Wi-Fi network using the specified SSID and password. It provides visual feedback
 * using RGB LEDs and updates the LCD display with status messages. If the connection
 * is successful, it synchronizes the system time.
 *
 * @return uint8_t Returns WIFI_OK on success, WIFI_INIT_FAIL if initialization fails,
 *                 or WIFI_CONN_FAIL if connection fails.
 */
uint8_t ProgramMain::init_wifi() {
    const char *SSID = "TP-Link_0A7B";
    const char *PASSWORD = "12345678";

    set_rgb_color(255, 255, 255);
    if (cyw43_arch_init()) {
        printf("❌ Wi-Fi init failed\n");
        lcd_set_cursor(0, 0);
        lcd_string("❌ WiFi init error\n");
        set_rgb_color(255, 0, 0);
        return WIFI_INIT_FAIL;
    }

    cyw43_arch_enable_sta_mode();
    if (cyw43_arch_wifi_connect_timeout_ms(SSID, PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000)) {
        lcd_set_cursor(0, 0);
        lcd_string("❌ WiFi conn error\n");
        set_rgb_color(255, 0, 0);
        return WIFI_CONN_FAIL;
    }

    set_rgb_color(0, 255, 0);
    printf("✅ WiFi conn OK\n");
    synchronize_time();
    return WIFI_OK;
}

/**
 * @brief Sets the RGB LED color by adjusting the PWM duty cycle for each color channel.
 *
 * This function sets the intensity of the red, green, and blue channels of an RGB LED
 * by configuring the PWM duty cycle for each channel. The values for each color should
 * be in the range 0-255, where 0 is off and 255 is maximum brightness.
 *
 * @param red   The intensity of the red channel (0-255).
 * @param green The intensity of the green channel (0-255).
 * @param blue  The intensity of the blue channel (0-255).
 */
void ProgramMain::set_rgb_color(uint8_t red, uint8_t green, uint8_t blue) {
    set_pwm_duty(LED_RED, red);
    set_pwm_duty(LED_GREEN, green);
    set_pwm_duty(LED_BLUE, blue);
}

/**
 * @brief Displays the current measurement data and timestamp on the LCD.
 *
 * This function reads the current time from either the PCF8563T RTC or the built-in RTC,
 * depending on the CLOCK setting. It then measures temperature, humidity, and pressure
 * using the BME280 sensor. The function displays the date and time on the first line of
 * the LCD, and alternates between displaying temperature/humidity and pressure on the
 * second line. If any errors occur during time or sensor reading, appropriate error
 * messages are printed and sent via TCP.
 *
 * Error handling:
 * - If the time cannot be read, an error is logged and the function returns.
 * - If the sensor values are out of range, an error is logged and the function returns.
 *
 * LCD display:
 * - Line 1: Date and time in the format "YYYY-MM-DD HH:MM".
 * - Line 2: Alternates between "T:xx.xC H:xx.x%" and "P:xxxxhPa" based on the option.
 *
 * The function also cycles the display option every call, and sets the RGB color
 * depending on the displayed data.
 */
void ProgramMain::display_measurement() {
    static uint8_t option = 0;
    bool time_ok = false;
    uint16_t time[7];
    if (CLOCK == 1) {
        time_ok = pcf8563t_read_time(I2C_PORT, time);
    } else {
        datetime_t t;
        time_ok = rtc_get_datetime(&t);
        time[6] = t.year;
        time[5] = t.month;
        time[3] = t.day;
        time[2] = t.hour;
        time[1] = t.min;
        time[0] = t.sec;
    }

    if (!time_ok) {
        printf("❌ Time could not be readed.\n");
        TCP().send_error_log("Time could not be readed.", CLOCK ? "PCF8563" : "RTC");
        return;
    }

    BME280::Measurement_t values = myBME280->measure();

    if (values.temperature < -100 || values.temperature > 100 ||
        values.humidity < 0 || values.humidity > 100) {
        printf("❌ Measurement out of range\n");
        myTCP->send_error_log("Sensor error", "Values out of range");
        return;
    }

    char line1[17];
    char line2[17];

    snprintf(line1, sizeof(line1), "%04d-%02d-%02d %02d:%02d",
             time[6], time[5], time[3], time[2], time[1]);

    if (option == 0) {
        set_rgb_color(0, 255, 0);
        snprintf(line2, sizeof(line2), "T:%.1fC H:%.1f%%", values.temperature, values.humidity);
        lcd_set_cursor(1, 0);
        lcd_string("                ");
        lcd_set_cursor(1, 0);
        lcd_string(line2);
    } else if (option == 3) {
        set_rgb_color(0, 0, 0);
        snprintf(line2, sizeof(line2), "P:%4.0fhPa", values.pressure);
        lcd_set_cursor(1, 0);
        lcd_string("                ");
        lcd_set_cursor(1, 0);
        lcd_string(line2);
    }
    lcd_set_cursor(0, 0);
    lcd_string(line1);
    option++;
	if(option > 6){
		option = 0;
	}
    printf("✅ Data OK\n");
}

/**
 * @brief Sends sensor data along with the current timestamp to a remote server.
 *
 * This function performs the following steps:
 * 1. Reads the current time from either the PCF8563T RTC or the onboard RTC, depending on the CLOCK setting.
 * 2. If the time cannot be read, logs an error and returns.
 * 3. Formats the timestamp as a string.
 * 4. Reads temperature, humidity, and pressure values from the BME280 sensor.
 * 5. Validates the sensor data; if invalid, logs an error and returns.
 * 6. Attempts to fetch an authentication token from the server; if unsuccessful, logs an error and returns.
 * 7. Checks if the received token is valid; if not, logs an error and returns.
 * 8. Sends the timestamped sensor data to the server via a POST request.
 *    If the data cannot be sent, logs an error.
 *
 * Error conditions are logged both to the console and via the TCP error log mechanism.
 */
void ProgramMain::send_data() {
    bool time_ok = false;
    uint16_t time[7];
    if (CLOCK == 1) {
        time_ok = pcf8563t_read_time(I2C_PORT, time);
    } else {
        datetime_t t;
        time_ok = rtc_get_datetime(&t);
        time[6] = t.year;
        time[5] = t.month;
        time[3] = t.day;
        time[2] = t.hour;
        time[1] = t.min;
        time[0] = t.sec;
    }
    if (!time_ok) {
        printf("❌ Time could not be readed.\n");
        TCP().send_error_log("Time could not be readed.", CLOCK ? "PCF8563" : "RTC");
        return;
    }
    char time_send[32];
    snprintf(time_send, sizeof(time_send), "%04d-%02d-%02d %02d:%02d:%02d",
             time[6], time[5], time[3], time[2], time[1], time[0]);
    BME280::Measurement_t values = myBME280->measure();
    if (values.temperature < -100 || values.temperature > 100 ||
        values.humidity < 0 || values.humidity > 100) {
        printf("❌ Invalid sensor values\n");
        myTCP->send_error_log("Invalid sensor data");
        return;
    }
    if (!myTCP->send_token_get_request()) {
        printf("❌ API communication error\n");
        myTCP->send_error_log("Token fetch failed");
        return;
    }
    if (strlen(myTCP->get_token()) == 0) {
        printf("❌ Token is incorrect\n");
        myTCP->send_error_log("Token is incorrect");
        return;
    }
    if (!myTCP->send_data_post_request(time_send, values.temperature, values.humidity, values.pressure)) {
        printf("❌ Data sending error\n");
        myTCP->send_error_log("Data sending error", time_send);
    }
}

/**
 * @brief Sets the system time using the provided SNTP seconds value.
 *
 * This function is intended to be called from C code (extern "C").
 * It marks the system time as synchronized, converts the given seconds
 * since the epoch to a local time structure, and then populates a datetime_t
 * structure with the corresponding date and time fields.
 * The function prints the new system time to the console.
 * Depending on the values of the global variables CLOCK and SET, it updates
 * either an external PCF8563T RTC chip via I2C or the internal RTC.
 *
 * @param secs The number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC).
 */
extern "C" void sntp_set_system_time(uint32_t secs) {
    time_synced = true;
    time_t rawtime = secs;
    struct tm *lt = localtime(&rawtime);
    datetime_t dt = {
        .year  = (int16_t)(lt->tm_year + 1900),
        .month = (int8_t)(lt->tm_mon + 1),
        .day   = (int8_t)(lt->tm_mday),
        .dotw  = (int8_t)(lt->tm_wday),
        .hour  = (int8_t)(lt->tm_hour),
        .min   = (int8_t)(lt->tm_min),
        .sec   = (int8_t)(lt->tm_sec),
    };
    printf("🕒 [SNTP] System time set: %04d-%02d-%02d %02d:%02d:%02d\n",
           dt.year, dt.month, dt.day, dt.hour, dt.min, dt.sec);
    if (CLOCK == 1 && SET == 1) {
        pcf8563t_set_time(I2C_PORT, dt.sec, dt.min, dt.hour, dt.dotw, dt.day, dt.month, dt.year);
    } else if (CLOCK == 0 && SET == 1) {
        rtc_set_datetime(&dt);
    }
}