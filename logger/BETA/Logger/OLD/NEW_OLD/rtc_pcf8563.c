#include "rtc_pcf8563.h"

#define REG_SEC 0x02

static uint8_t bcd2bin(uint8_t b) { return (b & 0x0F) + 10 * (b >> 4); }
static uint8_t bin2bcd(uint8_t v) { return ((v / 10) << 4) | (v % 10); }

uint8_t rtc_get(i2c_inst_t *i2c, uint8_t addr, rtc_time_t *t) {
    uint8_t reg = REG_SEC, r[7];
    if (i2c_write_blocking(i2c, addr, &reg, 1, true) < 0) return 0;
    if (i2c_read_blocking(i2c, addr, r, 7, false) < 0) return 0;

    t->sec   = bcd2bin(r[0] & 0x7F);
    t->min   = bcd2bin(r[1] & 0x7F);
    t->hour  = bcd2bin(r[2] & 0x3F);
    t->day   = bcd2bin(r[3] & 0x3F);
    t->month = bcd2bin(r[5] & 0x1F);
    t->year  = 2000 + bcd2bin(r[6]);
    return !(r[0] & 0x80);
}

uint8_t rtc_set(i2c_inst_t *i2c, uint8_t addr, const rtc_time_t *t) {
    uint8_t buf[8];
    buf[0] = REG_SEC;
    buf[1] = bin2bcd(t->sec)  & 0x7F;
    buf[2] = bin2bcd(t->min)  & 0x7F;
    buf[3] = bin2bcd(t->hour) & 0x3F;
    buf[4] = bin2bcd(t->day)  & 0x3F;
    buf[5] = 0;
    buf[6] = bin2bcd(t->month) & 0x1F;
    buf[7] = bin2bcd((uint8_t)(t->year - 2000));
    return i2c_write_blocking(i2c, addr, buf, 8, false) >= 0;
}