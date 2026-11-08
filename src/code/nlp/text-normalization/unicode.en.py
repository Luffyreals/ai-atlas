# Two identical-looking strings: NFC, NFD, and Vietnamese tone placement
import re
import unicodedata as ud

a = "H\u00f2a"    # precomposed o-grave: one code point
b = "Ho\u0300a"   # "o" plus combining grave accent: two code points
print(a, b, a == b)
print(len(a), len(b))
for s in (a, b):
    print([f"U+{ord(ch):04X}" for ch in s])
print(ud.name("\u0300"))

# Normalizing to the same form makes the two strings equal
print(ud.normalize("NFC", b) == a, ud.normalize("NFD", a) == b)

# Both in NFC, but the tone sits on a different vowel: still different strings
c = "Ho\u00e0"
print(a, c, a == c)

# Five combining tone marks: grave, acute, tilde, hook above, dot below
TONE = "\u0300\u0301\u0303\u0309\u0323"
# Subset: word-final oa, oe, uy rhymes.
# Move the tone mark from the first vowel to the second vowel
RULES = [
    re.compile(rf"([oO])([{TONE}])([aAeE])\b"),
    re.compile(rf"([uU])([{TONE}])([yY])\b"),
]


def tone_on_main_vowel(text):
    s = ud.normalize("NFD", text)  # separate tone marks from base letters
    for rule in RULES:
        s = rule.sub(r"\1\3\2", s)  # swap tone mark and following vowel
    return ud.normalize("NFC", s)  # recompose into precomposed characters


text = "Hòa thuận, khỏe mạnh, thủy thủ, HÓA ĐƠN, mùa hoàng hôn"  # data: vi
print(tone_on_main_vowel(text))
print(tone_on_main_vowel(a) == tone_on_main_vowel(c))
