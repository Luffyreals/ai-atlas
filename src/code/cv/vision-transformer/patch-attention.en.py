# Split an 8x8 digit into patches and compute self-attention in NumPy.
import numpy as np
from sklearn.datasets import load_digits

rng = np.random.default_rng(0)
digits = load_digits()
img = digits.images[0] / 16.0         # 8x8 image, values in [0, 1]
print("label:", digits.target[0], "image:", img.shape)

P, D = 4, 8                            # patch size, embedding dimension
H, W = img.shape
# Split into an (H/P) x (W/P) grid, read row by row, flatten each patch
patches = (img.reshape(H // P, P, W // P, P)
           .transpose(0, 2, 1, 3).reshape(-1, P * P))
N = patches.shape[0]
print("patches:", patches.shape, "N =", N)
print("patch 1 = top-right block:",
      np.array_equal(patches[1], img[:P, P:].ravel()))

E = rng.normal(0, 0.3, (P * P, D))     # shared projection for all patches
cls = rng.normal(0, 0.3, (1, D))       # learnable [CLS] token
pos = rng.normal(0, 0.3, (N + 1, D))   # learnable position embeddings
Z = np.vstack([cls, patches @ E]) + pos
print("tokens Z:", Z.shape)

# One attention head: query, key, value
Wq, Wk, Wv = (rng.normal(0, 0.5, (D, D)) for _ in range(3))
Q, K, V = Z @ Wq, Z @ Wk, Z @ Wv
S = Q @ K.T / np.sqrt(D)               # scores for all token pairs
S = S - S.max(axis=1, keepdims=True)   # subtract max for numerical stability
A = np.exp(S) / np.exp(S).sum(axis=1, keepdims=True)
out = A @ V

np.set_printoptions(precision=3, suppress=True)
print("attention A (row = query, col = key):")
print(A)
print("row sums:", A.sum(axis=1))
print("all weights > 0:", bool((A > 0).all()))
print("output:", out.shape)
# Number of attention score pairs grows quadratically with token count
for side, p in [(8, 4), (8, 2), (224, 16), (224, 8)]:
    n = (side // p) ** 2 + 1           # add 1 for [CLS]
    print(f"{side}x{side}, P={p}: {n} tokens, {n * n} pairs")
