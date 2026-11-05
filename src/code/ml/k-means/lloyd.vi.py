import numpy as np
from sklearn.datasets import make_blobs

# 36 điểm 2D thành 3 cụm, làm tròn 2 chữ số.
X, _ = make_blobs(n_samples=36, centers=[[2, 2], [8, 3], [5, 8]],
                  cluster_std=1.0, random_state=10)
X = np.round(X, 2)

k = 3
mu = X[[2, 20, 1]].copy()  # 3 tâm ban đầu: điểm số 2, 20 và 1
c = np.full(len(X), -1)  # chưa điểm nào được gán

for t in range(1, 101):
    # Pha gán: bình phương khoảng cách từ mỗi điểm tới mỗi tâm.
    d2 = ((X[:, None, :] - mu[None, :, :]) ** 2).sum(axis=2)
    c_new = d2.argmin(axis=1)  # chỉ số tâm gần nhất
    if np.array_equal(c_new, c):  # không điểm nào đổi cụm: dừng
        break
    c = c_new
    J = d2[np.arange(len(X)), c].sum()
    print(f"iter {t}: assign J = {J:7.2f}", end="  ")
    # Pha cập nhật: mỗi tâm thành trung bình các điểm của cụm.
    for j in range(k):
        if np.any(c == j):  # bỏ qua cụm rỗng
            mu[j] = X[c == j].mean(axis=0)
    J = ((X - mu[c]) ** 2).sum()
    print(f"update J = {J:7.2f}")

print(f"converged, sizes = {np.bincount(c, minlength=k)}")
print("centroids:")
print(np.round(mu, 2))
