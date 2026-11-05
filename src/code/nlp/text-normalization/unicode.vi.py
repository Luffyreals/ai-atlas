# Hai chữ "Hòa" trông giống hệt nhau: NFC, NFD và vị trí dấu thanh
import re
import unicodedata as ud

a = "H\u00f2a"    # "ò" dựng sẵn: một code point
b = "Ho\u0300a"   # "o" cộng dấu huyền tổ hợp: hai code point
print(a, b, a == b)
print(len(a), len(b))
for s in (a, b):
    print([f"U+{ord(ch):04X}" for ch in s])
print(ud.name("\u0300"))

# Đưa về cùng một dạng chuẩn thì hai chuỗi bằng nhau
print(ud.normalize("NFC", b) == a, ud.normalize("NFD", a) == b)

# Cùng dạng NFC nhưng dấu đặt ở chỗ khác: vẫn là hai chuỗi khác nhau
c = "Ho\u00e0"
print(a, c, a == c)

# Năm dấu thanh ở dạng tổ hợp: huyền, sắc, ngã, hỏi, nặng
TONE = "\u0300\u0301\u0303\u0309\u0323"
# Tập con: vần oa, oe, uy đứng cuối âm tiết (hòa, khỏe, thủy).
# Dời dấu từ nguyên âm đầu sang nguyên âm sau (kiểu "hoà")
RULES = [
    re.compile(rf"([oO])([{TONE}])([aAeE])\b"),
    re.compile(rf"([uU])([{TONE}])([yY])\b"),
]


def tone_on_main_vowel(text):
    s = ud.normalize("NFD", text)  # tách dấu ra khỏi chữ
    for rule in RULES:
        s = rule.sub(r"\1\3\2", s)  # đổi chỗ dấu và nguyên âm sau
    return ud.normalize("NFC", s)  # ghép lại thành chữ dựng sẵn


text = "Hòa thuận, khỏe mạnh, thủy thủ, HÓA ĐƠN, mùa hoàng hôn"
print(tone_on_main_vowel(text))
print(tone_on_main_vowel(a) == tone_on_main_vowel(c))
