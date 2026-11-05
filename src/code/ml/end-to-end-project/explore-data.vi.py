import pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split

# 442 bệnh nhân, 10 đặc trưng ở đơn vị gốc (scaled=False)
X, y = load_diabetes(return_X_y=True, as_frame=True, scaled=False)
print(f"X: {X.shape}, y: {y.shape}")

# Chia NGAY từ đầu. Phân tầng theo 5 nhóm của y (mỗi nhóm 20% mẫu),
# để tập test có đủ bệnh nhân nhẹ, vừa và nặng.
y_bins = pd.qcut(y, 5, labels=False)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y_bins, random_state=0)
print(f"train: {len(X_train)}, test: {len(X_test)}")
# Từ đây, chỉ nhìn tập train.

pd.set_option("display.width", 79)
print(X_train.describe().T[["mean", "std", "min", "max"]].round(1))
print(X_train["sex"].value_counts().to_dict())

# Hệ số tương quan của từng đặc trưng với y
corr = X_train.corrwith(y_train).sort_values(ascending=False)
print(corr.round(2).to_dict())
print(f"y_train: mean = {y_train.mean():.1f}, "
      f"min = {y_train.min():.0f}, max = {y_train.max():.0f}")
