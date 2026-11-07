import matplotlib.pyplot as plt

# Dữ liệu mô phỏng quá trình huấn luyện qua 8 epoch
epochs = list(range(1, 9))
train_loss = [0.82, 0.55, 0.38, 0.27, 0.19, 0.14, 0.11, 0.08]
val_loss = [0.85, 0.58, 0.42, 0.33, 0.31, 0.30, 0.32, 0.35]

# Tạo khung hình (Figure) và hệ trục tọa độ (Axes)
fig, ax = plt.subplots(figsize=(6, 4))

# Vẽ đường mất mát huấn luyện (Train) và kiểm định (Val)
ax.plot(epochs, train_loss, marker="o", color="#2563eb", label="Train Loss")
ax.plot(epochs, val_loss, marker="s", color="#dc2626", linestyle="--", label="Val Loss")

# Cấu hình tiêu đề, nhãn trục tọa độ và đường lưới
ax.set_title("Training and Validation Loss per Epoch", fontsize=11)
ax.set_xlabel("Epoch", fontsize=10)
ax.set_ylabel("Loss", fontsize=10)
ax.grid(True, linestyle=":", alpha=0.6)
ax.legend(frameon=True)

plt.tight_layout()
plt.show()
