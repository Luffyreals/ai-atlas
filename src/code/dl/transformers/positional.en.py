# Mã hóa vị trí sin/cos, và vì sao attention cần nó
import numpy as np

def positional_encoding(L, d):
    pos = np.arange(L)[:, None]  # vị trí 0..L-1, dạng cột
    i = np.arange(0, d, 2)[None, :]  # chỉ số chiều chẵn 0, 2, 4, ...
    angle = pos / 10000 ** (i / d)  # mỗi cặp chiều một tần số
    P = np.zeros((L, d))
    P[:, 0::2] = np.sin(angle)  # chiều chẵn: sin
    P[:, 1::2] = np.cos(angle)  # chiều lẻ: cos
    return P

def self_attention(X):  # bản rút gọn: Q = K = V = X
    S = X @ X.T / np.sqrt(X.shape[1])
    A = np.exp(S - S.max(axis=1, keepdims=True))
    return (A / A.sum(axis=1, keepdims=True)) @ X

rng = np.random.default_rng(0)
L, d = 3, 8  # "chó cắn mèo": 3 token
P = positional_encoding(L, d)
np.set_printoptions(precision=2, suppress=True)
print("PE, first 4 dims of positions 0..2:")
print(P[:, :4])

X = rng.normal(size=(L, d))  # vectơ token, chưa có vị trí
perm = [2, 1, 0]  # "mèo cắn chó": đổi chỗ token 0 và 2
for name, add in [("no PE", 0), ("with PE", P)]:
    out = self_attention(X + add)
    out_sw = self_attention(X[perm] + add)  # câu đã đổi chỗ
    # "cắn" vẫn ở vị trí 1; đầu ra của nó có đổi không?
    diff = np.abs(out[1] - out_sw[1]).max()
    print(f"{name:8s} change at position 1: {diff:.3f}")
