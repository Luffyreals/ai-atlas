# Sampling the next token: softmax with temperature, then top-k or top-p.
import numpy as np

# Context: "The weather today is very ___". Ten candidates, logits descending.
tokens = ["nice", "hot", "cold", "cool", "sunny",
          "humid", "clear", "windy", "wet", "dark"]
# logits: next-token
z = np.array([3.0, 2.6, 2.0, 1.5, 1.1, 0.6, 0.1, -0.4, -1.0, -1.6])


def softmax_t(z, T):
    a = z / T
    e = np.exp(a - a.max())  # subtract the max so exp does not overflow
    return e / e.sum()


def keep_and_renormalize(p, keep):
    q = np.zeros_like(p)
    q[keep] = p[keep]  # removed tokens get probability 0
    return q / q.sum()  # renormalise so the sum is 1


def top_k(p, k):
    order = np.argsort(p)[::-1]  # indices by decreasing probability
    return keep_and_renormalize(p, order[:k])


def top_p(p, threshold):
    order = np.argsort(p)[::-1]
    cum = np.cumsum(p[order])
    n = np.searchsorted(cum, threshold) + 1  # smallest set with sum >= p
    return keep_and_renormalize(p, order[:n])


for T in [0.5, 1.0, 1.5]:
    p = softmax_t(z, T)
    kept = np.count_nonzero(top_p(p, 0.9))
    print(f"T = {T}: top 3 = {np.round(p[:3], 3)}, top-p 0.9 keeps {kept}")

print("top-k 3, T = 1:", np.round(top_k(softmax_t(z, 1.0), 3)[:4], 3))
p = top_p(softmax_t(z, 1.0), 0.9)
rng = np.random.default_rng(0)
counts = np.bincount(rng.choice(10, size=1000, p=p), minlength=10)
for i, tok in enumerate(tokens):
    print(f"{tok:>6}: p = {p[i]:.3f}, drawn {counts[i]}")
