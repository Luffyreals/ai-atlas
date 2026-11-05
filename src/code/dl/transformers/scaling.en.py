# Vì sao chia cho căn d_k: phương sai của tích vô hướng tăng theo d_k
import numpy as np

rng = np.random.default_rng(0)
L = 10  # mỗi truy vấn chấm điểm 10 khóa

def softmax(s):
    e = np.exp(s - s.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

for d_k in [4, 64, 512]:
    # 2000 truy vấn, mỗi truy vấn với L khóa; thành phần ~ N(0, 1)
    q = rng.normal(size=(2000, 1, d_k))
    k = rng.normal(size=(2000, L, d_k))
    s = (q * k).sum(axis=-1)  # tích vô hướng q.k, kích thước (2000, L)
    raw = softmax(s).max(axis=-1).mean()  # trọng số lớn nhất, không chia
    scaled = softmax(s / np.sqrt(d_k)).max(axis=-1).mean()
    print(f"d_k={d_k:3d}  var(q.k)={s.var():7.1f}  "
          f"max weight: raw {raw:.2f}, scaled {scaled:.2f}")
