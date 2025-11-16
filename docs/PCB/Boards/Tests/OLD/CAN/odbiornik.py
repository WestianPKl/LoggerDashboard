from machine import Pin, SPI
import utime
from can_mcp2515 import CAN_MCP2515

can_on = Pin(21, Pin.OUT)
can_int = Pin(20, Pin.IN, Pin.PULL_UP)

RX_ID = 0x100  # tu spodziewamy się 'Hello'
TX_ID = 0x101  # tu odsyłamy 'OK' / 'NOK'


def main():
    print("=== RX: CAN MCP2515 – Odbiornik ===")

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

    print("Czekam na ramki z ID=0x{:03X}...".format(RX_ID))

    while True:
        msg = can.recv_std()
        if msg is None:
            utime.sleep_ms(10)
            continue

        rid, rdata = msg
        print("\nRX: ID=0x{:03X}, data={}".format(rid, [hex(b) for b in rdata]))

        if rid != RX_ID:
            print("   (inna ramka, ignoruję)")
            continue

        try:
            txt = rdata.decode("ascii")
        except:
            txt = ""
        print("RX: tekst =", repr(txt))

        if txt == "Hello":
            reply = b"OK"
        else:
            reply = b"NOK"

        print("TX: odsyłam", reply.decode("ascii"), "jako", [hex(b) for b in reply])
        can.send_std(TX_ID, reply)


if __name__ == "__main__":
    main()
