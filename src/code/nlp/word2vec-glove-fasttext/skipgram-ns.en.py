# Skip-gram with negative sampling (SGNS) in NumPy on a small corpus
import numpy as np

rng = np.random.default_rng(0)
# Three word groups, each with its own context templates
groups = {
    "con {} chạy ngoài sân|nhà tôi nuôi một con {}|con {} đang ngủ": # data:vi
        ["mèo", "chó", "gà", "vịt"],  # data: vi
    "tôi ăn một bát {} nóng|bát {} này rất ngon|mẹ nấu {} buổi sáng": # data:vi
        ["phở", "bún", "cháo", "cơm"],  # data: vi
    "anh uống một ly {} lạnh|ly {} này hơi ngọt|rót {} ra ly":  # data: vi
        ["trà", "sữa", "bia", "nước"],  # data: vi
}
corpus = []
for tpl, words in groups.items():
    for _ in range(60):
        s = rng.choice(tpl.split("|")).format(rng.choice(words))
        corpus.append(s.split())
vocab = sorted({w for s in corpus for w in s})
idx = {w: i for i, w in enumerate(vocab)}
V, d, k, win = len(vocab), 10, 3, 2

# (target, context) pairs within a ±win window
pairs = np.array([(idx[s[i]], idx[s[j]]) for s in corpus
                  for i in range(len(s))
                  for j in range(max(0, i - win), min(len(s), i + win + 1))
                  if j != i])
count = np.bincount(pairs[:, 1], minlength=V)
p_neg = count ** 0.75 / (count ** 0.75).sum()  # unigram^0.75

W = rng.normal(0, 0.1, (V, d))  # target word vectors
C = rng.normal(0, 0.1, (V, d))  # context word vectors
sig = lambda z: 1 / (1 + np.exp(-z))
eta, B = 0.03, 64  # learning rate, batch size
for epoch in range(13):
    order, total = rng.permutation(len(pairs)), 0.0
    for b0 in range(0, len(order), B):
        w, c = pairs[order[b0:b0 + B]].T                # w, c_pos indices
        n = rng.choice(V, size=(len(w), k), p=p_neg)    # k negatives/pair
        sp = sig((W[w] * C[c]).sum(1))                  # σ(c_pos·w)
        sn = sig((W[w][:, None] * C[n]).sum(2))         # σ(c_neg·w)
        total -= np.log(sp).sum() + np.log(1 - sn).sum()
        # The three gradients from the lesson, then subtract eta * grad
        gw = (sp - 1)[:, None] * C[c] + (sn[..., None] * C[n]).sum(1)
        np.add.at(C, c, -eta * (sp - 1)[:, None] * W[w])
        np.add.at(C, n, -eta * sn[..., None] * W[w][:, None])
        np.add.at(W, w, -eta * gw)
    if epoch % 3 == 0:
        print(f"epoch {epoch:2d}  loss {total / len(pairs):.3f}")

E = W / np.linalg.norm(W, axis=1, keepdims=True)  # normalize for cosine
print(f"cos(mèo, phở) = {E[idx['mèo']] @ E[idx['phở']]:.2f}")  # data: vi
for q in ["mèo", "phở", "trà"]:  # data: vi
    sims = E @ E[idx[q]]
    top = [i for i in np.argsort(-sims) if i != idx[q]][:3]
    print(q, "->", ", ".join(f"{vocab[i]} {sims[i]:.2f}" for i in top))
