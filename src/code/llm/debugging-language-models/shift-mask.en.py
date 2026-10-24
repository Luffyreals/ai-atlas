# Two small NumPy checks: shifted labels and the causal mask
import numpy as np

rng = np.random.default_rng(0)
text = "trăm năm trong cõi người ta"  # data: vi (first line of Kieu)
chars = sorted(set(text))  # vocabulary: the distinct characters
V, ids = len(chars), np.array([chars.index(c) for c in text])
print(f"V = {V}  L = {len(ids)}  ln V = {np.log(V):.3f}")


def xent(logits, labels):  # mean cross-entropy
    z = logits - logits.max(axis=1, keepdims=True)
    logp = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    return -logp[np.arange(len(labels)), labels].mean()


# 1) A cheating "model": it copies the token it is reading
logits = 20.0 * np.eye(V)[ids]  # row t peaks at token t itself
print(f"no shift: {xent(logits, ids):.4f}")  # labels = inputs (bug)
print(f"shifted:  {xent(logits[:-1], ids[1:]):.4f}")  # labels = next

d = 8  # 2) one attention head, random weights
E = rng.normal(size=(V, d))
Wq, Wk, Wv = (rng.normal(size=(d, d)) for _ in range(3))


def attend(tokens, causal):
    x = E[tokens]
    s = (x @ Wq) @ (x @ Wk).T / np.sqrt(d)  # L x L scores
    if causal:  # add -inf where j > i: no looking at the future
        s = s + np.triu(np.full(s.shape, -np.inf), k=1)
    w = np.exp(s - s.max(axis=1, keepdims=True))
    return (w / w.sum(axis=1, keepdims=True)) @ (x @ Wv)


t, other = 9, ids.copy()
other[t + 1] = (other[t + 1] + 1) % V  # change one future token
for causal in (True, False):
    diff = np.abs(attend(ids, causal) - attend(other, causal))
    print(f"causal={causal}: max change at <= t: {diff[:t + 1].max():.2e}")
