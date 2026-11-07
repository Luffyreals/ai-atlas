import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Thiết lập tham số phân phối chuẩn: kỳ vọng mu và độ lệch chuẩn sigma
mu, sigma = 2.0, 1.5
rng = np.random.default_rng(42)
samples = rng.normal(loc=mu, scale=sigma, size=5000)

# Kỳ vọng và phương sai thực nghiệm (empirical) từ mẫu ngẫu nhiên
emp_mean = np.mean(samples)
emp_var = np.var(samples)

# In so sánh giữa giá trị lý thuyết và kết quả thực nghiệm
print(f"Theoretical mean: {mu:.4f} | Empirical: {emp_mean:.4f}")
print(f"Theoretical var : {sigma**2:.4f} | Empirical: {emp_var:.4f}")

# Tạo lưới điểm tính hàm mật độ xác suất (PDF) bằng SciPy
x = np.linspace(mu - 4.0 * sigma, mu + 4.0 * sigma, 200)
pdf = stats.norm.pdf(x, loc=mu, scale=sigma)

# Vẽ biểu đồ phân bố mẫu cùng đường cong mật độ lý thuyết
fig, ax = plt.subplots(figsize=(6, 3.5))
ax.hist(samples, bins=50, density=True, alpha=0.5, label="Samples hist")
ax.plot(x, pdf, "r-", lw=2, label="Theoretical PDF")
ax.set_title("Gaussian Distribution N(2.0, 1.5^2)")
ax.set_xlabel("x")
ax.set_ylabel("Probability Density")
ax.legend()
plt.tight_layout()
plt.show()
