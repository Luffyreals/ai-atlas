# Extract phone numbers, emails, and dates from a classified ad, then mask
import re

text = (
    "Bán xe Wave 2019, giá 12 triệu. Gọi anh Nam 0912 345 678 "  # data: vi
    "hoặc chị Lan +84987654321. Email: nam.nguyen@gmail.com. "  # data: vi
    "Xem xe từ 05/11/2026 đến 15/11/2026. "  # data: vi
    "STK 1903456789123 không phải số điện thoại."  # data: vi
)

# One part of the pattern per line, concatenated into a single string
PHONE = re.compile(
    r"(?<!\d)"                # not preceded by a digit
    r"(?:\+84|0)"             # starts with +84 or 0
    r"[35789]\d{2}"           # first three digits: mobile prefix
    r"[ .]?\d{3}[ .]?\d{3}"   # remaining six digits, optionally separated
    r"(?!\d)"                 # not followed by a digit
)
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
DATE = re.compile(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b")

print("phones:", PHONE.findall(text))
print("emails:", EMAIL.findall(text))
print("dates: ", DATE.findall(text))  # groups -> (day, month, year) tuples

# Without the two lookarounds, the bank account number also matches
loose = re.compile(r"(?:\+84|0)[35789]\d{2}[ .]?\d{3}[ .]?\d{3}")
print("no guard:", loose.findall(text))

# Mask phone numbers, reformat dates to yyyy-mm-dd via \3-\2-\1
masked = PHONE.sub("<PHONE>", text)
masked = DATE.sub(r"\3-\2-\1", masked)
print(masked)
