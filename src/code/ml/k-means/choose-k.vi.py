import matplotlib.pyplot as plt
import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.metrics import silhouette_score

X, _ = make_blobs(n_samples=36, centers=[[2, 2], [8, 3], [5, 8]],
                  cluster_std=1.0, random_state=10)
X = np.round(X, 2)

ks = range(1, 7)
inertia, sil = [], []
for k in ks:
    km = KMeans(k, n_init=10, random_state=0).fit(X)
    inertia.append(km.inertia_)
    # Silhouette cần ít nhất 2 cụm.
    sil.append(silhouette_score(X, km.labels_) if k > 1 else np.nan)
    print(f"k = {k}: J = {km.inertia_:6.2f}, silhouette = {sil[-1]:.3f}")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.5))
ax1.plot(ks, inertia, "o-")
ax1.set_xlabel("k")
ax1.set_ylabel("inertia J")
ax1.set_title("Elbow")
ax2.plot(ks, sil, "o-", color="tab:orange")
ax2.set_xlabel("k")
ax2.set_ylabel("mean silhouette")
ax2.set_title("Silhouette")
fig.tight_layout()
plt.show()
