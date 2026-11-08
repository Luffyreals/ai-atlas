# L^2 attention cost, sliding window, and the multiplication-order trick
import numpy as np

# Count (i, j) pairs scored in causal attention, one head, one layer
w = 512                                  # sliding window size
print("     L    full pairs  window pairs  ratio     GB")
for L in [512, 2048, 8192, 32768, 131072]:
    full = L * (L + 1) // 2              # all j <= i
    k = min(L, w)                        # rows from k on have w cells
    win = k * (k + 1) // 2 + (L - k) * w
    gb = L * L * 2 / 1e9                 # full L x L matrix, 2 bytes/num
    print(f"{L:6d} {full:13d} {win:13d} {full / win:6.1f} {gb:7.3f}")


def phi(x):
    # elu(x) + 1: always positive, as in Katharopoulos et al. (2020)
    return np.where(x > 0, x + 1, np.exp(x))


# Linear attention (unmasked): replace softmax with phi(q).phi(k)
rng = np.random.default_rng(0)
L, d = 1000, 16
Q, K, V = (rng.normal(size=(L, d)) for _ in range(3))
A = phi(Q) @ phi(K).T                    # L x L matrix
out1 = (A @ V) / A.sum(axis=1, keepdims=True)
KV = phi(K).T @ V                        # only d x d, independent of L
z = phi(K).sum(axis=0)                   # d-dimensional vector
out2 = (phi(Q) @ KV) / (phi(Q) @ z)[:, None]
print("same output:", np.allclose(out1, out2))
print(f"multiplications: {2 * L * L * d:,} vs {2 * L * d * d:,}")
