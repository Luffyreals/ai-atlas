import numpy as np

# 1. Bayes' Theorem for medical diagnosis problem
p_disease = 0.01
p_pos_given_d = 0.95
p_pos_given_nod = 0.05

# Compute total positive probability P(+) and posterior probability P(D|+)
p_pos = p_pos_given_d * p_disease + p_pos_given_nod * (1.0 - p_disease)
p_disease_given_pos = (p_pos_given_d * p_disease) / p_pos

# Print Bayesian inference results
print(f"Total positive P(+)  : {p_pos:.4f}")
print(f"Posterior P(D|+)     : {p_disease_given_pos:.4f}")

# 2. Maximum Likelihood Estimation (MLE) for Bernoulli trials
data = np.array([1, 1, 1, 0, 1, 1, 0, 1, 1, 1])
k = np.sum(data)
n = len(data)
p_mle = k / n

# Compute Log-Likelihood at optimal p_mle and reference baseline 0.5
log_lik_mle = k * np.log(p_mle) + (n - k) * np.log(1.0 - p_mle)
log_lik_half = k * np.log(0.5) + (n - k) * np.log(0.5)

# Print maximum likelihood estimation results
print(f"MLE parameter (p_hat): {p_mle:.4f}")
print(f"Log-lik at p_mle     : {log_lik_mle:.4f}")
print(f"Log-lik at p=0.5     : {log_lik_half:.4f}")
