# Pipeline chuẩn hóa văn bản: bật/tắt từng bước rồi xem trước và sau
import re
import unicodedata as ud

# Đổi True/False để bật hoặc tắt từng bước
ON = {"nfc": True, "lower": True, "slot": True,
      "punct": True, "space": True, "strip_tone": False}

URL = re.compile(r"https?://\S+|www\.\S+")
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
NUM = re.compile(r"\d+(?:[.,]\d+)*")


def slot(s):  # thay URL, email, số bằng token giữ chỗ
    s = URL.sub(" <url> ", s)
    s = EMAIL.sub(" <email> ", s)
    return NUM.sub(" <num> ", s)


def punct(s):  # bỏ dấu câu, giữ nguyên các token giữ chỗ
    return re.sub(r"(<\w+>)|[^\w\s]", lambda m: m.group(1) or " ", s)


def strip_tone(s):  # bỏ mọi dấu (mất thông tin!)
    s = ud.normalize("NFD", s).replace("đ", "d").replace("Đ", "D")
    s = "".join(ch for ch in s if ud.category(ch) != "Mn")
    return ud.normalize("NFC", s)


STEPS = [
    ("nfc", lambda s: ud.normalize("NFC", s)),
    ("lower", str.casefold),
    ("slot", slot),
    ("punct", punct),
    ("space", lambda s: " ".join(s.split())),
    ("strip_tone", strip_tone),
]

texts = [
    "Sp OK lắm!!!   10đ, xem tại https://example.vn/sp?id=123",
    "Giao hàng CHẬM quá :(  Gọi 0912.345.678 hoặc hotro@example.vn",
    "Shop của chị Ho\u0300a  KHÔNG tệ,\tgiá 1.250.000đ.",
]
for t in texts:
    print(f"{'input':<10} {len(t):>2} {t!r}")
    for name, fn in STEPS:
        if ON[name]:
            t = fn(t)
            print(f"{name:<10} {len(t):>2} {t!r}")
    print()
