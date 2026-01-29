#include "settings.h"
#include "eeprom_m24c32.h"
#include <string.h>

#define SETTINGS_EE_ADDR 0x0000
#define SETTINGS_MAGIC   0x4C475231u // 'LGR1'

static uint32_t crc32_simple(const void *p, size_t n) {
    const uint8_t *b = (const uint8_t*)p;
    uint32_t c = 0xA5A5A5A5u;
    for (size_t i=0; i<n; i++) c = (c << 5) ^ (c >> 27) ^ b[i];
    return c;
}

void settings_defaults(settings_t *s) {
    memset(s, 0, sizeof(*s));
    s->magic = SETTINGS_MAGIC;
    s->version = 1;
    s->sample_period_ms = 5000;
    strncpy(s->pub_topic, "devices/2/status", sizeof(s->pub_topic));
    strncpy(s->sub_topic, "devices/2/cmd", sizeof(s->sub_topic));
    s->crc = 0;
    s->crc = crc32_simple(s, sizeof(*s));
}

bool settings_load(i2c_inst_t *i2c, uint8_t eeprom_addr, settings_t *s) {
    if (!eeprom_m24c32_read(i2c, eeprom_addr, SETTINGS_EE_ADDR, (uint8_t*)s, sizeof(*s))) return false;
    if (s->magic != SETTINGS_MAGIC || s->version != 1) return false;

    uint32_t crc = s->crc;
    s->crc = 0;
    uint32_t want = crc32_simple(s, sizeof(*s));
    s->crc = crc;
    return crc == want;
}

bool settings_save(i2c_inst_t *i2c, uint8_t eeprom_addr, const settings_t *s_in) {
    settings_t s = *s_in;
    s.crc = 0;
    s.crc = crc32_simple(&s, sizeof(s));
    return eeprom_m24c32_write(i2c, eeprom_addr, SETTINGS_EE_ADDR, (const uint8_t*)&s, sizeof(s));
}