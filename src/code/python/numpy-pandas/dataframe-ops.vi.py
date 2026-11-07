import numpy as np
import pandas as pd

# Tập dữ liệu căn hộ mẫu chứa một giá trị khuyết (NaN)
data = {
    "district": ["Quan 1", "Quan 1", "Quan 3", "Quan 3", "Quan 7"],
    "area": [45.0, 70.0, 52.0, 85.0, 60.0],
    "bedrooms": [1.0, np.nan, 2.0, 3.0, 2.0],
    "price": [3.2, 5.8, 3.9, 6.5, 4.1],
}
df = pd.DataFrame(data)

# 1. Điền giá trị khuyết bằng trung vị (median) của thuộc tính
median_beds = df["bedrooms"].median()
df["bedrooms"] = df["bedrooms"].fillna(median_beds)

# 2. Lọc các căn hộ diện tích >= 60m2 bằng thuộc tính .loc
large_homes = df.loc[df["area"] >= 60.0, ["district", "area", "price"]]

# 3. Gom nhóm theo quận và tổng hợp giá trung bình cùng số lượng căn hộ
summary = df.groupby("district").agg(
    avg_price=("price", "mean"),
    count=("price", "count"),
).round(2)

print("Summary table by district:")
print(summary)
