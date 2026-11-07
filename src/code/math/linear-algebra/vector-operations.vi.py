import numpy as np

# Tạo 2 vectơ biểu diễn dữ liệu / embeddings
u = np.array([1.0, 2.0, 3.0])
v = np.array([2.0, 4.0, 5.0])

# 1. Tích vô hướng (dot product)
dot_product = np.dot(u, v)

# 2. Chuẩn L1 (khoảng cách Manhattan) và chuẩn L2 (độ dài Euclid)
norm_l1_u = np.linalg.norm(u, ord=1)
norm_l2_u = np.linalg.norm(u, ord=2)
norm_l2_v = np.linalg.norm(v, ord=2)

# 3. Độ đo tương đồng Cosine (Cosine Similarity)
cos_sim = dot_product / (norm_l2_u * norm_l2_v)

# In kết quả phân tích hình học của vectơ
print(f"Dot product (u . v) : {dot_product:.4f}")
print(f"Norm L1 of u        : {norm_l1_u:.4f}")
print(f"Norm L2 of u (len)  : {norm_l2_u:.4f}")
print(f"Norm L2 of v (len)  : {norm_l2_v:.4f}")
print(f"Cosine similarity   : {cos_sim:.4f}")
