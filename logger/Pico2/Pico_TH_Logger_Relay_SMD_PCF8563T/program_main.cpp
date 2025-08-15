#include "hardware/i2c.h"
#include "hardware/pwm.h"
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

#define LED_BLUE    6
#define LED_GREEN   8
#define LED_RED     7
#define BUZZER      11

using namespace std;

typedef struct {
    int16_t year;
    int8_t month;
    int8_t day;
    int8_t dotw;
    int8_t hour;
    int8_t min;
    int8_t sec;
} datetime_t;

volatile bool time_synced = false;
static volatile bool dns_resolved = false;
static ip_addr_t resolved_ip;

/**
 * @brief DNS resolution callback function.
 *
 * This function is called when a DNS query completes. If the IP address is successfully resolved,
 * it updates the global variable `resolved_ip` with the resolved address and sets the `dns_resolved`
 * flag to true.
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
 * output level accordingly.
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
 * @brief Synchronizes the system time using SNTP and a DNS-resolved NTP server.
 *
 * This function performs the following steps:
 * 1. Sets the timezone environment variable for Central European Time (CET/CEST).
 * 2. Resolves the IP address of the NTP server "tempus1.gum.gov.pl" using DNS.
 *    - Waits for DNS resolution with a timeout.
 * 3. Initializes the SNTP client with the resolved server address.
 * 4. Waits for the SNTP time synchronization to be confirmed via a callback, with a timeout.
 * 5. Stops the SNTP client after successful synchronization or on timeout.
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
 * @brief Initializes all equipment and peripherals required for the program.
 *
 * This function sets up PWM for LEDs and buzzer, configures I2C communication,
 * initializes the LCD display, and creates instances of sensor and network classes.
 * It also initializes the real-time clock if enabled, and provides visual feedback
 * via RGB LEDs and the LCD display.
 *
 * Steps performed:
 * - Configures PWM for RGB LEDs and buzzer, sets initial duty cycles.
 * - Sets the RGB LED to white, then green upon successful initialization.
 * - Initializes I2C at 400kHz and configures SDA/SCL pins with pull-ups.
 * - Initializes and clears the LCD, displaying a startup message.
 * - Instantiates BME280 sensor and TCP communication objects.
 * - Initializes the PCF8563T RTC if the CLOCK flag is set.
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
    }

    set_rgb_color(0, 255, 0);
    printf("✅ Equipment initialized correctly\n");
}

/**
 * @brief Initializes the Wi-Fi connection for the program.
 *
 * This function attempts to initialize the Wi-Fi hardware and connect to a predefined
 * Wi-Fi network using the specified SSID and password. It provides visual feedback
 * using RGB LEDs and updates the LCD display with the connection status.
 * If the connection is successful, it synchronizes the system time.
 *
 * @return uint8_t Status code indicating the result of the operation:
 *         - WIFI_OK on successful connection
 *         - WIFI_INIT_FAIL if Wi-Fi initialization fails
 *         - WIFI_CONN_FAIL if Wi-Fi connection fails
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
 * @brief Displays sensor measurements and current time on the LCD.
 *
 * This function reads the current time from the RTC (if enabled) and obtains
 * environmental measurements (temperature, humidity, pressure) from the BME280 sensor.
 * It validates the sensor readings and displays them on a two-line LCD display,
 * alternating between temperature/humidity and pressure on subsequent calls.
 * If the time cannot be read or sensor values are out of range, error messages
 * are printed and sent via TCP.
 *
 * LCD line 1: Date and time in "YYYY-MM-DD HH:MM" format.
 * LCD line 2: Alternates between "T:xx.xC H:xx.x%" and "P:xxxxhPa".
 *
 * Error handling:
 * - If time cannot be read, logs and displays an error.
 * - If sensor values are out of range, logs and displays an error.
 *
 * Visual feedback:
 * - Sets RGB color to green for valid temperature/humidity display.
 * - Turns off RGB color for pressure display.
 *
 * The display alternates every call, cycling through options.
 */
void ProgramMain::display_measurement() {
    static uint8_t option = 0;
    bool time_ok = false;
    uint16_t time[7];
    if (CLOCK == 1) {
        time_ok = pcf8563t_read_time(I2C_PORT, time);
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
 * @brief Sends sensor data along with the current time to a remote server.
 *
 * This function performs the following steps:
 * 1. Attempts to read the current time from the configured clock (PCF8563 or RTC).
 *    - If the time cannot be read, logs an error and aborts.
 * 2. Formats the read time into a string suitable for transmission.
 * 3. Measures temperature, humidity, and pressure using the BME280 sensor.
 *    - If sensor values are out of expected range, logs an error and aborts.
 * 4. Requests an authentication token from the server.
 *    - If token retrieval fails or the token is invalid, logs an error and aborts.
 * 5. Sends the time and sensor data to the server via a POST request.
 *    - If data transmission fails, logs an error.
 *
 * Error conditions at each step are logged using the TCP error logging mechanism.
 */
void ProgramMain::send_data() {
    bool time_ok = false;
    uint16_t time[7];
    if (CLOCK == 1) {
        time_ok = pcf8563t_read_time(I2C_PORT, time);
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
 * This function is intended to be called from an SNTP client when a new time value is received.
 * It converts the given seconds since the Unix epoch to a local time structure, updates the
 * global time synchronization flag, and prints the new system time. If both CLOCK and SET
 * are enabled, it also updates the external PCF8563T RTC via I2C.
 *
 * @param secs The number of seconds since the Unix epoch (time_t).
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
    }
}