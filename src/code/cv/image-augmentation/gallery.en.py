import matplotlib.pyplot as plt
import numpy as np
from scipy import ndimage
from sklearn.datasets import load_digits

rng = np.random.default_rng(0)
digits = load_digits()
X = digits.images / 16        # 1,797 images of 8 x 8, values in 0..1
x6, x1 = X[6], X[1]           # one digit 6 and one digit 1

# Geometric transforms: only move pixel locations
flip = x6[:, ::-1]                                    # horizontal flip
shift = ndimage.shift(x6, (0, 1), order=0, cval=0)    # shift right by 1 px
rot = ndimage.rotate(x6, 15, reshape=False, order=1)  # rotate by 15 degrees
rot180 = np.rot90(x6, 2)                              # rotate by 180 degrees
# Photometric transforms: change pixel values, keep locations
bright = np.clip(1.4 * x6 + 0.1, 0, 1)    # increase contrast and brightness
noise = np.clip(x6 + rng.normal(0, 0.15, x6.shape), 0, 1)
# Cutout: zero out a 3 x 3 square at a random position
cut = x6.copy()
r, c = rng.integers(0, 6, size=2)
cut[r:r + 3, c:c + 3] = 0
# Mixup: blend two images and their labels with the same coefficient lam
lam = 0.7
mix = lam * x6 + (1 - lam) * x1
y_mix = np.zeros(10)
y_mix[6], y_mix[1] = lam, 1 - lam
print("mixup label:", np.round(y_mix, 2))

# Crude classifier: mean image of each digit, pick the nearest template
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
