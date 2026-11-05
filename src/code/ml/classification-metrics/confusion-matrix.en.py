import numpy as np
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_score, recall_score)

# 20 patients (made-up illustration data), sorted by probability, high first.
# y_true: true label (1 = has the disease). p: predicted disease probability.
y_true = np.array([1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
p = np.array([0.93, 0.86, 0.78, 0.71, 0.63, 0.58, 0.54, 0.46, 0.42, 0.36, 0.31, 0.27, 0.22, 0.18, 0.14, 0.12, 0.09, 0.07, 0.04, 0.02])

t = 0.5  # decision threshold
y_pred = (p >= t).astype(int)  # predict positive when p >= t

# Count the four cells of the confusion matrix.
tp = np.sum((y_pred == 1) & (y_true == 1))
fp = np.sum((y_pred == 1) & (y_true == 0))
fn = np.sum((y_pred == 0) & (y_true == 1))
tn = np.sum((y_pred == 0) & (y_true == 0))
print(f"TP = {tp}, FP = {fp}, FN = {fn}, TN = {tn}")

accuracy = (tp + tn) / len(y_true)
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)  # harmonic mean
print(f"by hand: acc = {accuracy:.3f}, P = {precision:.3f}, "
      f"R = {recall:.3f}, F1 = {f1:.3f}")

# Check against scikit-learn.
print(confusion_matrix(y_true, y_pred))  # rows: true label 0, 1
print(f"sklearn: acc = {accuracy_score(y_true, y_pred):.3f}, "
      f"P = {precision_score(y_true, y_pred):.3f}, "
      f"R = {recall_score(y_true, y_pred):.3f}, "
      f"F1 = {f1_score(y_true, y_pred):.3f}")

# The "always predict healthy" model: accuracy is still high.
print(f"always 0: acc = {np.mean(y_true == 0):.3f}")
