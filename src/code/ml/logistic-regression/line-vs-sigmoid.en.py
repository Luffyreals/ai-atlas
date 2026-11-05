import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression, LogisticRegression

# The 18 students from the first cell, plus one who studied 30 h and passed.
hours = np.array([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5,
                  5, 5.5, 6, 6.5, 7, 7.5, 8, 9, 10])
passed = np.array([0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1])
X, X30 = hours.reshape(-1, 1), np.append(hours, 30).reshape(-1, 1)
y30 = np.append(passed, 1)

grid = np.linspace(0, 32, 300).reshape(-1, 1)
fig, ax = plt.subplots(figsize=(7, 4))
ax.scatter(X30[:, 0], y30, color="black", zorder=3, label="students")
for name, Xt, yt, style in [("18", X, passed, "-"), ("19", X30, y30, "--")]:
    lin = LinearRegression().fit(Xt, yt)
    log = LogisticRegression(C=1e10).fit(Xt, yt)  # almost no penalty
    a, c = lin.coef_[0], lin.intercept_
    w, b = log.coef_[0, 0], log.intercept_[0]
    acc = np.mean((lin.predict(X) >= 0.5) == passed)  # first 18 only
    print(f"{name} students: line y = {a:.4f} x + {c:.4f}")
    print(f"  line: y^(0) = {c:.3f}, y^(10) = {a * 10 + c:.3f}, "
          f"y^(30) = {a * 30 + c:.3f}")
    print(f"  line threshold = {(0.5 - c) / a:.2f} h, accuracy = {acc:.3f}")
    print(f"  logistic threshold = {-b / w:.2f} h, "
          f"accuracy = {log.score(X, passed):.3f}")
    ax.plot(grid, lin.predict(grid), "tab:orange", ls=style,
            label=f"linear, {name} students")
    ax.plot(grid, log.predict_proba(grid)[:, 1], "tab:blue", ls=style,
            label=f"logistic, {name} students")
ax.axhline(0.5, color="gray", lw=0.8)
ax.set_xlabel("hours of study")
ax.set_ylabel("prediction")
ax.set_ylim(-0.3, 1.5)
ax.legend(fontsize=8)
plt.show()
