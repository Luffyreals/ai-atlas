import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# 569 khối u, 30 đặc trưng. Nhãn: 0 = ác tính, 1 = lành tính.
data = load_breast_cancer()
X, y = data.data, data.target
print(f"m = {X.shape[0]}, n = {X.shape[1]}, benign = {y.mean():.3f}")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=0)

for C in [1.0, 1e10]:  # mặc định (phạt L2, C = 1) và gần như không phạt
    model = make_pipeline(StandardScaler(),
                          LogisticRegression(C=C, max_iter=10_000))
    model.fit(X_train, y_train)
    w = model[-1].coef_[0]
    print(f"C = {C:g}: train acc = {model.score(X_train, y_train):.3f}, "
          f"test acc = {model.score(X_test, y_test):.3f}, "
          f"max |w| = {np.abs(w).max():.1f}")

# Mô hình mặc định: 3 hệ số lớn nhất về trị tuyệt đối.
model = make_pipeline(StandardScaler(), LogisticRegression())
model.fit(X_train, y_train)
w = model[-1].coef_[0]
for j in np.argsort(-np.abs(w))[:3]:
    print(f"{data.feature_names[j]:>19}: w = {w[j]:+.3f}, "
          f"e^w = {np.exp(w[j]):.3f}")

# Xác suất lành tính của 5 khối u đầu tiên trong tập test.
proba = model.predict_proba(X_test[:5])[:, 1]
print("P(benign):", " ".join(f"{p:.3f}" for p in proba))
print("predicted:", model.predict(X_test[:5]), " true:", y_test[:5])
