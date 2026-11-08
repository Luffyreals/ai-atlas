import numpy as np

# Ảnh xám 8x8: một hình vuông sáng (9) trên nền tối (0)
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
# Sobel dọc: phát hiện cạnh dọc (sáng dần từ trái sang phải)
SOBEL_V = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])


def conv2d(x, kernel, stride=1):
    # Tích chập 'valid', không lật kernel (cross-correlation).
    k = kernel.shape[0]
    n_out = (x.shape[0] - k) // stride + 1
    out = np.zeros((n_out, n_out))
    for i in range(n_out):
        for j in range(n_out):
            r, c = i * stride, j * stride
            window = x[r:r + k, c:c + k]       # cửa sổ k x k
            out[i, j] = np.sum(window * kernel)  # nhân từng ô rồi cộng
    return out


fmap = conv2d(IMAGE, SOBEL_V)
print("feature map", fmap.shape)
print(fmap.astype(int))
# Stride 2: cửa sổ nhảy 2 ô, đầu ra chỉ còn (8 - 3) // 2 + 1 = 3
print("stride 2:", conv2d(IMAGE, SOBEL_V, stride=2).shape)

# Kích hoạt ReLU rồi max-pooling 2x2, bước 2
relu = np.maximum(fmap, 0)
pooled = relu.reshape(3, 2, 3, 2).max(axis=(1, 3))
print("after ReLU + 2x2 max-pool", pooled.shape)
print(pooled.astype(int))
