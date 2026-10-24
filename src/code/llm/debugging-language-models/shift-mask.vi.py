# Hai phép kiểm nhỏ bằng NumPy: lệch nhãn và mặt nạ nhân quả
import numpy as np

rng = np.random.default_rng(0)
text = "trăm năm trong cõi người ta"
chars = sorted(set(text))  # từ vựng: các ký tự khác nhau
V, ids = len(chars), np.array([chars.index(c) for c in text])
print(f"V = {V}  L = {len(ids)}  ln V = {np.log(V):.3f}")


def xent(logits, labels):  # cross-entropy trung bình
    z = logits - logits.max(axis=1, keepdims=True)
    logp = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    return -logp[np.arange(len(labels)), labels].mean()


# 1) "Mô hình" gian lận: chỉ chép lại token đang đọc
logits = 20.0 * np.eye(V)[ids]  # hàng t có đỉnh ở chính token t
print(f"no shift: {xent(logits, ids):.4f}")  # nhãn = đầu vào (lỗi)
print(f"shifted:  {xent(logits[:-1], ids[1:]):.4f}")  # nhãn = token sau

d = 8  # 2) một đầu attention, trọng số ngẫu nhiên
E = rng.normal(size=(V, d))
Wq, Wk, Wv = (rng.normal(size=(d, d)) for _ in range(3))


def attend(tokens, causal):
    x = E[tokens]
    s = (x @ Wq) @ (x @ Wk).T / np.sqrt(d)  # điểm L x L
    if causal:  # cộng -inf vào ô j > i: cấm nhìn tương lai
        s = s + np.triu(np.full(s.shape, -np.inf), k=1)
    w = np.exp(s - s.max(axis=1, keepdims=True))
    return (w / w.sum(axis=1, keepdims=True)) @ (x @ Wv)


t, other = 9, ids.copy()
other[t + 1] = (other[t + 1] + 1) % V  # đổi một token ở tương lai
for causal in (True, False):
    diff = np.abs(attend(ids, causal) - attend(other, causal))
    print(f"causal={causal}: max change at <= t: {diff[:t + 1].max():.2e}")
