import numpy as np

rng = np.random.default_rng(0)
d_x, d_h, L = 3, 4, 5  # input dim, state dim, sequence length


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def init(bias):
    # Each branch has W_x (d_h x d_x), W_h (d_h x d_h), and b (d_h)
    W_x = rng.normal(0, 0.5, (d_h, d_x))
    W_h = rng.normal(0, 0.5, (d_h, d_h))
    return W_x, W_h, np.full(d_h, bias)


# Four branches: forget gate, input gate, output gate, candidate.
# Tip: initialize the forget-gate bias to 1 so the cell remembers early on.
P = {"f": init(1.0), "i": init(0.0), "o": init(0.0), "c": init(0.0)}


def lstm_step(x, h, c):
    z = {k: W_x @ x + W_h @ h + b for k, (W_x, W_h, b) in P.items()}
    f, i, o = sigmoid(z["f"]), sigmoid(z["i"]), sigmoid(z["o"])
    c_tilde = np.tanh(z["c"])
    c = f * c + i * c_tilde  # conveyor belt: keep part of c, add new content
    h = o * np.tanh(c)  # output gate selects which part of the cell to expose
    return h, c, f


X = rng.normal(size=(L, d_x))
h, c = np.zeros(d_h), np.zeros(d_h)
keep = np.ones(d_h)  # product of f_t: fraction of c_0 left along the sum path
for t in range(L):
    h, c, f = lstm_step(X[t], h, c)
    keep *= f
    print(f"t={t + 1}  f={f.round(2)}  c={c.round(2) + 0.0}")
print("h_L =", h.round(3))
print("prod f =", keep.round(3))

# Count parameters and compare with the formulas
n = sum(W_x.size + W_h.size + b.size for W_x, W_h, b in P.values())
rnn = d_h * (d_x + d_h) + d_h
print("params:", n, " formula 4*RNN:", 4 * rnn)
print("RNN:", rnn, " GRU:", 3 * rnn,
      " PyTorch LSTM:", 4 * (d_h * (d_x + d_h) + 2 * d_h))
