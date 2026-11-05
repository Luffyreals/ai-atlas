from sklearn.datasets import load_wine
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# 178 wines, 13 chemical features, 3 grape cultivars (labels 0, 1, 2).
X, y = load_wine(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=0, stratify=y)
# Column 12 (proline) is thousands of times larger than column 10 (hue).
print(f"std: proline {X_train[:, 12].std():.1f}, "
      f"hue {X_train[:, 10].std():.3f}")
# Squared difference per column, for every (test, train) pair.
diff2 = (X_test[:, None, :] - X_train[None, :, :]) ** 2
print(f"proline share: {diff2[:, :, 12].sum() / diff2.sum():.2%}")

raw = KNeighborsClassifier(n_neighbors=5)
scaled = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
raw.fit(X_train, y_train)
scaled.fit(X_train, y_train)  # the scaler learns mean, std on train
print(f"raw    k = 5: test accuracy {raw.score(X_test, y_test):.3f}")
print(f"scaled k = 5: test accuracy {scaled.score(X_test, y_test):.3f}")

# Choose k by 5-fold cross-validation, on the training set only.
grid = GridSearchCV(scaled, {"kneighborsclassifier__n_neighbors":
                             list(range(1, 32, 2))}, cv=5)
grid.fit(X_train, y_train)
best_k = grid.best_params_["kneighborsclassifier__n_neighbors"]
print(f"best k = {best_k}, CV accuracy {grid.best_score_:.3f}")
print(f"test accuracy {grid.score(X_test, y_test):.3f}")
