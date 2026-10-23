import matplotlib.pyplot as plt
import numpy as np

np.random.seed(0)  # fix the random numbers so every run draws the same picture

# 30 points around the line y = 2x + 1, plus some noise.
x = np.linspace(0, 10, 30)
y = 2 * x + 1 + np.random.randn(30)

plt.scatter(x, y, label="data")
plt.plot(x, 2 * x + 1, color="C1", label="y = 2x + 1")
plt.xlabel("x")
plt.ylabel("y")
plt.legend()
plt.show()

print("Mean of y:", round(y.mean(), 2))
