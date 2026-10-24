# Cut a small image into patches and project them linearly into tokens (ViT)
import numpy as np

rng = np.random.default_rng(0)
H, W, C = 32, 32, 3      # 32x32 image, 3 colour channels
P, D_v = 8, 64           # patch size, image token dimension
img = rng.random((H, W, C))


def to_patches(x):
    # Split into a (H/P) x (W/P) grid, read left to right, top to bottom,
    # then flatten each cell into P*P*C numbers
    grid = x.reshape(H // P, P, W // P, P, C).transpose(0, 2, 1, 3, 4)
    return grid.reshape(-1, P * P * C)


patches = to_patches(img)
print("patches:", patches.shape)
print("patch 0 = top-left:", np.array_equal(patches[0], img[:P, :P].ravel()))
print("patch 1 = next right:",
      np.array_equal(patches[1], img[:P, P:2 * P].ravel()))

# One matrix E shared by every patch: P*P*C numbers -> a D_v-dim vector
E = rng.normal(0, 0.02, (P * P * C, D_v))
tokens = patches @ E
print("tokens:", tokens.shape, "E params:", E.size)

# Copy the top-left cell to the bottom-right: same cell, two places
img2 = img.copy()
img2[-P:, -P:] = img[:P, :P]
tokens2 = to_patches(img2) @ E
print("same token at two places:", np.allclose(tokens2[0], tokens2[-1]))

# Token count N = (H/P)(W/P) for a few common image sizes
for h, p in [(224, 16), (224, 8), (224, 14), (336, 14), (448, 14)]:
    print(f"{h}x{h}, P={p}: N = {(h // p) ** 2}")
