# Khởi tạo trọng số và siêu tham số
w = 5.0
lr = 0.1
tolerance = 1e-4
max_epochs = 50

# Vòng lặp tối ưu hóa mô phỏng
print(f"Initial weight: {w:.4f}")
for epoch in range(1, max_epochs + 1):
    grad = 2.0 * w
    w = w - lr * grad

    if abs(grad) < tolerance:
        print(f"Converged at epoch {epoch}")
        break

print(f"Final weight: {w:.6f}")
print(f"Final gradient: {grad:.6f}")
