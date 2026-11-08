import numpy as np

rng = np.random.default_rng(0)
d_x, d_h = 3, 4  # input dimension and hidden state dimension


def sigmoid(a):
    return 1 / (1 + np.exp(-a))


def init():  # one (W_x., W_h., b_.) tuple for each gate r, z and candidate
    return {k: (rng.normal(0, 0.5, (d_h, d_x)),
                rng.normal(0, 0.5, (d_h, d_h)), np.zeros(d_h))
            for k in "rzh"}


def gru_step(x, h, p, bias_z=0.0):
    (Wxr, Whr, br), (Wxz, Whz, bz), (Wxh, Whh, bh) = p["r"], p["z"], p["h"]
    r = sigmoid(Wxr @ x + Whr @ h + br)  # reset gate
    z = sigmoid(Wxz @ x + Whz @ h + bz + bias_z)  # update gate
    h_cand = np.tanh(Wxh @ x + Whh @ (r * h) + bh)  # candidate state
    return z * h + (1 - z) * h_cand, z  # interpolate by z


p = init()
h0 = np.array([0.9, -0.8, 0.5, -0.3])
x1 = rng.normal(size=d_x)
np.set_printoptions(precision=3, suppress=True)
for bias_z in [0.0, 5.0, -5.0]:  # offset added to the update gate
    h1, z = gru_step(x1, h0, p, bias_z)
    print(f"bias_z={bias_z:+.0f}  mean z={z.mean():.3f}  h1={h1}")

# Run 50 steps from two opposite initial states on the same input sequence.
# How far apart the final states remain = how much h0 the network remembers.
xs = rng.normal(size=(50, d_x))
print(f"start          |ha - hb| = {np.abs(2 * h0).max():.4f}")
for bias_z in [0.0, 5.0]:
    ha, hb = h0.copy(), -h0
    for x in xs:
        ha, _ = gru_step(x, ha, p, bias_z)
        hb, _ = gru_step(x, hb, p, bias_z)
    gap = np.abs(ha - hb).max()
    print(f"bias_z={bias_z:+.0f}  after 50 steps |ha - hb| = {gap:.4f}")
