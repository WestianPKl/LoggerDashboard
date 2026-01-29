#include "eeprom_m24c32.h"
#include "pico/stdlib.h"

static void wait_ready(i2c_inst_t *i2c, uint8_t addr) {
    uint8_t dummy;
    while (i2c_read_blocking(i2c, addr, &dummy, 1, false) < 0) {
        sleep_ms(1);
    }
}

uint8_t eeprom_read(i2c_inst_t *i2c, uint8_t addr, uint16_t mem, uint8_t *buf, size_t len) {
    if (!len || mem >= EEPROM_TOTAL_SIZE) return 0;
    if (mem + len > EEPROM_TOTAL_SIZE) len = EEPROM_TOTAL_SIZE - mem;

    uint8_t cmd[2] = { (uint8_t)(mem >> 8), (uint8_t)mem };
    wait_ready(i2c, addr);
    if (i2c_write_blocking(i2c, addr, cmd, 2, true) < 0) return 0;
    if (i2c_read_blocking(i2c, addr, buf, len, false) < 0) return 0;
    return 1;
}

uint8_t eeprom_write(i2c_inst_t *i2c, uint8_t addr, uint16_t mem, const uint8_t *buf, size_t len) {
    if (!len || !buf || mem >= EEPROM_TOTAL_SIZE) return 0;
    if (mem + len > EEPROM_TOTAL_SIZE) len = EEPROM_TOTAL_SIZE - mem;

    size_t done = 0;
    while (done < len) {
        uint16_t cur = mem + done;
        uint8_t space = EEPROM_PAGE_SIZE - (cur % EEPROM_PAGE_SIZE);
        uint8_t chunk = (len - done < space) ? (uint8_t)(len - done) : space;

        uint8_t tmp[EEPROM_PAGE_SIZE + 2];
        tmp[0] = (uint8_t)(cur >> 8);
        tmp[1] = (uint8_t)cur;
        for (uint8_t i = 0; i < chunk; i++) tmp[2 + i] = buf[done + i];

        wait_ready(i2c, addr);
        if (i2c_write_blocking(i2c, addr, tmp, 2 + chunk, false) < 0) return 0;
        done += chunk;
    }
    return 1;
}

uint8_t eeprom_erase(i2c_inst_t *i2c, uint8_t addr) {
    uint8_t blank[EEPROM_PAGE_SIZE];
    for (uint8_t i = 0; i < EEPROM_PAGE_SIZE; i++) blank[i] = 0xFF;

    for (uint16_t m = 0; m < EEPROM_TOTAL_SIZE; m += EEPROM_PAGE_SIZE) {
        if (!eeprom_write(i2c, addr, m, blank, EEPROM_PAGE_SIZE)) return 0;
    }
    return 1;
}