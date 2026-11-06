import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import MissingIndicator, SimpleImputer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# 8 căn hộ tự tạo; np.nan và None là ô bị thiếu.
df = pd.DataFrame({
    "area": [30, 45, np.nan, 60, 52, 38, 75, 41],
    "floor": [5, np.nan, 12, 3, 8, 2, 15, 6],
    "district": ["Cau Giay", "Ba Dinh", "Hoang Mai", "Cau Giay",
                 "Hoang Mai", "Ba Dinh", None, "Cau Giay"],
    "balcony": ["yes", "no", "yes", None, "no", "yes", "yes", "no"],
})
print(df.isna().sum().to_dict())  # số ô thiếu mỗi cột

# Cột số: điền trung vị rồi chuẩn hóa z-score.
num = make_pipeline(SimpleImputer(strategy="median"), StandardScaler())
# Cột phân loại: điền giá trị hay gặp nhất (mode) rồi one-hot.
cat = make_pipeline(SimpleImputer(strategy="most_frequent"),
                    OneHotEncoder(handle_unknown="ignore"))
prep = ColumnTransformer([
    ("num", num, ["area", "floor"]),
    ("miss", MissingIndicator(), ["area", "floor"]),  # cờ 1 = ô bị thiếu
    ("cat", cat, ["district", "balcony"]),
], verbose_feature_names_out=False)

X = prep.fit_transform(df)  # học trung vị, mode, mu, sigma rồi biến đổi
out = pd.DataFrame(X, columns=prep.get_feature_names_out())
out.columns = [c.replace("missingindicator_", "miss_") for c in out]
pd.set_option("display.width", 200)
pd.set_option("display.max_columns", None)
print(out.round(2))
sc = prep.named_transformers_["num"][-1]
print("mu =", sc.mean_.round(2), " sigma =", sc.scale_.round(2))
