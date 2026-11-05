import numpy as np
from scipy.signal import correlate2d, convolve2d
from sklearn.datasets import load_digits

# Ảnh chữ số 8x8 đầu tiên có nhãn 1, đưa giá trị về đoạn [0, 1]
digits = load_digits()
idx = int(np.flatnonzero(digits.target == 1)[0])
X = digits.images[idx] / 16.0

# Kernel cạnh dọc: cột trái dương, cột phải âm
K = np.array([[1.0, 0.0, -1.0],
              [1.0, 0.0, -1.0],
              [1.0, 0.0, -1.0]])


def out_size(n, k, p, s):
    # Công thức kích thước đầu ra theo một chiều
    return (n + 2 * p - k) // s + 1


def conv2d(X, K):
    # Tích chập viết tay: padding 0, stride 1
    k = K.shape[0]
    H = out_size(X.shape[0], k, 0, 1)
    W = out_size(X.shape[1], k, 0, 1)
    out = np.zeros((H, W))
    for i in range(H):
        for j in range(W):
            # Tổng tích từng ô của cửa sổ k x k với kernel
            out[i, j] = np.sum(X[i:i + k, j:j + k] * K)
    return out


F = conv2d(X, K)
print("label:", digits.target[idx], "image:", X.shape)
print(np.round(X, 1))
print("feature map:", F.shape)
print(np.round(F, 2))
print("same as scipy correlate2d:",
      np.allclose(F, correlate2d(X, K, mode="valid")))
print("same as convolve2d (flipped):",
      np.allclose(F, convolve2d(X, K, mode="valid")))
for p, s in [(0, 1), (1, 1), (0, 2), (1, 2)]:
    print(f"k=3 p={p} s={s}: {out_size(8, 3, p, s)}x{out_size(8, 3, p, s)}")
