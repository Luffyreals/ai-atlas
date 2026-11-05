# \w với chữ có dấu, tham lam và lười, và một bộ tách từ nhỏ bằng regex
import re
import unicodedata

s = "Phở Hà Nội ngon quá!"
print(re.findall(r"[a-zA-Z]+", s))           # chỉ chữ không dấu
print(re.findall(r"\w+", s))                 # \w của Python 3 là Unicode
print(re.findall(r"\w+", s, flags=re.ASCII))  # cờ ASCII: quay về a-z

# Cùng chữ "hòa" nhưng dấu huyền tách thành ký tự riêng (dạng NFD)
nfd = unicodedata.normalize("NFD", "hòa")
print(len("hòa"), len(nfd), len(re.findall(r"\w+", nfd)))

# Tham lam và lười trên một đoạn HTML ngắn
html = "<b>Phở</b> và <i>bún chả</i>"
print(re.findall(r"<.*>", html))     # .* nuốt tới dấu > cuối cùng
print(re.findall(r"<.*?>", html))    # .*? dừng ở dấu > gần nhất
print(re.sub(r"<[^>]+>", "", html))  # bỏ thẻ: [^>] không vượt qua >

# Bộ tách từ đơn giản: một dãy chữ, hoặc một dấu câu
line = "Giá 12.000đ, rẻ quá!"
print(re.findall(r"\w+|[^\w\s]", line))
# Thêm nhánh số đứng trước để giữ nguyên "12.000"
NUM = r"\d+(?:[.,]\d+)*"
print(re.findall(NUM + r"|\w+|[^\w\s]", line))
