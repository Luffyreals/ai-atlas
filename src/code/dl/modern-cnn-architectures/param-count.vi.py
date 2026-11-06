import numpy as np
from scipy.signal import convolve2d

# 1. Hai lớp 3x3 so với một lớp 5x5 (256 kênh)
c = 256
params_2x_3x3 = 2 * (3 * 3 * c * c + c)
params_1x_5x5 = 5 * 5 * c * c + c
print(f"2x 3x3: {params_2x_3x3:,} params | 1x 5x5: {params_1x_5x5:,} params")

# Kiểm tra trường tiếp nhận: 1 điểm sáng giữa ảnh 9x9
img = np.zeros((9, 9))
img[4, 4] = 1.0
k = np.ones((3, 3))
conv1 = convolve2d(img, k, mode="same")
conv2 = convolve2d(conv1, k, mode="same")
rf_h = np.count_nonzero(conv2.any(axis=1))
rf_w = np.count_nonzero(conv2.any(axis=0))
print(f"Receptive field (2x 3x3): {rf_h}x{rf_w}")

# 2. Nhánh 5x5 của Inception: 192 vào, 32 ra (có và không có 1x1 16 kênh)
cin, cout, cred = 192, 32, 16
direct_5x5 = 5 * 5 * cin * cout + cout
reduced_5x5 = (1 * 1 * cin * cred + cred) + (5 * 5 * cred * cout + cout)
print(f"Inception 5x5 direct: {direct_5x5:,} | reduced: {reduced_5x5:,}")

# 3. Tích chập thường so với tách theo chiều sâu (256 kênh vào/ra)
std_conv = 3 * 3 * c * c + c
depthwise = (3 * 3 * c + c) + (1 * 1 * c * c + c)
print(f"Standard 3x3: {std_conv:,} | Depthwise separable: {depthwise:,}")

# 4. Khối SE: r = 16, C = 256
r = 16
se_params = (c * (c // r) + (c // r)) + ((c // r) * c + c)
print(f"SE block (r={r}): {se_params:,} params")
