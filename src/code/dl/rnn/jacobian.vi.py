import numpy as np

d_h, L = 16, 50  # số chiều trạng thái ẩn, độ dài chuỗi
distances = [1, 10, 20, 30, 40]  # các khoảng cách L - t cần in
print("L-t   " + "  ".join(f"{k:8d}" for k in distances))

for c in [0.5, 1.0, 2.0]:  # độ lớn của W_hh
    rng = np.random.default_rng(0)
    # W_hh = c * ma trận trực giao: mọi giá trị kỳ dị bằng đúng c
    Q, _ = np.linalg.qr(rng.normal(size=(d_h, d_h)))
    W_hh = c * Q
    w_xh = rng.normal(size=d_h)
    xs = 0.1 * rng.normal(size=L)  # chuỗi vào vô hướng, nhỏ

    # Lan truyền xuôi, giữ lại mọi h_t
    h = np.zeros(d_h)
    hs = []
    for x_t in xs:
        h = np.tanh(w_xh * x_t + W_hh @ h)
        hs.append(h)

    # Đi ngược: J = dh_L/dh_t = tích các Jacobian một bước
    J = np.eye(d_h)
    norms = {}
    for k in range(1, L):  # k = L - t
        h_k = hs[L - k]  # chính là h_{t+1}, với t = L - k
        J = J @ (np.diag(1 - h_k**2) @ W_hh)
        norms[k] = np.linalg.norm(J, 2)  # chuẩn phổ
    row = "  ".join(f"{norms[k]:8.1e}" for k in distances)
    print(f"c={c:3.1f}  {row}")
