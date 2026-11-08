import numpy as np

# 8x8 grayscale image: a bright square (9) on a dark background (0)
IMAGE = np.array([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 9, 9, 9, 9, 0, 0],
    [0, 0, 9, 9, 9, 9, 0, 0],
    [0, 0, 9, 9, 9, 9, 0, 0],
    [0, 0, 9, 9, 9, 9, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
])
# Vertical Sobel: detects vertical edges (brighter from left to right)
SOBEL_V = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])


def conv2d(x, kernel, stride=1):
    # 'valid' convolution, without flipping the kernel (cross-correlation).
    k = kernel.shape[0]
    n_out = (x.shape[0] - k) // stride + 1
    out = np.zeros((n_out, n_out))
    for i in range(n_out):
        for j in range(n_out):
            r, c = i * stride, j * stride
            window = x[r:r + k, c:c + k]       # k x k window
            out[i, j] = np.sum(window * kernel)  # elementwise multiply & sum
    return out


fmap = conv2d(IMAGE, SOBEL_V)
print("feature map", fmap.shape)
print(fmap.astype(int))
# Stride 2: window jumps 2 cells, output size is (8 - 3) // 2 + 1 = 3
print("stride 2:", conv2d(IMAGE, SOBEL_V, stride=2).shape)

# ReLU activation followed by 2x2 max-pooling, stride 2
relu = np.maximum(fmap, 0)
pooled = relu.reshape(3, 2, 3, 2).max(axis=(1, 3))
print("after ReLU + 2x2 max-pool", pooled.shape)
print(pooled.astype(int))
