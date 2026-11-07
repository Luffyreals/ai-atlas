import json
import os
import tempfile

# Dữ liệu nhật ký huấn luyện mô hình qua các epoch
history = {
    "model": "SimpleLinear",
    "epochs": 3,
    "metrics": [
        {"epoch": 1, "loss": 0.452, "val_loss": 0.490},
        {"epoch": 2, "loss": 0.285, "val_loss": 0.310},
        {"epoch": 3, "loss": 0.150, "val_loss": 0.182},
    ],
}

# Ghi nhật ký huấn luyện ra tệp JSON an toàn với context manager
filepath = os.path.join(tempfile.gettempdir(), "training_log.json")
with open(filepath, "w", encoding="utf-8") as f:
    json.dump(history, f, indent=2)

# Đọc lại và kiểm tra số liệu đã lưu
with open(filepath, "r", encoding="utf-8") as f:
    loaded_data = json.load(f)

last_epoch = loaded_data["metrics"][-1]
print(f"Model saved: {loaded_data['model']}")
print(f"Total epochs logged: {len(loaded_data['metrics'])}")
print(f"Final loss: {last_epoch['loss']:.4f}")
print(f"Final val_loss: {last_epoch['val_loss']:.4f}")

# Dọn dẹp tệp nhật ký tạm
os.remove(filepath)
