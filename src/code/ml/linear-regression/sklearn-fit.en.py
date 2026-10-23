import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression

# The 10 apartments (example data, made up for the lesson).
# area: floor area (m²), rent: rent (million VND/month).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])

# scikit-learn wants X as m rows (samples) by n columns (features). Here n = 1.
X = area.reshape(-1, 1)
model = LinearRegression().fit(X, rent)  # adds the bias b by itself
print(f"sklearn: w = {model.coef_[0]:.4f}, b = {model.intercept_:.4f}")

# Check against the one-feature formula from the Theory section.
dx = area - area.mean()
dy = rent - rent.mean()
w = np.sum(dx * dy) / np.sum(dx**2)
b = rent.mean() - w * area.mean()
print(f"formula: w = {w:.4f}, b = {b:.4f}")

# Predict two new apartments: 65 m² (inside the data) and 300 m² (far outside).
new_area = np.array([[65], [300]])
for a, p in zip(new_area[:, 0], model.predict(new_area)):
    print(f"{a} m² -> {p:.2f}")

# Plot the data and the best line, only over the range of the data.
xs = np.array([[20], [90]])
plt.scatter(area, rent, label="apartments")
plt.plot(xs, model.predict(xs), color="C1", label="best line")
plt.xlabel("Area (m²)")
plt.ylabel("Rent (million VND/month)")
plt.legend()
plt.show()
