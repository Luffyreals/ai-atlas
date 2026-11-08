import numpy as np

rng = np.random.default_rng(0)
d_x, d_h = 2, 3  # số chiều đầu vào, số chiều trạng thái ẩn

# Một bộ tham số duy nhất, dùng lại ở mọi bước thời gian
W_xh = rng.normal(0, 0.5, (d_h, d_x))
W_hh = rng.normal(0, 0.5, (d_h, d_h))
b_h = np.zeros(d_h)
W_hy = rng.normal(0, 0.5, (1, d_h))
b_y = np.zeros(1)


def rnn_forward(xs):
    # Chạy RNN trên chuỗi xs (L hàng, d_x cột), trả về mọi h_t.
    h = np.zeros(d_h)  # h_0 = 0
    hs = []
    for x_t in xs:  # đọc lần lượt từng bước
        h = np.tanh(W_xh @ x_t + W_hh @ h + b_h)
        hs.append(h)
    return np.array(hs)


xs = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [0.5, -1.0]])
hs = rnn_forward(xs)
for t, h in enumerate(hs, start=1):
    print(f"t={t}  h = {np.round(h, 3)}")

# Đầu ra từ trạng thái cuối (bài toán nhiều -> một)
y_hat = W_hy @ hs[-1] + b_y
print(f"y_hat (from h_L) = {y_hat[0]:.3f}")

# Cùng tham số, chuỗi dài 2 và chuỗi bị đảo thứ tự
print(f"L=2 last h  = {np.round(rnn_forward(xs[:2])[-1], 3)}")
print(f"reversed h  = {np.round(rnn_forward(xs[::-1])[-1], 3)}")
n_params = W_xh.size + W_hh.size + b_h.size + W_hy.size + b_y.size
print(f"parameters = {n_params}")
