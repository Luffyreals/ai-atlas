import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Pure noise: 100 samples, 5000 random features, coin-flip labels.
# There is nothing to learn: an honest score is about 50%.
rng = np.random.default_rng(0)
X = rng.normal(size=(100, 5000))
y = rng.integers(0, 2, size=100)

# WRONG: pick the 20 "most relevant" features on ALL the data, then
# cross-validate. The selection step has seen the labels of every fold.
X_sel = SelectKBest(f_classif, k=20).fit_transform(X, y)
model = make_pipeline(StandardScaler(), LogisticRegression())
leak = cross_val_score(model, X_sel, y, cv=5)
print(f"select before split: {leak.mean():.3f}")

# RIGHT: put selection in the Pipeline; each fold selects on its train part.
pipe = make_pipeline(SelectKBest(f_classif, k=20), StandardScaler(),
                     LogisticRegression())
honest = cross_val_score(pipe, X, y, cv=5)
print(f"select inside pipeline: {honest.mean():.3f}")
