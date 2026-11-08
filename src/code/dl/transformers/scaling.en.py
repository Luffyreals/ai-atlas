# Why divide by sqrt(d_k): the dot-product variance grows with d_k
import numpy as np

rng = np.random.default_rng(0)
L = 10  # each query scores 10 keys

def softmax(s):
    e = np.exp(s - s.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

for d_k in [4, 64, 512]:
    # 2000 queries, each against L keys; entries ~ N(0, 1)
    q = rng.normal(size=(2000, 1, d_k))
    k = rng.normal(size=(2000, L, d_k))
    s = (q * k).sum(axis=-1)  # dot product q.k, shape (2000, L)
    raw = softmax(s).max(axis=-1).mean()  # mean max weight, unscaled
    scaled = softmax(s / np.sqrt(d_k)).max(axis=-1).mean()
    print(f"d_k={d_k:3d}  var(q.k)={s.var():7.1f}  "
          f"max weight: raw {raw:.2f}, scaled {scaled:.2f}")
