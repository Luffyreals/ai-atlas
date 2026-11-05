import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=36, centers=[[2, 2], [8, 3], [5, 8]],
                  cluster_std=1.0, random_state=10)
X = np.round(X, 2)


def run(init, n_init, seeds=range(100)):
    # Chạy KMeans với 100 seed khác nhau, ghi lại inertia (tức J).
    J = [KMeans(3, init=init, n_init=n_init, random_state=s).fit(X).inertia_
         for s in seeds]
    J = np.round(J, 2)
    bad = np.sum(J > 52.13)  # lần nào kẹt ở J lớn hơn 52.12
    print(f"{init:>9}, n_init={n_init:>2}: min J = {J.min():6.2f}, "
          f"max J = {J.max():6.2f}, stuck {bad}/100")


run("random", 1)  # chọn ngẫu nhiên 3 điểm làm tâm, chạy 1 lần
run("k-means++", 1)  # k-means++, chạy 1 lần
run("random", 10)  # chọn ngẫu nhiên, chạy 10 lần, giữ lần J nhỏ nhất

# Một lần kẹt: tâm, cỡ cụm và J.
km = KMeans(3, init="random", n_init=1, random_state=13).fit(X)
print(f"seed 13: J = {km.inertia_:.2f}, iterations = {km.n_iter_}")
print(f"sizes = {np.bincount(km.labels_)}")
print(np.round(km.cluster_centers_, 2))

# Mặc định: init='k-means++', n_init='auto' (tức 1 lần với k-means++).
km = KMeans(3, random_state=0).fit(X)
print(f"default: J = {km.inertia_:.2f}, iterations = {km.n_iter_}")
