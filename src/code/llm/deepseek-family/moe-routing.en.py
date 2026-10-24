# DeepSeek-V3 style top-K routing and load balancing with a bias
import numpy as np

rng = np.random.default_rng(0)
B, N, K = 64, 8, 2  # tokens in the batch, routed experts, experts picked
logits = rng.normal(size=(B, N))  # u^T e_i for each token and expert
logits[:, 0] += 1.0  # make the router "prefer" expert 0 on purpose
s = 1 / (1 + np.exp(-logits))  # sigmoid affinity scores, as in V3


def route(s, bias, k):
    # Pick top-k by s + bias, but take the gate weights from the original s
    picked = np.argsort(-(s + bias), axis=1)[:, :k]
    mask = np.zeros_like(s, dtype=bool)
    np.put_along_axis(mask, picked, True, axis=1)
    gate = np.where(mask, s, 0.0)
    return mask, gate / gate.sum(axis=1, keepdims=True)


bias = np.zeros(N)
gamma = 0.01  # bias update speed (the paper uses 0.001)
for step in range(200):
    mask, gate = route(s, bias, K)
    load = mask.sum(axis=0)  # number of tokens each expert receives
    if step in (0, 199):
        print(f"step {step:3d} load:", load)
    # Simplified rule: above-average load goes down, below-average goes up
    bias -= gamma * np.sign(load - load.mean())

print("bias:", np.round(bias, 2))
print("gates of token 0:", np.round(gate[0][mask[0]], 3))
print("experts per token:", mask.sum(axis=1).min(), mask.sum(axis=1).max())
