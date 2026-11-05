# Cắt một chữ số 8x8 thành patch rồi tính self-attention bằng NumPy.
import numpy as np
from sklearn.datasets import load_digits

rng = np.random.default_rng(0)
digits = load_digits()
img = digits.images[0] / 16.0         # ảnh 8x8, giá trị từ 0 tới 1
print("label:", digits.target[0], "image:", img.shape)

P, D = 4, 8                            # cỡ patch, số chiều embedding
H, W = img.shape
# Cắt thành lưới (H/P) x (W/P) ô, đọc theo hàng, trải phẳng mỗi ô
patches = (img.reshape(H // P, P, W // P, P)
           .transpose(0, 2, 1, 3).reshape(-1, P * P))
N = patches.shape[0]
print("patches:", patches.shape, "N =", N)
print("patch 1 = top-right block:",
      np.array_equal(patches[1], img[:P, P:].ravel()))

E = rng.normal(0, 0.3, (P * P, D))     # phép chiếu dùng chung cho mọi patch
cls = rng.normal(0, 0.3, (1, D))       # token [CLS] học được
pos = rng.normal(0, 0.3, (N + 1, D))   # embedding vị trí học được
Z = np.vstack([cls, patches @ E]) + pos
print("tokens Z:", Z.shape)

# Một đầu attention: truy vấn, khóa, giá trị
Wq, Wk, Wv = (rng.normal(0, 0.5, (D, D)) for _ in range(3))
Q, K, V = Z @ Wq, Z @ Wk, Z @ Wv
S = Q @ K.T / np.sqrt(D)               # điểm của mọi cặp token
S = S - S.max(axis=1, keepdims=True)   # trừ max cho ổn định số
A = np.exp(S) / np.exp(S).sum(axis=1, keepdims=True)
out = A @ V

np.set_printoptions(precision=3, suppress=True)
print("attention A (row = query, col = key):")
print(A)
print("row sums:", A.sum(axis=1))
print("all weights > 0:", bool((A > 0).all()))
print("output:", out.shape)
# Số cặp điểm attention tăng theo bình phương số token
for side, p in [(8, 4), (8, 2), (224, 16), (224, 8)]:
    n = (side // p) ** 2 + 1           # thêm 1 cho [CLS]
    print(f"{side}x{side}, P={p}: {n} tokens, {n * n} pairs")
