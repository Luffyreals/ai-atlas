import numpy as np

rng = np.random.default_rng(0)
d_x, d_h, L = 3, 4, 5  # chiều đầu vào, chiều trạng thái, độ dài chuỗi


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def init(bias):
    # Mỗi nhánh có W_x (d_h x d_x), W_h (d_h x d_h) và b (d_h)
    W_x = rng.normal(0, 0.5, (d_h, d_x))
    W_h = rng.normal(0, 0.5, (d_h, d_h))
    return W_x, W_h, np.full(d_h, bias)


# Bốn nhánh: cổng quên, cổng vào, cổng ra, ứng viên.
# Mẹo: bias cổng quên khởi tạo bằng 1 để lúc đầu mạng "nhớ" nhiều.
P = {"f": init(1.0), "i": init(0.0), "o": init(0.0), "c": init(0.0)}


def lstm_step(x, h, c):
    z = {k: W_x @ x + W_h @ h + b for k, (W_x, W_h, b) in P.items()}
    f, i, o = sigmoid(z["f"]), sigmoid(z["i"]), sigmoid(z["o"])
    c_tilde = np.tanh(z["c"])
    c = f * c + i * c_tilde  # băng chuyền: giữ một phần, cộng phần mới
    h = o * np.tanh(c)  # cổng ra chọn phần nào của ô được đưa ra
    return h, c, f


X = rng.normal(size=(L, d_x))
h, c = np.zeros(d_h), np.zeros(d_h)
keep = np.ones(d_h)  # tích các f_t: phần c_0 còn lại trên đường cộng
for t in range(L):
    h, c, f = lstm_step(X[t], h, c)
    keep *= f
    print(f"t={t + 1}  f={f.round(2)}  c={c.round(2) + 0.0}")
print("h_L =", h.round(3))
print("prod f =", keep.round(3))

# Đếm tham số và so với công thức
n = sum(W_x.size + W_h.size + b.size for W_x, W_h, b in P.values())
rnn = d_h * (d_x + d_h) + d_h
print("params:", n, " formula 4*RNN:", 4 * rnn)
print("RNN:", rnn, " GRU:", 3 * rnn,
      " PyTorch LSTM:", 4 * (d_h * (d_x + d_h) + 2 * d_h))
