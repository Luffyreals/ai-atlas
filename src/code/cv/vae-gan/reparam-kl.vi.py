# Mẹo tham số hóa lại và KL(q || N(0, I)): Monte Carlo so với dạng đóng
import numpy as np

rng = np.random.default_rng(0)
mu = np.array([1.0, -0.5])     # trung bình của q(z | x), 2 chiều
sigma = np.array([0.5, 1.5])   # độ lệch chuẩn của q(z | x)

# KL dạng đóng giữa Gauss chéo và N(0, I)
kl_exact = 0.5 * np.sum(mu**2 + sigma**2 - 1 - np.log(sigma**2))
print(f"closed form KL = {kl_exact:.4f}")


def log_normal(z, m, s):
    # log mật độ của Gauss chéo, cộng theo từng chiều
    return np.sum(-0.5 * ((z - m) / s) ** 2 - np.log(s)
                  - 0.5 * np.log(2 * np.pi), axis=1)


print("     n   KL (MC)   error")
for n in [10, 100, 1_000, 10_000, 100_000]:
    eps = rng.standard_normal((n, 2))   # nhiễu không phụ thuộc mu, sigma
    z = mu + sigma * eps                # mẹo tham số hóa lại
    kl_mc = np.mean(log_normal(z, mu, sigma)
                    - log_normal(z, 0.0, 1.0))
    print(f"{n:>6}  {kl_mc:8.4f}  {kl_mc - kl_exact:+.4f}")

# z có đúng trung bình và độ lệch chuẩn mong muốn
print("mean of z:", np.round(z.mean(axis=0), 3))
print("std of z: ", np.round(z.std(axis=0), 3))

# Đạo hàm đi qua z = mu + sigma * eps (eps giữ cố định):
# viết theo eps, log q chỉ còn -log(sigma) + hằng số,
# còn -log p(z) = z^2 / 2 + hằng số. Đạo hàm từng chiều:
# dKL/dmu = E[z], dKL/dsigma = E[z * eps] - 1 / sigma
grad_mu = z.mean(axis=0)
grad_sigma = (z * eps).mean(axis=0) - 1 / sigma
print("grad mu    MC:", np.round(grad_mu, 3), " exact:", mu)
print("grad sigma MC:", np.round(grad_sigma, 3),
      " exact:", np.round(sigma - 1 / sigma, 3))
