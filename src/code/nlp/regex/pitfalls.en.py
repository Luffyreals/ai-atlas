# \w on accented letters, greedy vs lazy, and a tiny regex tokenizer
import re
import unicodedata

s = "Phở Hà Nội ngon quá!"  # data: vi
print(re.findall(r"[a-zA-Z]+", s))           # ASCII letters only
print(re.findall(r"\w+", s))                 # Python 3 \w is Unicode-aware
print(re.findall(r"\w+", s, flags=re.ASCII))  # ASCII flag: back to a-z

# Same word "hoa" with grave accent, decomposed into NFD (data: vi)
nfd = unicodedata.normalize("NFD", "hòa")  # data: vi
print(len("hòa"), len(nfd), len(re.findall(r"\w+", nfd)))  # data: vi

# Greedy vs lazy on a short HTML snippet
html = "<b>Phở</b> và <i>bún chả</i>"  # data: vi
print(re.findall(r"<.*>", html))     # .* swallows up to the last >
print(re.findall(r"<.*?>", html))    # .*? stops at the nearest >
print(re.sub(r"<[^>]+>", "", html))  # strip tags: [^>] never crosses >

# Simple tokenizer: a run of word characters, or a single punctuation mark
line = "Giá 12.000đ, rẻ quá!"  # data: vi
print(re.findall(r"\w+|[^\w\s]", line))
# Put the number branch first to keep "12.000" intact
NUM = r"\d+(?:[.,]\d+)*"
print(re.findall(NUM + r"|\w+|[^\w\s]", line))
