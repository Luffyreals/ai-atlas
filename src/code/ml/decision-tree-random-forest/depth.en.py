from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# 569 tumors, 30 features; label 0 = malignant, 1 = benign
X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=0)

# Raise the maximum depth; None = grow until every leaf is pure
for depth in [1, 2, 3, 4, 5, 6, 8, 10, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0)
    tree.fit(X_train, y_train)
    acc_train = tree.score(X_train, y_train)  # accuracy
    acc_test = tree.score(X_test, y_test)
    print(f"max_depth={str(depth):4s} depth={tree.get_depth():2d} "
          f"leaves={tree.get_n_leaves():2d} "
          f"train={acc_train:.3f} test={acc_test:.3f}")

# Another brake: every leaf must hold at least 10 samples
tree = DecisionTreeClassifier(min_samples_leaf=10, random_state=0)
tree.fit(X_train, y_train)
print(f"min_samples_leaf=10: depth={tree.get_depth()} "
      f"leaves={tree.get_n_leaves()} "
      f"train={tree.score(X_train, y_train):.3f} "
      f"test={tree.score(X_test, y_test):.3f}")
