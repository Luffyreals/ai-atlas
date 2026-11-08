import numpy as np

N_L, width, m = 10, 64, 32  # layers, neurons per layer, samples


# Return ||delta^[l]|| = ||dL/dz^[l]|| for each layer l = 1..N_L
def run(act, init_std):
    rng = np.random.default_rng(0)
    g = {"sigmoid": lambda z: 1 / (1 + np.exp(-z)),
         "relu": lambda z: np.maximum(z, 0)}[act]
    X = rng.normal(size=(m, width))  # each row is one sample
    Ws, zs, acts = [], [], [X]
    for l in range(N_L):  # forward pass, no g on the last layer
        W = rng.normal(0, init_std(width, width), size=(width, width))
        Ws.append(W)
        zs.append(acts[-1] @ W.T)
        acts.append(g(zs[-1]) if l < N_L - 1 else zs[-1])
    # Dummy loss L = mean of r . (output), fixed random r,
    # so last-layer delta = r / m, identical across all three setups
    d = rng.normal(size=(m, width)) / m
    norms = [np.linalg.norm(d)]
    for l in range(N_L - 1, 0, -1):  # backward pass to layer 1
        a = acts[l]  # activation of layer l (1-indexed)
        dg = a * (1 - a) if act == "sigmoid" else (zs[l - 1] > 0)
        d = (d @ Ws[l]) * dg  # delta^[l] = (W^[l+1]^T delta^[l+1]) * g'
        norms.append(np.linalg.norm(d))
    return norms[::-1]


xavier = lambda n_in, n_out: np.sqrt(2 / (n_in + n_out))
he = lambda n_in, n_out: np.sqrt(2 / n_in)
one = lambda n_in, n_out: 1.0
cols = {"sig+Xavier": run("sigmoid", xavier),
        "relu+std1": run("relu", one),
        "relu+He": run("relu", he)}
print("layer" + "".join(f"{k:>12}" for k in cols))
for l in range(N_L):
    print(f"{l + 1:>5}" + "".join(f"{v[l]:>12.1e}" for v in cols.values()))
