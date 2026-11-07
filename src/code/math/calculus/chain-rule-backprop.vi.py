# Giá trị đầu vào, nhãn và tham số ban đầu
x = 2.0
y = 7.0
w = 1.5
b = 0.5

# Lan truyền tiến (Forward pass): L = (w * x + b - y)^2
y_hat = w * x + b
loss = (y_hat - y) ** 2

# Lan truyền ngược từng bước bằng Quy tắc chuỗi (Chain Rule)
dL_dyhat = 2.0 * (y_hat - y)
dyhat_dw = x
dyhat_db = 1.0

# Kết hợp gradient theo quy tắc chuỗi: dL/dw = (dL/dy_hat) * (dy_hat/dw)
dL_dw = dL_dyhat * dyhat_dw
dL_db = dL_dyhat * dyhat_db

# Đạo hàm giải tích trực tiếp để kiểm chứng đối chiếu
direct_dL_dw = 2.0 * (w * x + b - y) * x
direct_dL_db = 2.0 * (w * x + b - y)

# In kết quả đối chiếu giữa lan truyền ngược và đạo hàm trực tiếp
print(f"Prediction (y_hat) : {y_hat:.4f}")
print(f"Loss (L)           : {loss:.4f}")
print(f"dL/dw (chain rule) : {dL_dw:.4f}")
print(f"dL/dw (direct)     : {direct_dL_dw:.4f}")
print(f"dL/db (chain rule) : {dL_db:.4f}")
print(f"dL/db (direct)     : {direct_dL_db:.4f}")
