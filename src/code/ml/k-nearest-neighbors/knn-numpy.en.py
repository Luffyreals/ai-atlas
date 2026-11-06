import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

# Two interleaving "moons": 50 points, 2 features, label 0 or 1.
X, y = make_moons(n_samples=50, noise=0.3, random_state=11)
X = np.round(X, 2)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=0, stratify=y)

x_new = np.array([-0.4, 0.6])  # point to classify
k = 5

# Step 1: Euclidean distance from x_new to every training point.
dist = np.sqrt(((X_train - x_new) ** 2).sum(axis=1))
# Step 2: indices of the k nearest points.
nearest = np.argsort(dist)[:k]
for i in nearest:
    print(f"point {X_train[i]}, label {y_train[i]}, "
          f"distance {dist[i]:.3f}")

# Step 3: count the votes per class; the class with most votes wins.
votes = np.bincount(y_train[nearest], minlength=2)
print(f"votes: class 0 = {votes[0]}, class 1 = {votes[1]}")
print(f"k = {k}: predict {votes.argmax()}")
print(f"k = 1: predict {y_train[nearest[0]]}")
