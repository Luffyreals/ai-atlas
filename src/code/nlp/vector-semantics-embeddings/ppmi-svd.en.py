# Window ±2 co-occurrence, PPMI, cosine, and truncated SVD on a small corpus
import numpy as np

np.set_printoptions(precision=2, suppress=True)
corpus = [
    "tôi ăn một bát phở nóng", "bát phở này rất ngon",  # data: vi
    "tôi ăn một bát bún nóng", "mẹ nấu bún rất ngon",  # data: vi
    "nhà tôi nuôi một con mèo", "con mèo nằm ngủ cả ngày",  # data: vi
    "nhà tôi nuôi một con chó", "con chó sủa cả đêm",  # data: vi
    "tôi đi xe_máy trên đường", "xe_máy chạy rất nhanh",  # data: vi
    "tôi lái ô_tô trên đường", "ô_tô chạy về quê",  # data: vi
]
sents = [line.split() for line in corpus]  # compound words joined by "_"
vocab = sorted({w for sent in sents for w in sent})
idx = {w: i for i, w in enumerate(vocab)}
s, d = 2, 3                          # ±s window, keep d dims after SVD
F = np.zeros((len(vocab), len(vocab)))
for sent in sents:
    for i, w in enumerate(sent):
        for j in range(max(0, i - s), min(len(sent), i + s + 1)):
            if j != i:
                F[idx[w], idx[sent[j]]] += 1
# PPMI = max(0, log2 P(w,c) / (P(w) P(c)))
N = F.sum()
pw = F.sum(axis=1, keepdims=True) / N
pc = F.sum(axis=0, keepdims=True) / N
with np.errstate(divide="ignore"):   # log2(0) = -inf, clipped to 0 by max
    ppmi = np.maximum(np.log2(F / N / (pw * pc)), 0)
# Truncated SVD: each word has d numbers instead of |V|
U, S, Vt = np.linalg.svd(ppmi)
emb = U[:, :d] * S[:d]

def cos(M, a, b):
    u, v = M[idx[a]], M[idx[b]]
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))

print(f"|V| = {len(vocab)}, nonzero = {(F > 0).mean():.0%}")
print("singular values:", S[:5])
for a, b in [("phở", "bún"), ("mèo", "chó"), ("xe_máy", "ô_tô"),  # data: vi
             ("phở", "mèo"), ("phở", "xe_máy"), ("chó", "ô_tô")]:  # data: vi
    print(f"{a:>6} {b:<6} ppmi {cos(ppmi, a, b):.2f}"
          f"  svd {cos(emb, a, b):.2f}")
for w in ["phở", "bún", "mèo", "chó", "xe_máy", "ô_tô"]:  # data: vi
    print(f"{w:>6}", emb[idx[w]])
