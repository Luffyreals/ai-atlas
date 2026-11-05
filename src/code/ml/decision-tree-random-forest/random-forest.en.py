import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

data = load_breast_cancer()
X, y = data.data, data.target

# Five different train/test splits: how much do a tree and forest vary?
for seed in range(5):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=seed)
    tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
    forest = RandomForestClassifier(n_estimators=200, random_state=0)
    forest.fit(X_train, y_train)
    print(f"split {seed}: tree test={tree.score(X_test, y_test):.3f}  "
          f"forest test={forest.score(X_test, y_test):.3f}")

# The first split again, plus the OOB score (training set only)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=0)
forest = RandomForestClassifier(n_estimators=200, oob_score=True,
                                random_state=0).fit(X_train, y_train)
print(f"OOB accuracy = {forest.oob_score_:.3f}")
print(f"test accuracy = {forest.score(X_test, y_test):.3f}")
# F1 for the malignant class (label 0), the class we must catch
f1 = f1_score(y_test, forest.predict(X_test), pos_label=0)
print(f"test F1 (malignant) = {f1:.3f}")

# Top 5 features (mean decrease in Gini impurity)
order = np.argsort(forest.feature_importances_)[::-1][:5]
for j in order:
    print(f"{data.feature_names[j]:22s} {forest.feature_importances_[j]:.3f}")
