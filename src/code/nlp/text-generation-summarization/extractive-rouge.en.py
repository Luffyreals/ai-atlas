# Extractive summarization with TF-IDF, scored by ROUGE-1, ROUGE-2, ROUGE-L
import math
import re
from collections import Counter

text = (
    "Sáng 3/11, Đà Nẵng đưa vào hoạt động tuyến xe buýt điện "  # data: vi
    "đầu tiên, nối sân bay với biển Mỹ Khê. Tuyến dài 18 km, "  # data: vi
    "có 12 xe, chạy từ 5 giờ sáng đến 10 giờ tối. Giá vé là "  # data: vi
    "8 nghìn đồng một lượt, học sinh được giảm một nửa. Trong "  # data: vi
    "tháng đầu, thành phố miễn phí vé xe buýt điện cho mọi "  # data: vi
    "hành khách. Mỗi xe chạy được 250 km sau một lần sạc. "  # data: vi
    "Nhiều người dân khen xe chạy êm và không có khói. Thành "  # data: vi
    "phố dự kiến mở thêm ba tuyến xe buýt điện vào năm sau."  # data: vi
)
ref = ("Đà Nẵng mở tuyến xe buýt điện đầu tiên nối sân bay "  # data: vi
       "với biển Mỹ Khê. Tháng đầu miễn phí vé, năm sau mở "  # data: vi
       "thêm ba tuyến.")  # data: vi

def words(s):  # lowercase; each syllable is one word
    return re.findall(r"\w+", s.lower())

sents = re.split(r"(?<=\.)\s+", text)
toks = [words(s) for s in sents]
N = len(sents)
df = Counter(w for t in toks for w in set(t))  # sentences containing w
idf = {w: math.log((1 + N) / (1 + df[w])) + 1 for w in df}
vecs = [{w: c * idf[w] for w, c in Counter(t).items()} for t in toks]
center = sum(map(Counter, vecs), Counter())  # whole-document vector

def cos(a, b):
    dot = sum(x * b.get(w, 0) for w, x in a.items())
    return dot / (math.hypot(*a.values()) * math.hypot(*b.values()))

score = [cos(v, center) for v in vecs]
print("scores:", " ".join(f"{s:.3f}" for s in score))
top = sorted(sorted(range(N), key=lambda i: -score[i])[:2])  # keep order
print("picked sentences:", [i + 1 for i in top])

def ngrams(t, n):
    return Counter(tuple(t[i:i + n]) for i in range(len(t) - n + 1))

def f1(hit, n_cand, n_ref):  # precision, recall, then harmonic mean
    p, r = hit / n_cand, hit / n_ref
    return 0.0 if hit == 0 else 2 * p * r / (p + r)

def rouge_n(c, r, n):  # & takes the minimum count on both sides
    hit = sum((ngrams(c, n) & ngrams(r, n)).values())
    return f1(hit, len(c) - n + 1, len(r) - n + 1)

def rouge_l(c, r):  # LCS length via dynamic programming
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
