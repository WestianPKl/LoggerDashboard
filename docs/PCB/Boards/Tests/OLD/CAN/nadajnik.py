from machine import Pin, SPI
import utime
from can_mcp2515 import CAN_MCP2515

can_on = Pin(21, Pin.OUT)
can_int = Pin(20, Pin.IN, Pin.PULL_UP)  # na razie nie używamy, tylko polling

TX_ID = 0x100  # ID wysyłane do drugiego Pico
RX_ID = 0x101  # ID odpowiedzi od drugiego Pico


def main():
    print("=== TX: CAN MCP2515 – Nadajnik ===")

    can_on.value(1)
    utime.sleep(0.5)

    spi = SPI(
        0,
        baudrate=1_000_000,
        polarity=0,
        phase=0,
        sck=Pin(18),
        mosi=Pin(19),
        miso=Pin(16),
    )
    cs_pin = Pin(17, Pin.OUT, value=1)

    can = CAN_MCP2515(spi, cs_pin, can_int)
    can.set_mode(0x00)  # MODE_NORMAL

    msg = b"Hello"
    print("Będę wysyłał 'Hello' jako:", [hex(b) for b in msg])

    while True:
        print("\nTX: wysyłam ramkę ID=0x{:03X}".format(TX_ID))
        can.send_std(TX_ID, msg)

        reply = None
        t0 = utime.ticks_ms()
        while utime.ticks_diff(utime.ticks_ms(), t0) < 1000:
            rx = can.recv_std()
            if rx is not None:
                rid, rdata = rx
                print(
                    "RX: przyszło ID=0x{:03X}, data={}".format(
                        rid, [hex(b) for b in rdata]
                    )
                )
                if rid == RX_ID:
                    reply = rdata
                    break
            utime.sleep_ms(10)

        if reply is None:
            print("★ Brak odpowiedzi (timeout 1 s)")
        else:
            try:
                txt = reply.decode("ascii")
            except:
                txt = "<nie-ASCII>"
            print(
                "★ Odpowiedź z RX_ID=0x{:03X}: {} (tekst='{}')".format(
                    RX_ID, [hex(b) for b in reply], txt
                )
            )

        utime.sleep(1)


if __name__ == "__main__":
    main()
