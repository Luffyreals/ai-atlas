import numpy as np
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_score, recall_score)

# 20 bệnh nhân (dữ liệu minh họa, tự tạo), xếp theo xác suất giảm dần.
# y_true: nhãn thật (1 = có bệnh). p: xác suất có bệnh mô hình dự đoán.
y_true = np.array([1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
p = np.array([0.93, 0.86, 0.78, 0.71, 0.63, 0.58, 0.54, 0.46, 0.42, 0.36, 0.31, 0.27, 0.22, 0.18, 0.14, 0.12, 0.09, 0.07, 0.04, 0.02])

t = 0.5  # ngưỡng quyết định
y_pred = (p >= t).astype(int)  # dự đoán dương khi p >= t

# Đếm bốn ô của ma trận nhầm lẫn.
tp = np.sum((y_pred == 1) & (y_true == 1))
fp = np.sum((y_pred == 1) & (y_true == 0))
fn = np.sum((y_pred == 0) & (y_true == 1))
tn = np.sum((y_pred == 0) & (y_true == 0))
print(f"TP = {tp}, FP = {fp}, FN = {fn}, TN = {tn}")

accuracy = (tp + tn) / len(y_true)
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)  # trung bình điều hòa
print(f"by hand: acc = {accuracy:.3f}, P = {precision:.3f}, "
      f"R = {recall:.3f}, F1 = {f1:.3f}")

# Đối chiếu với scikit-learn.
print(confusion_matrix(y_true, y_pred))  # hàng: nhãn thật 0, 1
print(f"sklearn: acc = {accuracy_score(y_true, y_pred):.3f}, "
      f"P = {precision_score(y_true, y_pred):.3f}, "
      f"R = {recall_score(y_true, y_pred):.3f}, "
      f"F1 = {f1_score(y_true, y_pred):.3f}")

# Mô hình "luôn đoán không bệnh": accuracy vẫn cao.
print(f"always 0: acc = {np.mean(y_true == 0):.3f}")
