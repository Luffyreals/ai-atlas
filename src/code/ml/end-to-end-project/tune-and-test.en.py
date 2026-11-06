import pandas as pd
from sklearn.compose import make_column_transformer
from sklearn.datasets import load_diabetes
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import (GridSearchCV, KFold, cross_val_predict,
                                     train_test_split)
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

X, y = load_diabetes(return_X_y=True, as_frame=True, scaled=False)
y_bins = pd.qcut(y, 5, labels=False)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y_bins, random_state=0)
prep = make_column_transformer(
    (OneHotEncoder(drop="if_binary"), ["sex"]), remainder=StandardScaler())
pipe = make_pipeline(prep, Ridge())

# 1) Tune alpha with cross-validation, on the training set only
cv = KFold(n_splits=5, shuffle=True, random_state=0)
grid = {"ridge__alpha": [0.1, 1, 3, 10, 30, 100]}
search = GridSearchCV(pipe, grid, cv=cv, scoring="neg_mean_absolute_error")
search.fit(X_train, y_train)  # then refits on the whole training set
for a, s in zip(grid["ridge__alpha"], search.cv_results_["mean_test_score"]):
    print(f"alpha = {a:5g}: CV MAE = {-s:.2f}")

# 2) Error analysis on out-of-fold predictions (test set still unseen)
oof = cross_val_predict(search.best_estimator_, X_train, y_train, cv=cv)
# Mean error (y_hat - y) in 4 groups of y: positive means too high
group = pd.qcut(y_train, 4, labels=["low", "mid-low", "mid-high", "high"])
print((oof - y_train).groupby(group, observed=True).mean().round(1))

# 3) Score the test set ONCE, with the final model
pred = pd.Series(search.predict(X_test), index=y_test.index)
print(f"test MAE = {mean_absolute_error(y_test, pred):.1f}")
worst = (pred - y_test).abs().nlargest(3).index  # 3 largest errors
print(pd.DataFrame({"y": y_test[worst], "y_hat": pred[worst].round(),
                    "bmi": X_test.loc[worst, "bmi"]}))
