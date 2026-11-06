import numpy as np
from sklearn.datasets import make_blobs

# 36 2D points into 3 clusters, rounded to 2 decimals.
X, _ = make_blobs(n_samples=36, centers=[[2, 2], [8, 3], [5, 8]],
                  cluster_std=1.0, random_state=10)
X = np.round(X, 2)

k = 3
mu = X[[2, 20, 1]].copy()  # 3 initial centroids: points 2, 20 and 1
c = np.full(len(X), -1)  # no point assigned yet

for t in range(1, 101):
    # Assignment step: squared distance from each point to each centroid.
    d2 = ((X[:, None, :] - mu[None, :, :]) ** 2).sum(axis=2)
    c_new = d2.argmin(axis=1)  # index of closest centroid
    if np.array_equal(c_new, c):  # no point changed cluster: stop
        break
    c = c_new
    J = d2[np.arange(len(X)), c].sum()
    print(f"iter {t}: assign J = {J:7.2f}", end="  ")
    # Update step: each centroid becomes the mean of points in its cluster.
    for j in range(k):
        if np.any(c == j):  # skip empty cluster
            mu[j] = X[c == j].mean(axis=0)
    J = ((X - mu[c]) ** 2).sum()
    print(f"update J = {J:7.2f}")

print(f"converged, sizes = {np.bincount(c, minlength=k)}")
print("centroids:")
print(np.round(mu, 2))
