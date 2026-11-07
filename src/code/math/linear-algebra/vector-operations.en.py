import numpy as np

# Create two vectors representing data / embeddings
u = np.array([1.0, 2.0, 3.0])
v = np.array([2.0, 4.0, 5.0])

# 1. Dot product
dot_product = np.dot(u, v)

# 2. L1 norm (Manhattan length) and L2 norm (Euclidean length)
norm_l1_u = np.linalg.norm(u, ord=1)
norm_l2_u = np.linalg.norm(u, ord=2)
norm_l2_v = np.linalg.norm(v, ord=2)

# 3. Cosine similarity
cos_sim = dot_product / (norm_l2_u * norm_l2_v)

# Print vector geometry analysis results
print(f"Dot product (u . v) : {dot_product:.4f}")
print(f"Norm L1 of u        : {norm_l1_u:.4f}")
print(f"Norm L2 of u (len)  : {norm_l2_u:.4f}")
print(f"Norm L2 of v (len)  : {norm_l2_v:.4f}")
print(f"Cosine similarity   : {cos_sim:.4f}")
