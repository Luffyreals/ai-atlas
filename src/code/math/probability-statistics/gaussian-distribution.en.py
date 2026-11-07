import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Configure normal distribution parameters: mean mu and std sigma
mu, sigma = 2.0, 1.5
rng = np.random.default_rng(42)
samples = rng.normal(loc=mu, scale=sigma, size=5000)

# Compute empirical mean and empirical variance from random samples
emp_mean = np.mean(samples)
emp_var = np.var(samples)

# Print comparison between theoretical values and sample statistics
print(f"Theoretical mean: {mu:.4f} | Empirical: {emp_mean:.4f}")
print(f"Theoretical var : {sigma**2:.4f} | Empirical: {emp_var:.4f}")

# Generate grid points to evaluate probability density function (PDF)
x = np.linspace(mu - 4.0 * sigma, mu + 4.0 * sigma, 200)
pdf = stats.norm.pdf(x, loc=mu, scale=sigma)

# Plot empirical sample histogram with theoretical density curve
fig, ax = plt.subplots(figsize=(6, 3.5))
ax.hist(samples, bins=50, density=True, alpha=0.5, label="Samples hist")
ax.plot(x, pdf, "r-", lw=2, label="Theoretical PDF")
ax.set_title("Gaussian Distribution N(2.0, 1.5^2)")
ax.set_xlabel("x")
ax.set_ylabel("Probability Density")
ax.legend()
plt.tight_layout()
plt.show()
