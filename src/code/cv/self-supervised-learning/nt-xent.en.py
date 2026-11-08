import numpy as np

rng = np.random.default_rng(0)
N, D = 4, 8  # 4 images in the batch, 8-dimensional embeddings
img = rng.normal(size=(N, D))  # underlying "content" of each image


def views(noise):  # two views per image = content + noise
    a = img + noise * rng.normal(size=(N, D))
    b = img + noise * rng.normal(size=(N, D))
    return np.vstack([a, b])  # 2N rows: rows i and i + N share an image


def nt_xent(z, tau):
    z = z / np.linalg.norm(z, axis=1, keepdims=True)
    s = z @ z.T / tau  # cosine similarity divided by temperature, 2N x 2N
    np.fill_diagonal(s, -np.inf)  # exclude self-pairs on the diagonal
    m = s.max(axis=1, keepdims=True)
    log_p = s - m - np.log(np.exp(s - m).sum(axis=1, keepdims=True))
    pos = np.r_[np.arange(N, 2 * N), np.arange(N)]  # positive-pair columns
    return -log_p[np.arange(2 * N), pos].mean()


print(f"log(2N-1) = {np.log(2 * N - 1):.3f}")
z_close, z_far = views(0.1), views(3.0)
for name, z in [("close", z_close), ("far", z_far)]:
    zn = z / np.linalg.norm(z, axis=1, keepdims=True)
    cos = (zn[:N] * zn[N:]).sum(axis=1).mean()
    print(f"{name}: positive cos = {cos:.2f}")

print("tau    close    far")
for tau in [0.05, 0.1, 0.5, 1.0, 10.0]:
    lc, lf = nt_xent(z_close, tau), nt_xent(z_far, tau)
    print(f"{tau:<5}  {lc:.3f}    {lf:.3f}")
