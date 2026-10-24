# Khử trùng lặp exact rồi gần trùng (MinHash + LSH) trên 5 câu tự viết
import hashlib
import re
import unicodedata
import numpy as np

docs = ["Hà Nội là thủ đô của Việt Nam, một thành phố hơn nghìn năm tuổi.",
        "Hà Nội là thủ đô của Việt Nam, một thành phố cổ hơn nghìn năm tuổi.",
        "Phở là món ăn nổi tiếng của Việt Nam.",
        "Mua ngay giá rẻ, bấm vào đây để nhận quà miễn phí!"]
# Câu 1: bản sao câu 0, nhưng viết hoa, dấu tách rời (NFD), thừa dấu cách
docs.insert(1, "  " + unicodedata.normalize("NFD", docs[0]).upper())
words = [re.findall(r"\w+", unicodedata.normalize("NFC", d).lower())
         for d in docs]  # chuẩn hóa NFC, chữ thường, bỏ dấu câu, tách từ

# 1) Exact: SHA-256 của văn bản đã chuẩn hóa; hash đã gặp thì bỏ
keys = [hashlib.sha256(" ".join(w).encode()).digest() for w in words]
keep = [i for i, k in enumerate(keys) if k not in keys[:i]]
print("raw equal:", docs[0] == docs[1], "| after exact:", keep)


def h(k, s):  # hàm băm thứ k: 60 bit đầu của SHA-1 (không dùng hash())
    return int(hashlib.sha1(f"{k}|{s}".encode()).hexdigest()[:15], 16)


# 2) MinHash: shingle là cặp từ liền nhau; chữ ký K số, mỗi băng r số
K, r = 64, 4
sh = {i: set(zip(words[i], words[i][1:])) for i in keep}
sig = {i: np.array([min(h(k, s) for s in sh[i]) for k in range(K)])
       for i in keep}
for x, y in [(x, y) for x in keep for y in keep if x < y]:
    J = len(sh[x] & sh[y]) / len(sh[x] | sh[y])
    same = sig[x] == sig[y]  # K giá trị đúng/sai
    cand = same.reshape(-1, r).all(axis=1).any()  # trùng trọn một băng
    print(f"{x}-{y}: J = {J:.2f}, MinHash = {same.mean():.2f}, cand = {cand}")
