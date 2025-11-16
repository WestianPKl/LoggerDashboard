import machine
import utime
from machine import Pin, PWM, ADC, I2C
from rtc_clock import RTC_Clock
import _thread

relay = 0
rtc = 0
if relay != 1:
    buzzer = PWM(Pin(15))
    buzzer.freq(1000)

if relay == 1:
    relay1 = Pin(14, Pin.OUT)
    relay2 = Pin(15, Pin.OUT)

if rtc == 1:
    adc_rtc = ADC(Pin(26))
    rtc_on = Pin(11, Pin.OUT)
    rtc_int = Pin(12, Pin.IN)
    rtc_clk = Pin(13, Pin.IN)

led_red = PWM(Pin(9))
led_green = PWM(Pin(10))
led_blue = PWM(Pin(8))

led_red.freq(1000)
led_green.freq(1000)
led_blue.freq(1000)

led_on_off_1 = PWM(Pin(2))
led_on_off_2 = PWM(Pin(3))
led_on_off_1.freq(1000)
led_on_off_2.freq(1000)

adc = ADC(Pin(27))

button1 = Pin(21, Pin.IN, Pin.PULL_UP)
button2 = Pin(22, Pin.IN, Pin.PULL_UP)

test_running = True


def read_voltage():
    """Odczyt napięcia z dzielnika 100k/200k"""
    adc_value = adc.read_u16()
    voltage_adc = (adc_value / 65535) * 3.3
    voltage_input = voltage_adc * 1.5
    return voltage_input, voltage_adc, adc_value

def test_buzzer():
    """Test buzzera - podstawowy + muzyka"""
    print("=== TEST BUZZER (GPIO15) ===")
    print("Test podstawowy:")
    buzzer.duty_u16(32768)
    print("Buzzer ON (1 sek)")
    utime.sleep(1)
    buzzer.duty_u16(0)
    print("Buzzer OFF")
    utime.sleep(0.5)
    print("Skala muzyczna C-dur:")
    notes = [(262, "C"), (294, "D"), (330, "E"), (349, "F"), 
             (392, "G"), (440, "A"), (494, "B"), (523, "C")]
    
    for freq, note in notes:
        print(f"Nuta {note} ({freq}Hz)")
        buzzer.freq(freq)
        buzzer.duty_u16(32768)
        utime.sleep(0.5)
        buzzer.duty_u16(0)
        utime.sleep(0.1)
    
    buzzer.duty_u16(0)
    print("Test buzzer zakończony\n")

def test_rgb_led():
    """Test LED RGB z podstawowymi kolorami"""
    print("=== TEST LED RGB (GPIO8=blue, GPIO9=red, GPIO10=green) ===")
    
    colors = [
        ("Czerwony", 65535, 0, 0),
        ("Zielony", 0, 65535, 0),
        ("Niebieski", 0, 0, 65535),
        ("Żółty", 65535, 65535, 0),
        ("Magenta", 65535, 0, 65535),
        ("Cyjan", 0, 65535, 65535),
        ("Biały", 65535, 65535, 65535)
    ]
    
    for color_name, r, g, b in colors:
        print(f"Kolor: {color_name}")
        led_red.duty_u16(r)
        led_green.duty_u16(g)
        led_blue.duty_u16(b)
        utime.sleep(1)
    led_red.duty_u16(0)
    led_green.duty_u16(0)
    led_blue.duty_u16(0)
    print("Test LED RGB zakończony\n")

def test_rgb_fade():
    """Test fade RGB"""
    print("=== TEST FADE RGB ===")
    print("Fade czerwony...")
    for duty in range(0, 65536, 2000):
        led_red.duty_u16(duty)
        utime.sleep_ms(30)
    for duty in range(65535, -1, -2000):
        led_red.duty_u16(duty)
        utime.sleep_ms(30)
    print("Fade zielony...")
    for duty in range(0, 65536, 2000):
        led_green.duty_u16(duty)
        utime.sleep_ms(30)
    for duty in range(65535, -1, -2000):
        led_green.duty_u16(duty)
        utime.sleep_ms(30)
    print("Fade niebieski...")
    for duty in range(0, 65536, 2000):
        led_blue.duty_u16(duty)
        utime.sleep_ms(30)
    for duty in range(65535, -1, -2000):
        led_blue.duty_u16(duty)
        utime.sleep_ms(30)
    
    led_red.duty_u16(0)
    led_green.duty_u16(0)
    led_blue.duty_u16(0)
    
    print("Test fade RGB zakończony\n")

def test_simple_leds():
    """Test prostych LED GPIO2 i GPIO3"""
    print("=== TEST LED GPIO2 i GPIO3 ===")
    print("Test ON/OFF:")
    print("LED GPIO2 ON")
    led_on_off_1.duty_u16(65535)
    utime.sleep(1)
    print("LED GPIO2 OFF")
    led_on_off_1.duty_u16(0)
    utime.sleep(0.5)
    print("LED GPIO3 ON")
    led_on_off_2.duty_u16(65535)
    utime.sleep(1)
    print("LED GPIO3 OFF")
    led_on_off_2.duty_u16(0)
    utime.sleep(0.5)
    print("Oba LED ON")
    led_on_off_1.duty_u16(65535)
    led_on_off_2.duty_u16(65535)
    utime.sleep(1)
    print("Oba LED OFF")
    led_on_off_1.duty_u16(0)
    led_on_off_2.duty_u16(0)
    utime.sleep(0.5)
    print("Test prostych LED zakończony\n")

def test_simple_leds_fade():
    """Test fade prostych LED"""
    print("=== TEST FADE LED GPIO2/3 ===")
    print("Fade LED GPIO2...")
    for duty in range(0, 65536, 2000):
        led_on_off_1.duty_u16(duty)
        utime.sleep_ms(20)
    for duty in range(65535, -1, -2000):
        led_on_off_1.duty_u16(duty)
        utime.sleep_ms(20)
    utime.sleep(0.3)
    print("Fade LED GPIO3...")
    for duty in range(0, 65536, 2000):
        led_on_off_2.duty_u16(duty)
        utime.sleep_ms(20)
    for duty in range(65535, -1, -2000):
        led_on_off_2.duty_u16(duty)
        utime.sleep_ms(20)
    utime.sleep(0.3)
    print("Synchroniczne fade...")
    for duty in range(0, 65536, 1000):
        led_on_off_1.duty_u16(duty)
        led_on_off_2.duty_u16(duty)
        utime.sleep_ms(15)
    for duty in range(65535, -1, -1000):
        led_on_off_1.duty_u16(duty)
        led_on_off_2.duty_u16(duty)
        utime.sleep_ms(15)
    led_on_off_1.duty_u16(0)
    led_on_off_2.duty_u16(0)
    print("Test fade prostych LED zakończony\n")

def test_adc():
    """Test odczytu ADC - dzielnik 100k/200k, oczekiwane 5V"""
    print("=== TEST ADC (GPIO27) ===")
    print("Dzielnik napięciowy 100k/200k")
    print("Oczekiwane napięcie wejściowe: ~5V")
    print()
    
    measurements = []
    for i in range(5):
        voltage_input, voltage_adc, adc_raw = read_voltage()
        print(f"Pomiar {i+1}: ADC={adc_raw:5d}, Vadc={voltage_adc:.3f}V, Vin={voltage_input:.3f}V")
        measurements.append(voltage_input)
        utime.sleep(0.5)
    
    avg_voltage = sum(measurements) / len(measurements)
    print(f"\nŚrednie napięcie wejściowe: {avg_voltage:.3f}V")
    
    if 4.5 <= avg_voltage <= 5.5:
        print("✓ Napięcie w normie (4.5V - 5.5V)")
    else:
        print("⚠ Napięcie poza normą")
    
    print("Test ADC zakończony\n")
    
def test_relay1():
    """Test załączenia przekaźnika 1"""
    print("=== TEST PRZEKAŹNIK 1 (GPIO14) ===")
    print("Oczekiwane załączenie przekaźnika 1")
    print()
    relay1.value(1)
    utime.sleep(2)
    relay1.value(0)
    utime.sleep(2)
    
def test_relay2():
    """Test załączenia przekaźnika 2"""
    print("=== TEST PRZEKAŹNIK 2 (GPIO15) ===")
    print("Oczekiwane załączenie przekaźnika 2")
    print()
    relay2.value(1)
    utime.sleep(2)
    relay2.value(0)
    utime.sleep(2)
    
def test_rtc():
    """Test zegara RTC"""
    print("=== TEST RTC PCF8563 ===")
    print("• GPIO11: Włącznik zasilania RTC")
    print("• GPIO26 (ADC2): Pomiar napięcia baterii")
    print("• GPIO12: Przerwanie RTC")
    print("• GPIO13: Wyjście zegarowe 1Hz")
    print("• I2C1: SDA=GPIO6, SCL=GPIO7")
    print()
    
    try:
        print("Włączenie układu zasilającego RTC...")
        rtc_on.value(1)
        utime.sleep(0.1)
        
        i2c = I2C(1, scl=Pin(7), sda=Pin(6), freq=100000)
        clock = RTC_Clock(i2c)
        
        print("Test komunikacji I2C z PCF8563...")
        devices = i2c.scan()
        if 0x51 in devices:
            print("✓ PCF8563 znaleziony na adresie 0x51")
        else:
            print("⚠ PCF8563 nie odpowiada!")
            print(f"Znalezione urządzenia I2C: {[hex(addr) for addr in devices]}")
        
        print("Ustawianie aktualnego czasu...")
        current_time = (2025, 12, 22, 3, 22, 33, 44)
        clock.set_time(current_time)
        
        print("Odczyt ustawionego czasu...")
        read_time = clock.read_time()
        formatted_time = "{:04d}-{:02d}-{:02d} {:02d}:{:02d}:{:02d}".format(
            read_time[0], read_time[1], read_time[2], 
            read_time[3], read_time[4], read_time[5]
        )
        print(f"Czas z RTC: {formatted_time}")
        
        print("Pomiar napięcia baterii...")
        batt_raw = adc_rtc.read_u16()
        conversion_factor = 3.3 / 65535
        gain = (100000 + 100000) / 100000
        batt_v = batt_raw * conversion_factor * gain
        print(f"ADC baterii: {batt_raw}, Napięcie: {batt_v:.3f}V")
        
        if batt_v > 2.5:
            print("✓ Napięcie baterii OK")
        else:
            print("⚠ Napięcie baterii niskie")

        print("Test sygnałów RTC (5 sekund)...")
        for i in range(25):
            int_state = rtc_int.value()
            clk_state = rtc_clk.value()
            print(f"INT: {int_state}, CLK: {clk_state}", end="\r")
            utime.sleep_ms(200)
        print()
        
        print("✓ Test RTC zakończony")
        
    except Exception as e:
        print(f"⚠ Błąd podczas testu RTC: {e}")
    finally:
        rtc_on.value(0)
        print("Zasilanie RTC wyłączone")
    
    print()
    
def button_monitor():
    """Monitor przycisków"""
    global test_running
    
    last_button1_state = True
    last_button2_state = True
    
    while test_running:
        button1_state = button1.value()
        if last_button1_state and not button1_state:
            print(">>> PRZYCISK 1 (GPIO21) NACIŚNIĘTY! <<<")
        last_button1_state = button1_state
        button2_state = button2.value()
        if last_button2_state and not button2_state:
            print(">>> PRZYCISK 2 (GPIO22) NACIŚNIĘTY! <<<")
        last_button2_state = button2_state
        
        utime.sleep_ms(50)

def run_all_tests():
    """Uruchom wszystkie testy"""
    print("="*50)
    print(" RASPBERRY PI PICO - TEST PODSTAWOWYCH FUNKCJI")
    print("="*50)
    
    if relay != 1:
        test_buzzer()
    test_rgb_led()
    test_rgb_fade()
    test_simple_leds()
    test_simple_leds_fade()
    test_adc()
    if relay == 1:
        test_relay1()
        test_relay2()
    if rtc == 1:
        test_rtc()
    print("="*40)
    print(" WSZYSTKIE TESTY ZAKOŃCZONE")
    print("="*40)

def interactive_mode():
    """Tryb interaktywny - uproszczony"""
    global test_running
    
    print("\n" + "="*50)
    print(" TRYB TESTOWY - UPROSZCZONY")
    print("="*50)
    print("Dostępne opcje:")
    if relay != 1:
        print("1 - Test buzzer + muzyka")
    print("2 - Test LED RGB")
    print("3 - Test fade RGB")
    print("4 - Test LED GPIO2/3")
    print("5 - Test fade LED GPIO2/3")
    print("6 - Test ADC")
    print("7 - Uruchom wszystkie testy")
    if relay == 1:
        print("8 - Test Przekaźnik 1")
        print("9 - Test Przekaźnik 2")
    if rtc == 1:
        print("10 - Test RTC")
    print("q - Zakończ")
    print("\nPrzyciski GPIO21/22 monitorowane w tle")
    print("="*50)
    _thread.start_new_thread(button_monitor, ())
    
    while True:
        try:
            command = input("\nWybierz opcję (1-7) lub 'q': ").strip()
            
            if command == 'q':
                test_running = False
                print("Zakończenie programu...")
                break
            elif command == '1' and relay != 1:
                test_buzzer()
            elif command == '2':
                test_rgb_led()
            elif command == '3':
                test_rgb_fade()
            elif command == '4':
                test_simple_leds()
            elif command == '5':
                test_simple_leds_fade()
            elif command == '6':
                test_adc()
            elif command == '7':
                run_all_tests()
            elif command == '8' and relay == 1:
                test_relay1()
            elif command == '9' and relay == 1:
                test_relay2()
            elif command == '10' and rtc == 1:
                test_rtc()
            else:
                print("Nieprawidłowa opcja!")
                
        except KeyboardInterrupt:
            test_running = False
            print("\nPrzerwano przez użytkownika")
            break
        except Exception as e:
            print(f"Błąd: {e}")

def main():
    """Główna funkcja programu - uproszczona"""
    print("Raspberry Pi Pico - Test płytki prototypowej")
    print("Konfiguracja:")
    if relay != 1:
        print("• GPIO15: Buzzer PWM")
    print("• GPIO8: LED niebieski, GPIO9: LED czerwony, GPIO10: LED zielony")
    print("• GPIO2, GPIO3: LED ON/OFF z PWM")
    print("• GPIO27 (ADC1): Pomiar napięcia 5V (dzielnik 100k/200k)")
    print("• GPIO21, GPIO22: Przyciski")
    if relay == 1:
        print("• GPIO14: Przekaźnik 1")
        print("• GPIO15: Przekaźnik 2")
    
    try:
        led_red.duty_u16(0)
        led_green.duty_u16(0)
        led_blue.duty_u16(0)
        led_on_off_1.duty_u16(0)
        led_on_off_2.duty_u16(0)
        if relay != 1:
            buzzer.duty_u16(0)
        if relay == 1:
            relay1.value(0)
            relay2.value(0)
        if rtc == 1:
            rtc_on.value(0)
        interactive_mode()
        
    except Exception as e:
        print(f"Błąd główny: {e}")
    finally:
        test_running = False
        led_red.duty_u16(0)
        led_green.duty_u16(0)
        led_blue.duty_u16(0)
        led_on_off_1.duty_u16(0)
        led_on_off_2.duty_u16(0)
        if relay != 1:
            buzzer.duty_u16(0)
        if relay == 1:
            relay1.value(0)
            relay2.value(0)
        if rtc == 1:
            rtc_on.value(0)
        print("Program zakończony - wszystkie piny wyłączone")

if __name__ == "__main__":
    main()