import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import (f1_score, precision_recall_curve,
                             precision_score, recall_score, roc_auc_score,
                             roc_curve)

# 20 patients (made-up illustration data), sorted by probability, high first.
y_true = np.array([1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
p = np.array([0.93, 0.86, 0.78, 0.71, 0.63, 0.58, 0.54, 0.46, 0.42, 0.36, 0.31, 0.27, 0.22, 0.18, 0.14, 0.12, 0.09, 0.07, 0.04, 0.02])

# Sweep the threshold from 0.1 to 0.9 in steps of 0.1.
print("   t      P      R     F1")
for t in np.round(np.arange(0.1, 0.95, 0.1), 2):
    y_pred = (p >= t).astype(int)
    P = precision_score(y_true, y_pred, zero_division=0)  # report 0 for 0/0
    R = recall_score(y_true, y_pred)
    F = f1_score(y_true, y_pred)
    print(f"{t:.2f}  {P:.3f}  {R:.3f}  {F:.3f}")

# Two curves: each point on a curve is one threshold.
prec, rec, _ = precision_recall_curve(y_true, p)
fpr, tpr, _ = roc_curve(y_true, p)
auc = roc_auc_score(y_true, p)
print(f"ROC AUC = {auc:.3f}")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4))
ax1.plot(rec, prec, marker="o")
ax1.axhline(y_true.mean(), ls="--", c="gray")  # random-guess level
ax1.set(xlabel="recall", ylabel="precision", title="Precision-recall")
ax2.plot(fpr, tpr, marker="o", label=f"model (AUC = {auc:.2f})")
ax2.plot([0, 1], [0, 1], ls="--", c="gray", label="random")
ax2.set(xlabel="false positive rate", ylabel="recall (TPR)", title="ROC")
ax2.legend()
plt.tight_layout()
plt.show()
