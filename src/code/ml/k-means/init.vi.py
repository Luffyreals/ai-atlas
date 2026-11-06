import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=36, centers=[[2, 2], [8, 3], [5, 8]],
                  cluster_std=1.0, random_state=10)
X = np.round(X, 2)


def run(init, n_init):
    # Chạy KMeans với 50 seed khác nhau, ghi lại inertia (tức J).
    J = [KMeans(3, init=init, n_init=n_init, random_state=s).fit(X).inertia_
         for s in range(50)]
    J = np.round(J, 2)
    stuck = np.sum(J > 52.12)  # số lần dừng ở J lớn hơn 52.12
    print(f"{init:>9}, n_init={n_init:>2}: min J = {J.min():6.2f}, "
          f"max J = {J.max():6.2f}, stuck {stuck}/50")


run("random", 1)  # 3 điểm ngẫu nhiên làm tâm, chạy 1 lần
run("k-means++", 1)  # k-means++, chạy 1 lần
run("random", 10)  # ngẫu nhiên, chạy 10 lần, giữ lần có J nhỏ nhất

# Một lần bị kẹt: J, cỡ các cụm và tọa độ tâm.
km = KMeans(3, init="random", n_init=1, random_state=13).fit(X)
print(f"seed 13: J = {km.inertia_:.2f}, sizes = {np.bincount(km.labels_)}")
print(np.round(km.cluster_centers_, 2))

# Mặc định: init='k-means++', n_init='auto' (1 lần với k-means++).
km = KMeans(3, random_state=0).fit(X)
print(f"default: J = {km.inertia_:.2f}")
