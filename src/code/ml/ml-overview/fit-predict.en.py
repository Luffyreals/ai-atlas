import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsClassifier

# The 10 apartments (example data, made up for the lesson).
# area: floor area (m²), rent: rent (million VND/month).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])

# Input X: m = 10 rows (samples), n = 1 column (feature).
X = area.reshape(-1, 1)
new = np.array([[40], [65]])  # two new apartments, not in the table

# Regression: the label is a number (the rent).
reg = LinearRegression()
reg.fit(X, rent)  # learn from 10 examples
for a, p in zip(new[:, 0], reg.predict(new)):
    print(f"regression: {a} m² -> {p:.2f}")

# Classification: same input, label "expensive" (10 million+) or "cheap".
label = np.where(rent >= 10, "expensive", "cheap")

# This model looks at the 3 closest apartments in area, takes the majority.
clf = KNeighborsClassifier(n_neighbors=3)
clf.fit(X, label)  # still two steps: fit, then predict
for a, p in zip(new[:, 0], clf.predict(new)):
    print(f"classification: {a} m² -> {p}")
