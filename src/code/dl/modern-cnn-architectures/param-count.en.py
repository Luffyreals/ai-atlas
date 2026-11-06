import numpy as np
from scipy.signal import convolve2d

# 1. Two 3x3 layers vs one 5x5 layer (256 channels)
c = 256
params_2x_3x3 = 2 * (3 * 3 * c * c + c)
params_1x_5x5 = 5 * 5 * c * c + c
print(f"2x 3x3: {params_2x_3x3:,} params | 1x 5x5: {params_1x_5x5:,} params")

# Receptive field test: 1 lit pixel in center of 9x9 image
img = np.zeros((9, 9))
img[4, 4] = 1.0
k = np.ones((3, 3))
conv1 = convolve2d(img, k, mode="same")
conv2 = convolve2d(conv1, k, mode="same")
rf_h = np.count_nonzero(conv2.any(axis=1))
rf_w = np.count_nonzero(conv2.any(axis=0))
print(f"Receptive field (2x 3x3): {rf_h}x{rf_w}")

# 2. Inception 5x5 branch: 192 in, 32 out (with/without 1x1 16 channels)
cin, cout, cred = 192, 32, 16
direct_5x5 = 5 * 5 * cin * cout + cout
reduced_5x5 = (1 * 1 * cin * cred + cred) + (5 * 5 * cred * cout + cout)
print(f"Inception 5x5 direct: {direct_5x5:,} | reduced: {reduced_5x5:,}")

# 3. Standard conv vs depthwise separable conv (256 in/out channels)
std_conv = 3 * 3 * c * c + c
depthwise = (3 * 3 * c + c) + (1 * 1 * c * c + c)
print(f"Standard 3x3: {std_conv:,} | Depthwise separable: {depthwise:,}")

# 4. SE block: r = 16, C = 256
r = 16
se_params = (c * (c // r) + (c // r)) + ((c // r) * c + c)
print(f"SE block (r={r}): {se_params:,} params")
