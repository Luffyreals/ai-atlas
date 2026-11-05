# Trích số điện thoại, email, ngày tháng từ một tin rao vặt, rồi che số
import re

text = (
    "Bán xe Wave 2019, giá 12 triệu. Gọi anh Nam 0912 345 678 "
    "hoặc chị Lan +84987654321. Email: nam.nguyen@gmail.com. "
    "Xem xe từ 05/11/2026 đến 15/11/2026. "
    "STK 1903456789123 không phải số điện thoại."
)

# Mỗi dòng một phần của mẫu, nối lại thành một chuỗi
PHONE = re.compile(
    r"(?<!\d)"                # ngay trước không phải chữ số
    r"(?:\+84|0)"             # mở đầu bằng +84 hoặc 0
    r"[35789]\d{2}"           # ba số đầu: đầu số di động
    r"[ .]?\d{3}[ .]?\d{3}"   # sáu số còn lại, có thể cách nhau
    r"(?!\d)"                 # ngay sau không phải chữ số
)
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
DATE = re.compile(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b")

print("phones:", PHONE.findall(text))
print("emails:", EMAIL.findall(text))
print("dates: ", DATE.findall(text))  # có nhóm: ra bộ (ngày, tháng, năm)

# Bỏ hai lookaround thì số tài khoản cũng bị coi là số điện thoại
loose = re.compile(r"(?:\+84|0)[35789]\d{2}[ .]?\d{3}[ .]?\d{3}")
print("no guard:", loose.findall(text))

# Che số điện thoại, đổi ngày sang dạng yyyy-mm-dd bằng nhóm \3-\2-\1
masked = PHONE.sub("<PHONE>", text)
masked = DATE.sub(r"\3-\2-\1", masked)
print(masked)
