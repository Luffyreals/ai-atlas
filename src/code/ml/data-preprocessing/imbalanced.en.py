import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.model_selection import train_test_split

# 2000 samples; class 1 (the minority) is only about 5%.
X, y = make_classification(n_samples=2000, n_features=5, n_informative=2,
                           n_redundant=0, weights=[0.95, 0.05],
                           random_state=2)
# stratify=y: train and test keep the same class ratio.
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3,
                                          stratify=y, random_state=0)
print(f"positives: train {y_tr.sum()}/{len(y_tr)}, "
      f"test {y_te.sum()}/{len(y_te)}")

# Random oversampling, on the training set ONLY: redraw class-1
# samples with replacement until they match class 0.
rng = np.random.default_rng(0)
pos, neg = np.where(y_tr == 1)[0], np.where(y_tr == 0)[0]
extra = rng.choice(pos, size=len(neg) - len(pos), replace=True)
idx = np.concatenate([neg, pos, extra])
X_os, y_os = X_tr[idx], y_tr[idx]

def report(name, model, X_fit, y_fit, threshold=0.5):
    model.fit(X_fit, y_fit)
    p = model.predict_proba(X_te)[:, 1]  # probability of class 1
    y_hat = (p >= threshold).astype(int)
    pr, rc, f1, _ = precision_recall_fscore_support(
        y_te, y_hat, average="binary", zero_division=0)
    acc = accuracy_score(y_te, y_hat)
    print(f"{name:<14} acc={acc:.3f} P={pr:.3f} R={rc:.3f} F1={f1:.3f}")

# Threshold 0.2 is fixed for illustration; pick it on a validation set.
report("plain", LogisticRegression(), X_tr, y_tr)
report("threshold 0.2", LogisticRegression(), X_tr, y_tr, threshold=0.2)
report("balanced", LogisticRegression(class_weight="balanced"), X_tr, y_tr)
report("oversample", LogisticRegression(), X_os, y_os)
