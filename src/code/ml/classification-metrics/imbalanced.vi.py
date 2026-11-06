import numpy as np
from sklearn.datasets import make_classification
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score, recall_score
from sklearn.model_selection import train_test_split

# 2000 mẫu, chỉ khoảng 5% thuộc lớp dương (lớp 1).
X, y = make_classification(n_samples=2000, n_features=10, n_informative=4,
                           weights=[0.95, 0.05], class_sep=2.0,
                           random_state=0)
# Chia ba tập: train 60%, kiểm định 20%, test 20%, giữ tỉ lệ lớp.
X_tmp, X_test, y_tmp, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=0)
X_tr, X_val, y_tr, y_val = train_test_split(
    X_tmp, y_tmp, test_size=0.25, stratify=y_tmp, random_state=0)

# Mô hình "ngốc": luôn đoán lớp đa số (lớp 0).
dummy = DummyClassifier(strategy="most_frequent").fit(X_tr, y_tr)
d_pred = dummy.predict(X_test)
print(f"dummy: acc = {np.mean(d_pred == y_test):.3f}, "
      f"R = {recall_score(y_test, d_pred):.3f}")

# Hồi quy logistic với ngưỡng mặc định 0.5 (predict).
model = LogisticRegression().fit(X_tr, y_tr)
print(classification_report(y_test, model.predict(X_test), digits=3))

# Chọn ngưỡng trên tập KIỂM ĐỊNH (không phải tập test).
p_val = model.predict_proba(X_val)[:, 1]
ts = np.round(np.arange(0.05, 0.95, 0.05), 2)
f1s = [f1_score(y_val, (p_val >= t).astype(int)) for t in ts]
best_t = ts[int(np.argmax(f1s))]
print(f"best threshold on validation: {best_t:.2f}")

# Chấm một lần trên tập test với ngưỡng đã chọn.
p_test = model.predict_proba(X_test)[:, 1]
y_hat = (p_test >= best_t).astype(int)
print(classification_report(y_test, y_hat, digits=3))
