# Scaled dot-product self-attention on 5 toy tokens
import numpy as np

rng = np.random.default_rng(0)
L, d, d_k = 5, 8, 4  # sequence length, model dimension, key dimension
X = rng.normal(size=(L, d))  # each row: one token's vector
W_q = rng.normal(size=(d, d_k)) / np.sqrt(d)  # learned projection matrices
W_k = rng.normal(size=(d, d_k)) / np.sqrt(d)
W_v = rng.normal(size=(d, d_k)) / np.sqrt(d)

def softmax(S):
    S = S - S.max(axis=1, keepdims=True)  # subtract max for numerical stability
    E = np.exp(S)
    return E / E.sum(axis=1, keepdims=True)  # row-wise softmax

def attention(Q, K, V, mask=None):
    S = Q @ K.T / np.sqrt(d_k)  # scores: L x L
    if mask is not None:
        S = np.where(mask, S, -np.inf)  # masked entries get -inf
    A = softmax(S)  # attention weights
    return A @ V, A

Q, K, V = X @ W_q, X @ W_k, X @ W_v
out, A = attention(Q, K, V)
np.set_printoptions(precision=2, suppress=True)
print("weights (no mask):")
print(A)
print("row sums:", A.sum(axis=1))
print("output shape:", out.shape)

causal = np.tril(np.ones((L, L), dtype=bool))  # True: allowed to attend
out_c, A_c = attention(Q, K, V, mask=causal)
print("weights (causal mask):")
print(A_c)
print("row sums:", A_c.sum(axis=1))
print("row 0 of output equals V[0]:", np.allclose(out_c[0], V[0]))
