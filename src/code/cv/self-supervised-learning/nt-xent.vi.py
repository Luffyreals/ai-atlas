import numpy as np

rng = np.random.default_rng(0)
N, D = 4, 8  # 4 ảnh trong lô, embedding 8 chiều
img = rng.normal(size=(N, D))  # "nội dung" của từng ảnh


def views(noise):  # hai góc nhìn của mỗi ảnh = nội dung + nhiễu
    a = img + noise * rng.normal(size=(N, D))
    b = img + noise * rng.normal(size=(N, D))
    return np.vstack([a, b])  # 2N hàng: hàng i và i + N cùng ảnh


def nt_xent(z, tau):
    z = z / np.linalg.norm(z, axis=1, keepdims=True)
    s = z @ z.T / tau  # cosine chia nhiệt độ, cỡ 2N x 2N
    np.fill_diagonal(s, -np.inf)  # bỏ cặp một vectơ với chính nó
    m = s.max(axis=1, keepdims=True)
    log_p = s - m - np.log(np.exp(s - m).sum(axis=1, keepdims=True))
    pos = np.r_[np.arange(N, 2 * N), np.arange(N)]  # cột của cặp dương
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
