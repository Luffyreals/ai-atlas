# Causal mask, sliding-window mask, and ALiBi bias on a short sequence
import numpy as np

np.set_printoptions(precision=3, suppress=True)
L, w = 6, 3                    # sequence length, window size
i = np.arange(L)[:, None]      # row: query position
j = np.arange(L)[None, :]      # column: key position
causal = j <= i                # look back only, including self
window = causal & (i - j < w)  # and at most w - 1 positions back
print("causal mask:")
print(causal.astype(int))
print(f"sliding window, w = {w}:")
print(window.astype(int))

# ALiBi slopes for n heads: geometric sequence, start and ratio 2^(-8/n)
n_heads = 8
slopes = 2.0 ** (-8 / n_heads * np.arange(1, n_heads + 1))
print("slopes:", slopes)

# Head 1 bias: -m * (i - j) on visible cells, -inf on masked cells
m = slopes[0]
bias = np.where(causal, m * (j - i), -np.inf)
print("ALiBi bias, head 1:")
print(bias)
print("last row, head 8:", slopes[-1] * (j[0] - (L - 1)))

# Add bias to attention scores, then row-wise softmax
rng = np.random.default_rng(0)
d = 4
Q, K = rng.normal(size=(L, d)), rng.normal(size=(L, d))
scores = Q @ K.T / np.sqrt(d) + bias
P = np.exp(scores - scores.max(axis=1, keepdims=True))
P /= P.sum(axis=1, keepdims=True)
print("weights, last row:", P[-1])
print("row sums:", P.sum(axis=1))
