import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X, y = iris.data[:, 2:], iris.target  # hai đặc trưng cánh hoa (cm)
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.3, random_state=0, stratify=y)
model = make_pipeline(StandardScaler(), LogisticRegression())
model.fit(X_tr, y_tr)

# Tô màu mỗi điểm của lưới theo lớp có xác suất lớn nhất.
g1, g2 = np.meshgrid(np.linspace(0.5, 7.5, 300), np.linspace(0, 2.8, 300))
grid = np.c_[g1.ravel(), g2.ravel()]
region = model.predict(grid).reshape(g1.shape)
fig, ax = plt.subplots(figsize=(6, 4.5))
ax.contourf(g1, g2, region, levels=[-0.5, 0.5, 1.5, 2.5],
            colors=["#e8d5b7", "#c9d9c3", "#c7cfe0"])
for k, marker in enumerate(["o", "s", "^"]):
    pts = X_tr[y_tr == k]
    ax.scatter(pts[:, 0], pts[:, 1], marker=marker, edgecolor="k",
               facecolor="white", label=iris.target_names[k])
ax.set_xlabel("petal length (cm)")
ax.set_ylabel("petal width (cm)")
ax.legend(loc="upper left")
plt.show()

# Đánh giá trên tập test: hàng là lớp thật, cột là lớp dự đoán.
y_pred = model.predict(X_te)
print(confusion_matrix(y_te, y_pred))
print(classification_report(y_te, y_pred, digits=3,
                            target_names=iris.target_names))
