import numpy as np
from scipy.signal import correlate2d, convolve2d
from sklearn.datasets import load_digits

# First 8x8 digit image with label 1, scaled to [0, 1]
digits = load_digits()
idx = int(np.flatnonzero(digits.target == 1)[0])
X = digits.images[idx] / 16.0

# Vertical edge kernel: positive left column, negative right column
K = np.array([[1.0, 0.0, -1.0],
              [1.0, 0.0, -1.0],
              [1.0, 0.0, -1.0]])


def out_size(n, k, p, s):
    # Output size formula along one dimension
    return (n + 2 * p - k) // s + 1


def conv2d(X, K):
    # Hand-written 2D convolution: padding 0, stride 1
    k = K.shape[0]
    H = out_size(X.shape[0], k, 0, 1)
    W = out_size(X.shape[1], k, 0, 1)
    out = np.zeros((H, W))
    for i in range(H):
        for j in range(W):
            # Sum of element-wise products of the k x k window and kernel
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
