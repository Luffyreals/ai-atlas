import numpy as np

rng = np.random.default_rng(0)
N, D = 4, 8  # 4 (image, caption) pairs, 8-dim embeddings
labels = ["cat", "dog", "car", "tree"]

# Each pair shares an underlying "concept"; image and text are noisy views
concept = rng.normal(size=(N, D))
img = concept + 0.5 * rng.normal(size=(N, D))
txt = concept + 0.5 * rng.normal(size=(N, D))


def normalize(a):  # divide each row by its norm
    return a / np.linalg.norm(a, axis=1, keepdims=True)


def cross_entropy(logits):  # correct label for row i is column i
    z = logits - logits.max(axis=1, keepdims=True)
    log_p = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    return -np.diag(log_p).mean()


def clip_loss(S, tau):  # average of row-wise and column-wise losses
    return (cross_entropy(S / tau) + cross_entropy(S.T / tau)) / 2


I, T = normalize(img), normalize(txt)
S = I @ T.T  # N x N cosine matrix
np.set_printoptions(precision=2, suppress=True)
print(S)

S_wrong = I @ T[[1, 2, 3, 0]].T  # mismatched: image i paired with caption i+1
print(f"log N = {np.log(N):.3f}")
for tau in [1.0, 0.1, 0.01]:
    print(f"tau={tau}: right={clip_loss(S, tau):.3f}"
          f" wrong={clip_loss(S_wrong, tau):.3f}")

# Zero-shot: a new "dog" image compared against the 4 label prompts
new_img = normalize(concept[[1]] + 0.5 * rng.normal(size=(1, D)))
cos = (new_img @ T.T)[0]
z = cos / 0.07  # CLIP's initial tau
p = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
print("cos:  ", cos)
print("probs:", " ".join(f"{x:.4f}" for x in p), "->", labels[p.argmax()])
print("argmax per row:", [labels[k] for k in S.argmax(axis=1)])
