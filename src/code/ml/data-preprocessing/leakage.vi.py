import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Nhiễu thuần: 100 mẫu, 5000 đặc trưng ngẫu nhiên, nhãn tung đồng xu.
# Không có quy luật nào để học: mô hình trung thực chỉ đúng khoảng 50%.
rng = np.random.default_rng(0)
X = rng.normal(size=(100, 5000))
y = rng.integers(0, 2, size=100)

# SAI: chọn 20 đặc trưng "liên quan nhất" trên TOÀN BỘ dữ liệu, rồi mới
# kiểm định chéo. Bước chọn đã nhìn thấy nhãn của các fold kiểm định.
X_sel = SelectKBest(f_classif, k=20).fit_transform(X, y)
model = make_pipeline(StandardScaler(), LogisticRegression())
leak = cross_val_score(model, X_sel, y, cv=5)
print(f"select before split: {leak.mean():.3f}")

# ĐÚNG: đặt bước chọn vào Pipeline; mỗi fold chỉ chọn trên phần train.
pipe = make_pipeline(SelectKBest(f_classif, k=20), StandardScaler(),
                     LogisticRegression())
honest = cross_val_score(pipe, X, y, cv=5)
print(f"select inside pipeline: {honest.mean():.3f}")
