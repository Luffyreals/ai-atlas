from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# 569 khối u, 30 đặc trưng; nhãn 0 = ác tính, 1 = lành tính
X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=0)

# Tăng dần độ sâu tối đa; None = để cây mọc tới khi mọi lá thuần
for depth in [1, 2, 3, 4, 5, 6, 8, 10, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0)
    tree.fit(X_train, y_train)
    acc_train = tree.score(X_train, y_train)  # accuracy
    acc_test = tree.score(X_test, y_test)
    print(f"max_depth={str(depth):4s} depth={tree.get_depth():2d} "
          f"leaves={tree.get_n_leaves():2d} "
          f"train={acc_train:.3f} test={acc_test:.3f}")

# Một cách hãm khác: mỗi lá phải có ít nhất 10 mẫu
tree = DecisionTreeClassifier(min_samples_leaf=10, random_state=0)
tree.fit(X_train, y_train)
print(f"min_samples_leaf=10: depth={tree.get_depth()} "
      f"leaves={tree.get_n_leaves()} "
      f"train={tree.score(X_train, y_train):.3f} "
      f"test={tree.score(X_test, y_test):.3f}")
