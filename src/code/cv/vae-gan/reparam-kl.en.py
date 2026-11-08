# Reparameterization trick and KL(q || N(0, I)): Monte Carlo vs closed form
import numpy as np

rng = np.random.default_rng(0)
mu = np.array([1.0, -0.5])     # mean of q(z | x), 2 dimensions
sigma = np.array([0.5, 1.5])   # standard deviation of q(z | x)

# Closed-form KL between a diagonal Gaussian and N(0, I)
kl_exact = 0.5 * np.sum(mu**2 + sigma**2 - 1 - np.log(sigma**2))
print(f"closed form KL = {kl_exact:.4f}")


def log_normal(z, m, s):
    # Log density of a diagonal Gaussian, summed across dimensions
    return np.sum(-0.5 * ((z - m) / s) ** 2 - np.log(s)
                  - 0.5 * np.log(2 * np.pi), axis=1)


print("     n   KL (MC)   error")
for n in [10, 100, 1_000, 10_000, 100_000]:
    eps = rng.standard_normal((n, 2))   # noise independent of mu, sigma
    z = mu + sigma * eps                # reparameterization trick
    kl_mc = np.mean(log_normal(z, mu, sigma)
                    - log_normal(z, 0.0, 1.0))
    print(f"{n:>6}  {kl_mc:8.4f}  {kl_mc - kl_exact:+.4f}")

# z has the desired mean and standard deviation
print("mean of z:", np.round(z.mean(axis=0), 3))
print("std of z: ", np.round(z.std(axis=0), 3))

# Gradients flow through z = mu + sigma * eps (with eps held fixed):
# written in terms of eps, log q reduces to -log(sigma) + const,
# while -log p(z) = z^2 / 2 + const. Per-dimension derivatives:
# dKL/dmu = E[z], dKL/dsigma = E[z * eps] - 1 / sigma
grad_mu = z.mean(axis=0)
grad_sigma = (z * eps).mean(axis=0) - 1 / sigma
print("grad mu    MC:", np.round(grad_mu, 3), " exact:", mu)
print("grad sigma MC:", np.round(grad_sigma, 3),
      " exact:", np.round(sigma - 1 / sigma, 3))
