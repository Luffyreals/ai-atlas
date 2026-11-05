import matplotlib.pyplot as plt
import numpy as np
from scipy import ndimage
from sklearn.datasets import load_digits

rng = np.random.default_rng(0)
digits = load_digits()
X = digits.images / 16        # 1 797 ảnh 8 x 8, giá trị 0..1
x6, x1 = X[6], X[1]           # một chữ số 6 và một chữ số 1

# Phép hình học: chỉ dời chỗ các pixel
flip = x6[:, ::-1]                                    # lật ngang
shift = ndimage.shift(x6, (0, 1), order=0, cval=0)    # dịch phải 1 px
rot = ndimage.rotate(x6, 15, reshape=False, order=1)  # xoay 15 độ
rot180 = np.rot90(x6, 2)                              # xoay 180 độ
# Phép quang học: đổi giá trị pixel, giữ nguyên chỗ
bright = np.clip(1.4 * x6 + 0.1, 0, 1)    # tăng tương phản và độ sáng
noise = np.clip(x6 + rng.normal(0, 0.15, x6.shape), 0, 1)
# Cutout: xóa một ô vuông 3 x 3 ở vị trí ngẫu nhiên
cut = x6.copy()
r, c = rng.integers(0, 6, size=2)
cut[r:r + 3, c:c + 3] = 0
# Mixup: trộn hai ảnh, trộn cả nhãn với cùng hệ số lam
lam = 0.7
mix = lam * x6 + (1 - lam) * x1
y_mix = np.zeros(10)
y_mix[6], y_mix[1] = lam, 1 - lam
print("mixup label:", np.round(y_mix, 2))

# Bộ phân loại thô: ảnh trung bình của mỗi chữ số, chọn cái gần nhất
means = np.stack([X[digits.target == k].mean(0) for k in range(10)])
panels = [(x6, "original"), (flip, "flip"), (shift, "shift 1px"),
          (rot, "rotate 15"), (rot180, "rotate 180"), (bright, "contrast"),
          (noise, "noise"), (cut, "cutout"), (mix, "mixup")]
fig, axes = plt.subplots(3, 3, figsize=(6, 6.4))
for ax, (img, name) in zip(axes.flat, panels):
    near = np.argmin(((means - img) ** 2).sum(axis=(1, 2)))
    print(f"{name:10s} -> looks like {near}")
    ax.imshow(img, cmap="gray_r", vmin=0, vmax=1)
    ax.set_title(f"{name} ({near})")
    ax.axis("off")
plt.tight_layout()
plt.show()
