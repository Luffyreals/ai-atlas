import matplotlib.pyplot as plt
import numpy as np

# Fix random seed for reproducible results
np.random.seed(42)

# Generate 2 feature clusters representing a binary classification task
c1_x = np.random.normal(loc=2.0, scale=0.6, size=30)
c1_y = np.random.normal(loc=2.0, scale=0.6, size=30)
c2_x = np.random.normal(loc=4.5, scale=0.7, size=30)
c2_y = np.random.normal(loc=4.5, scale=0.7, size=30)

# Create a scatter plot distinguishing two classes
fig, ax = plt.subplots(figsize=(6, 4))
ax.scatter(c1_x, c1_y, color="#2563eb", alpha=0.8, edgecolors="none", label="Class 0 (Normal)")
ax.scatter(c2_x, c2_y, color="#dc2626", alpha=0.8, edgecolors="none", label="Class 1 (Anomaly)")

# Mark the center of each cluster distribution
ax.scatter([2.0, 4.5], [2.0, 4.5], color="black", marker="x", s=80, linewidths=2, label="Cluster Center")

ax.set_title("Feature Space Scatter Plot", fontsize=11)
ax.set_xlabel("Feature X1", fontsize=10)
ax.set_ylabel("Feature X2", fontsize=10)
ax.grid(True, linestyle=":", alpha=0.5)
ax.legend(frameon=True)

plt.tight_layout()
plt.show()
