import numpy as np

rng = np.random.default_rng(0)
N, D = 4, 8  # 4 cặp (ảnh, chú thích), embedding 8 chiều
labels = ["cat", "dog", "car", "tree"]

# Mỗi cặp có một "ý" chung; ảnh và chữ là hai bản có nhiễu của ý đó
concept = rng.normal(size=(N, D))
img = concept + 0.5 * rng.normal(size=(N, D))
txt = concept + 0.5 * rng.normal(size=(N, D))


def normalize(a):  # chia mỗi hàng cho độ dài của nó
    return a / np.linalg.norm(a, axis=1, keepdims=True)


def cross_entropy(logits):  # nhãn đúng của hàng i là cột i
    z = logits - logits.max(axis=1, keepdims=True)
    log_p = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    return -np.diag(log_p).mean()


def clip_loss(S, tau):  # trung bình của chiều hàng và chiều cột
    return (cross_entropy(S / tau) + cross_entropy(S.T / tau)) / 2


I, T = normalize(img), normalize(txt)
S = I @ T.T  # ma trận cosine N x N
np.set_printoptions(precision=2, suppress=True)
print(S)

S_wrong = I @ T[[1, 2, 3, 0]].T  # ghép sai: ảnh i với chú thích i+1
print(f"log N = {np.log(N):.3f}")
for tau in [1.0, 0.1, 0.01]:
    print(f"tau={tau}: right={clip_loss(S, tau):.3f}"
          f" wrong={clip_loss(S_wrong, tau):.3f}")

# Zero-shot: ảnh mới của "dog", so với 4 câu nhãn
new_img = normalize(concept[[1]] + 0.5 * rng.normal(size=(1, D)))
cos = (new_img @ T.T)[0]
z = cos / 0.07  # tau khởi tạo của CLIP
p = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
print("cos:  ", cos)
print("probs:", " ".join(f"{x:.4f}" for x in p), "->", labels[p.argmax()])
print("argmax per row:", [labels[k] for k in S.argmax(axis=1)])
