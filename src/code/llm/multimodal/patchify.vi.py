# Cắt một ảnh nhỏ thành patch rồi chiếu tuyến tính thành token, như ViT
import numpy as np

rng = np.random.default_rng(0)
H, W, C = 32, 32, 3      # ảnh 32x32, 3 kênh màu
P, D_v = 8, 64           # cỡ patch, số chiều của token ảnh
img = rng.random((H, W, C))


def to_patches(x):
    # Chia lưới (H/P) x (W/P) ô, đọc từ trái sang phải, trên xuống dưới,
    # rồi trải phẳng mỗi ô thành P*P*C số
    grid = x.reshape(H // P, P, W // P, P, C).transpose(0, 2, 1, 3, 4)
    return grid.reshape(-1, P * P * C)


patches = to_patches(img)
print("patches:", patches.shape)
print("patch 0 = top-left:", np.array_equal(patches[0], img[:P, :P].ravel()))
print("patch 1 = next right:",
      np.array_equal(patches[1], img[:P, P:2 * P].ravel()))

# Một ma trận E dùng chung cho mọi patch: P*P*C số -> vectơ D_v chiều
E = rng.normal(0, 0.02, (P * P * C, D_v))
tokens = patches @ E
print("tokens:", tokens.shape, "E params:", E.size)

# Chép ô trên trái xuống góc dưới phải: hai ô giống nhau, hai chỗ khác nhau
img2 = img.copy()
img2[-P:, -P:] = img[:P, :P]
tokens2 = to_patches(img2) @ E
print("same token at two places:", np.allclose(tokens2[0], tokens2[-1]))

# Số token N = (H/P)(W/P) với vài cỡ ảnh hay gặp
for h, p in [(224, 16), (224, 8), (224, 14), (336, 14), (448, 14)]:
    print(f"{h}x{h}, P={p}: N = {(h // p) ** 2}")
