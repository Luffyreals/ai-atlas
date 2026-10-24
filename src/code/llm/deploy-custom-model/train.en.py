# Train a small model and save it to a file, for the server to load later.
import joblib
import sklearn
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

data = load_iris()
# Labels are species names (strings), so the server returns names directly.
X = data.data
y = data.target_names[data.target]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=1, stratify=y
)

model = LogisticRegression(max_iter=500).fit(X_train, y_train)
print(f"Test accuracy: {model.score(X_test, y_test):.3f}")

# Save the model. The server must load it with this same scikit-learn version.
joblib.dump(model, "model.joblib")
print(f"Saved model.joblib (scikit-learn {sklearn.__version__})")
print("Classes:", ", ".join(model.classes_))
