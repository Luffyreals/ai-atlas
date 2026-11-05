# N-gram ký tự kiểu FastText và vectơ cho một từ chưa gặp
import numpy as np


def ngrams(word, nmin=3, nmax=6):
    w = "<" + word + ">"  # đánh dấu đầu và cuối từ
    return [w[i:i + n] for n in range(nmin, nmax + 1)
            for i in range(len(w) - n + 1)]


def fnv1a(s):  # băm FNV-1a 32 bit (FastText dùng một biến thể)
    h = 2166136261
    for b in s.encode("utf-8"):
        h = ((h ^ b) * 16777619) % 2**32
    return h


print(ngrams("nhà"))
print(len(ngrams("nhà_văn")), "n-grams for nhà_văn")

# Bảng vectơ n-gram: số NGẪU NHIÊN, chỉ để xem cơ chế ghép
BUCKET, d = 10_000, 300
Z = np.random.default_rng(0).normal(size=(BUCKET, d))


def vec(word):  # vectơ từ = tổng vectơ các n-gram của nó
    return sum(Z[fnv1a(g) % BUCKET] for g in ngrams(word))


def cos(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))


new = "nhà_văn"  # giả sử từ này không có trong dữ liệu huấn luyện
for w in ["nhà_thơ", "nhà_báo", "văn_học", "con_mèo"]:
    shared = len(set(ngrams(new)) & set(ngrams(w)))
    print(f"{w:8s} shared {shared:2d}  cos {cos(vec(new), vec(w)):.2f}")
