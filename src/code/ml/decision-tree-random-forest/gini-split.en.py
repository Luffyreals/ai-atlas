import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text

# 12 afternoons: rain (1 = yes), temperature (°C), strong wind (1 = yes).
rain = np.array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1])
temp = np.array([30, 35, 27, 32, 28, 25, 34, 31, 29, 36, 29, 26])
windy = np.array([0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1])
play = np.array([1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0])  # 1 = plays football


def gini(y):
    p = np.bincount(y, minlength=2) / len(y)  # share of each class
    return 1 - np.sum(p ** 2)


def entropy(y):
    p = np.bincount(y, minlength=2) / len(y)
    p = p[p > 0]  # convention: 0 * log 0 = 0
    return -np.sum(p * np.log2(p))


def score(f, y, mask):
    # Weighted average impurity of the two branches
    a, b = y[mask], y[~mask]
    return (len(a) * f(a) + len(b) * f(b)) / len(y)


print(f"root: gini = {gini(play):.4f}, entropy = {entropy(play):.4f}")
splits = {"rain <= 0.5": rain <= 0.5, "windy <= 0.5": windy <= 0.5,
          "temp <= 33": temp <= 33}
for name, mask in splits.items():
    g, h = score(gini, play, mask), score(entropy, play, mask)
    print(f"{name:13s} gini = {g:.4f}  gain = {entropy(play) - h:.4f}")

# Compare with scikit-learn's tree on the same table
X = np.column_stack([rain, temp, windy])
tree = DecisionTreeClassifier(random_state=0).fit(X, play)
print(export_text(tree, feature_names=["rain", "temp", "windy"],
                  class_names=["no", "yes"], show_weights=True))
