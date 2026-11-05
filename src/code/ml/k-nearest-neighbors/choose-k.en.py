import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

# Same 50 points and same split as the first cell: 35 train, 15 test.
X, y = make_moons(n_samples=50, noise=0.3, random_state=11)
X = np.round(X, 2)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=0, stratify=y)

ks = range(1, 36, 2)  # odd k only, so votes never tie
acc_train, acc_test = [], []
for k in ks:
    model = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train)
    # A classifier's score() returns accuracy: correct / total.
    acc_train.append(model.score(X_train, y_train))
    acc_test.append(model.score(X_test, y_test))
    if k in (1, 3, 5, 7, 9, 15, 25, 35):
        print(f"k = {k:2d}: train {acc_train[-1]:.3f}, "
              f"test {acc_test[-1]:.3f}")

plt.plot(ks, acc_train, "o-", label="train")
plt.plot(ks, acc_test, "s--", label="test")
plt.xlabel("k")
plt.ylabel("accuracy")
plt.legend()
plt.show()
