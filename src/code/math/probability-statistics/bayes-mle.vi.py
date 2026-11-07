import numpy as np

# 1. Định lý Bayes trong bài toán chẩn đoán y khoa
p_disease = 0.01
p_pos_given_d = 0.95
p_pos_given_nod = 0.05

# Tính xác suất toàn phần P(+) và xác suất hậu nghiệm P(D|+)
p_pos = p_pos_given_d * p_disease + p_pos_given_nod * (1.0 - p_disease)
p_disease_given_pos = (p_pos_given_d * p_disease) / p_pos

# In kết quả suy luận Bayes
print(f"Total positive P(+)  : {p_pos:.4f}")
print(f"Posterior P(D|+)     : {p_disease_given_pos:.4f}")

# 2. Ước lượng hợp lý cực đại (MLE) cho phân phối Bernoulli
data = np.array([1, 1, 1, 0, 1, 1, 0, 1, 1, 1])
k = np.sum(data)
n = len(data)
p_mle = k / n

# Tính Log-Likelihood tại nghiệm tối ưu p_mle và tại giá trị đối chứng 0.5
log_lik_mle = k * np.log(p_mle) + (n - k) * np.log(1.0 - p_mle)
log_lik_half = k * np.log(0.5) + (n - k) * np.log(0.5)

# In kết quả ước lượng hợp lý cực đại
print(f"MLE parameter (p_hat): {p_mle:.4f}")
print(f"Log-lik at p_mle     : {log_lik_mle:.4f}")
print(f"Log-lik at p=0.5     : {log_lik_half:.4f}")
