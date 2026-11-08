import numpy as np

rng = np.random.default_rng(0)
d_x, d_h = 2, 3  # input dimension, hidden state dimension

# A single parameter set, reused at every time step
W_xh = rng.normal(0, 0.5, (d_h, d_x))
W_hh = rng.normal(0, 0.5, (d_h, d_h))
b_h = np.zeros(d_h)
W_hy = rng.normal(0, 0.5, (1, d_h))
b_y = np.zeros(1)


def rnn_forward(xs):
    # Run the RNN on sequence xs (L rows, d_x columns), return all h_t.
    h = np.zeros(d_h)  # h_0 = 0
    hs = []
    for x_t in xs:  # read one step at a time
        h = np.tanh(W_xh @ x_t + W_hh @ h + b_h)
        hs.append(h)
    return np.array(hs)


xs = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [0.5, -1.0]])
hs = rnn_forward(xs)
for t, h in enumerate(hs, start=1):
    print(f"t={t}  h = {np.round(h, 3)}")

# Output from the final state (many-to-one task)
y_hat = W_hy @ hs[-1] + b_y
print(f"y_hat (from h_L) = {y_hat[0]:.3f}")

# Same parameters on a length-2 prefix and the reversed sequence
print(f"L=2 last h  = {np.round(rnn_forward(xs[:2])[-1], 3)}")
print(f"reversed h  = {np.round(rnn_forward(xs[::-1])[-1], 3)}")
n_params = W_xh.size + W_hh.size + b_h.size + W_hy.size + b_y.size
print(f"parameters = {n_params}")
