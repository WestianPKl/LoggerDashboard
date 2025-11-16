liczba = 0x1234

print("| 0x0010: ", hex(liczba | 0x0010))
print("& 0x7FFF:", hex(liczba & 0x7FFF))
print(">> 8 & 0xFF:", hex((liczba >> 8) & 0xFF))
print("& 0xFF:", hex(liczba & 0xFF))
print("~ & 0xFFFF:", hex((~liczba) & 0xFFFF))
print("^ 0xFFFF:", hex(0xFFFF ^ liczba))

liczbaBin = 0b11111111

print(" >> 2: ", bin(liczbaBin >> 2))
print(" << 2: ", bin((liczbaBin << 2)))
print(" | 0b00000011: ", bin(liczbaBin | 0b00000011))
print(" & 00001111: ", bin(liczbaBin & 0b00001111))
print(" ^ 0b10101010: ", bin(liczbaBin ^ 0b10101010))
print(" ~ : ", bin((~liczbaBin) & 0xFF))


# liczba = 4660


# def fmt(v):
#     return f"{v:>5d}  bin={v:08b}  hex=0x{v:04X}"


# print("Input   :", fmt(liczba))

# # Shifts
# print(">> 2    :", fmt(liczba >> 2))
# print("<< 2    :", fmt((liczba << 2) & 0xFF))

# # OR
# print("| 0b11  :", fmt(liczba | 0b00000011))
# print("| 0x03:", fmt(liczba | 0x03))

# # AND
# print("& 0b11111100:", fmt(liczba & 0b11111100))
# print("& 0xFF    :", fmt(liczba & 0xFF))

# # XOR
# print("^ 0b00001111:", fmt(liczba ^ 0b00001111))
# print("^ 0x0F    :", fmt(liczba ^ 0x0F))

# # NOT
# print("~        :", fmt(~liczba & 0xFFFF))
# print("~ 0xFFFF :", fmt(0xFFFF ^ liczba))
# print("~ 0xFFFF :", fmt(0xFFFF - liczba))
# print("~ 0xFFFF :", fmt(0x10000 - liczba))
# print("~ 0xFFFF :", fmt((-liczba) & 0xFFFF))
# print("~ 0xFFFF :", fmt((-1 - liczba) & 0xFFFF))
# print("~ 0xFFFF :", fmt((~liczba) & 0xFFFF))
# print("~ 0xFFFF :", fmt(0xFFFF + 1 - liczba))
# print("~ 0xFFFF :", fmt(0x10000 + ~liczba))
