# Tóm tắt trích xuất bằng TF-IDF, rồi chấm bằng ROUGE-1, ROUGE-2, ROUGE-L
import math
import re
from collections import Counter

text = (
    "Sáng 3/11, Đà Nẵng đưa vào hoạt động tuyến xe buýt điện đầu tiên, "
    "nối sân bay với biển Mỹ Khê. Tuyến dài 18 km, có 12 xe, chạy từ 5 giờ "
    "sáng đến 10 giờ tối. Giá vé là 8 nghìn đồng một lượt, học sinh được "
    "giảm một nửa. Trong tháng đầu, thành phố miễn phí vé xe buýt điện cho "
    "mọi hành khách. Mỗi xe chạy được 250 km sau một lần sạc. Nhiều người "
    "dân khen xe chạy êm và không có khói. Thành phố dự kiến mở thêm ba "
    "tuyến xe buýt điện vào năm sau."
)
ref = ("Đà Nẵng mở tuyến xe buýt điện đầu tiên nối sân bay với biển Mỹ Khê. "
       "Tháng đầu miễn phí vé, năm sau mở thêm ba tuyến.")

def words(s):  # chữ thường, mỗi âm tiết là một từ
    return re.findall(r"\w+", s.lower())

sents = re.split(r"(?<=\.)\s+", text)
toks = [words(s) for s in sents]
N = len(sents)
df = Counter(w for t in toks for w in set(t))  # số câu chứa mỗi từ
idf = {w: math.log((1 + N) / (1 + df[w])) + 1 for w in df}
vecs = [{w: c * idf[w] for w, c in Counter(t).items()} for t in toks]
center = sum(map(Counter, vecs), Counter())  # vectơ của cả văn bản

def cos(a, b):
    dot = sum(x * b.get(w, 0) for w, x in a.items())
    return dot / (math.hypot(*a.values()) * math.hypot(*b.values()))

score = [cos(v, center) for v in vecs]
print("scores:", " ".join(f"{s:.3f}" for s in score))
top = sorted(sorted(range(N), key=lambda i: -score[i])[:2])  # giữ thứ tự
print("picked sentences:", [i + 1 for i in top])

def ngrams(t, n):
    return Counter(tuple(t[i:i + n]) for i in range(len(t) - n + 1))

def f1(hit, n_cand, n_ref):  # precision, recall rồi trung bình điều hòa
    p, r = hit / n_cand, hit / n_ref
    return 0.0 if hit == 0 else 2 * p * r / (p + r)

def rouge_n(c, r, n):  # & lấy số lần trùng nhỏ hơn của hai bên
    hit = sum((ngrams(c, n) & ngrams(r, n)).values())
    return f1(hit, len(c) - n + 1, len(r) - n + 1)

def rouge_l(c, r):  # độ dài LCS bằng quy hoạch động
    L = [[0] * (len(r) + 1) for _ in range(len(c) + 1)]
    for i, a in enumerate(c):
        for j, b in enumerate(r):
            L[i + 1][j + 1] = (L[i][j] + 1 if a == b
                               else max(L[i][j + 1], L[i + 1][j]))
    return f1(L[-1][-1], len(c), len(r))

for name, idx in [("tf-idf", top), ("lead-2", [0, 1])]:
    c, r = words(" ".join(sents[i] for i in idx)), words(ref)
    print(f"{name}: R1 {rouge_n(c, r, 1):.3f}  R2 {rouge_n(c, r, 2):.3f}"
          f"  RL {rouge_l(c, r):.3f}  ({len(c)} words)")
