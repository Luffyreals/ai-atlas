import numpy as np
import pandas as pd

# Sample apartment dataset containing a missing value (NaN)
data = {
    "district": ["Quan 1", "Quan 1", "Quan 3", "Quan 3", "Quan 7"],
    "area": [45.0, 70.0, 52.0, 85.0, 60.0],
    "bedrooms": [1.0, np.nan, 2.0, 3.0, 2.0],
    "price": [3.2, 5.8, 3.9, 6.5, 4.1],
}
df = pd.DataFrame(data)

# 1. Impute missing values with feature median
median_beds = df["bedrooms"].median()
df["bedrooms"] = df["bedrooms"].fillna(median_beds)

# 2. Filter apartments with area >= 60m2 using .loc
large_homes = df.loc[df["area"] >= 60.0, ["district", "area", "price"]]

# 3. Group by district and aggregate mean price and apartment count
summary = df.groupby("district").agg(
    avg_price=("price", "mean"),
    count=("price", "count"),
).round(2)

print("Summary table by district:")
print(summary)
