# Self-attention tích vô hướng có chia tỉ lệ trên 5 token đồ chơi
import numpy as np

rng = np.random.default_rng(0)
L, d, d_k = 5, 8, 4  # độ dài chuỗi, chiều mô hình, chiều khóa
X = rng.normal(size=(L, d))  # mỗi hàng: vectơ của một token
W_q = rng.normal(size=(d, d_k)) / np.sqrt(d)  # ma trận chiếu học được
W_k = rng.normal(size=(d, d_k)) / np.sqrt(d)
W_v = rng.normal(size=(d, d_k)) / np.sqrt(d)

def softmax(S):
    S = S - S.max(axis=1, keepdims=True)  # trừ max cho ổn định số
    E = np.exp(S)
    return E / E.sum(axis=1, keepdims=True)  # softmax theo từng hàng

def attention(Q, K, V, mask=None):
    S = Q @ K.T / np.sqrt(d_k)  # điểm: L x L
    if mask is not None:
        S = np.where(mask, S, -np.inf)  # ô bị che nhận -vô cùng
    A = softmax(S)  # trọng số attention
    return A @ V, A

Q, K, V = X @ W_q, X @ W_k, X @ W_v
out, A = attention(Q, K, V)
np.set_printoptions(precision=2, suppress=True)
print("weights (no mask):")
print(A)
print("row sums:", A.sum(axis=1))
print("output shape:", out.shape)

causal = np.tril(np.ones((L, L), dtype=bool))  # True: được nhìn
out_c, A_c = attention(Q, K, V, mask=causal)
print("weights (causal mask):")
print(A_c)
print("row sums:", A_c.sum(axis=1))
print("row 0 of output equals V[0]:", np.allclose(out_c[0], V[0]))
