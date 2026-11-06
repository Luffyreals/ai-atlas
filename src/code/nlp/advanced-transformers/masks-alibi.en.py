# Mặt nạ nhân quả, mặt nạ cửa sổ trượt và bias ALiBi trên một chuỗi ngắn
import numpy as np

np.set_printoptions(precision=3, suppress=True)
L, w = 6, 3                    # độ dài chuỗi, cỡ cửa sổ
i = np.arange(L)[:, None]      # hàng: vị trí truy vấn
j = np.arange(L)[None, :]      # cột: vị trí khóa
causal = j <= i                # chỉ nhìn về trước, kể cả chính nó
window = causal & (i - j < w)  # và cách không quá w - 1 vị trí
print("causal mask:")
print(causal.astype(int))
print(f"sliding window, w = {w}:")
print(window.astype(int))

# Độ dốc ALiBi cho n đầu: cấp số nhân, số hạng đầu và công bội 2^(-8/n)
n_heads = 8
slopes = 2.0 ** (-8 / n_heads * np.arange(1, n_heads + 1))
print("slopes:", slopes)

# Bias của đầu 1: -m * (i - j) ở các ô được nhìn, -inf ở các ô bị che
m = slopes[0]
bias = np.where(causal, m * (j - i), -np.inf)
print("ALiBi bias, head 1:")
print(bias)
print("last row, head 8:", slopes[-1] * (j[0] - (L - 1)))

# Cộng bias vào điểm attention rồi softmax theo từng hàng
rng = np.random.default_rng(0)
d = 4
Q, K = rng.normal(size=(L, d)), rng.normal(size=(L, d))
scores = Q @ K.T / np.sqrt(d) + bias
P = np.exp(scores - scores.max(axis=1, keepdims=True))
P /= P.sum(axis=1, keepdims=True)
print("weights, last row:", P[-1])
print("row sums:", P.sum(axis=1))
