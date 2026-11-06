import pandas as pd
from sklearn.compose import make_column_transformer
from sklearn.datasets import load_diabetes
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Tải và chia giống hệt ô thứ nhất
X, y = load_diabetes(return_X_y=True, as_frame=True, scaled=False)
y_bins = pd.qcut(y, 5, labels=False)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y_bins, random_state=0)

# sex (1 hoặc 2) thành một cột 0/1; các cột khác chuẩn hóa
prep = make_column_transformer(
    (OneHotEncoder(drop="if_binary"), ["sex"]),
    remainder=StandardScaler())
models = {
    "baseline": DummyRegressor(strategy="median"),  # luôn đoán trung vị
    "ridge": Ridge(alpha=1.0),
    "forest": RandomForestRegressor(n_estimators=50, min_samples_leaf=5,
                                    random_state=0),
}
cv = KFold(n_splits=5, shuffle=True, random_state=0)
for name, model in models.items():
    pipe = make_pipeline(prep, model)  # tiền xử lý học lại trong mỗi fold
    scores = -cross_val_score(pipe, X_train, y_train, cv=cv,
                              scoring="neg_mean_absolute_error")
    print(f"{name:8s} CV MAE = {scores.mean():.1f} +/- {scores.std():.1f}")

# Thử thêm: MAE trên chính tập train của rừng, để so với CV
forest = make_pipeline(prep, models["forest"]).fit(X_train, y_train)
train_mae = (forest.predict(X_train) - y_train).abs().mean()
print(f"forest   train MAE = {train_mae:.1f}")
