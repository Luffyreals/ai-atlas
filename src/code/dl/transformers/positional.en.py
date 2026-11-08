# Sinusoidal positional encoding, and why attention needs it
import numpy as np

def positional_encoding(L, d):
    pos = np.arange(L)[:, None]  # positions 0..L-1 as a column
    i = np.arange(0, d, 2)[None, :]  # even dimension indices 0, 2, 4, ...
    angle = pos / 10000 ** (i / d)  # one frequency per dimension pair
    P = np.zeros((L, d))
    P[:, 0::2] = np.sin(angle)  # even dimensions: sin
    P[:, 1::2] = np.cos(angle)  # odd dimensions: cos
    return P

def self_attention(X):  # simplified version: Q = K = V = X
    S = X @ X.T / np.sqrt(X.shape[1])
    A = np.exp(S - S.max(axis=1, keepdims=True))
    return (A / A.sum(axis=1, keepdims=True)) @ X

rng = np.random.default_rng(0)
L, d = 3, 8  # "dog bites cat": 3 tokens
P = positional_encoding(L, d)
np.set_printoptions(precision=2, suppress=True)
print("PE, first 4 dims of positions 0..2:")
print(P[:, :4])

X = rng.normal(size=(L, d))  # token vectors, without position
perm = [2, 1, 0]  # "cat bites dog": swap tokens 0 and 2
for name, add in [("no PE", 0), ("with PE", P)]:
    out = self_attention(X + add)
    out_sw = self_attention(X[perm] + add)  # swapped sentence
    # "bites" stays at position 1; does its output change?
    diff = np.abs(out[1] - out_sw[1]).max()
    print(f"{name:8s} change at position 1: {diff:.3f}")
