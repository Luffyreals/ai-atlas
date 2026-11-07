import matplotlib.pyplot as plt

# Simulated training metrics across 8 epochs
epochs = list(range(1, 9))
train_loss = [0.82, 0.55, 0.38, 0.27, 0.19, 0.14, 0.11, 0.08]
val_loss = [0.85, 0.58, 0.42, 0.33, 0.31, 0.30, 0.32, 0.35]

# Create Figure and Axes objects
fig, ax = plt.subplots(figsize=(6, 4))

# Plot training and validation loss curves
ax.plot(epochs, train_loss, marker="o", color="#2563eb", label="Train Loss")
ax.plot(epochs, val_loss, marker="s", color="#dc2626", linestyle="--", label="Val Loss")

# Configure title, axis labels, and grid
ax.set_title("Training and Validation Loss per Epoch", fontsize=11)
ax.set_xlabel("Epoch", fontsize=10)
ax.set_ylabel("Loss", fontsize=10)
ax.grid(True, linestyle=":", alpha=0.6)
ax.legend(frameon=True)

plt.tight_layout()
plt.show()
