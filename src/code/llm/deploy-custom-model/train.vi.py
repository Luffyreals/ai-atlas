# Huấn luyện một mô hình nhỏ rồi lưu ra file, để server nạp lại sau.
import joblib
import sklearn
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

data = load_iris()
# Nhãn là tên loài hoa (chuỗi), nên server trả thẳng tên, không cần bảng tra.
X = data.data
y = data.target_names[data.target]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=1, stratify=y
)

model = LogisticRegression(max_iter=500).fit(X_train, y_train)
print(f"Độ chính xác trên tập kiểm tra: {model.score(X_test, y_test):.3f}")

# Lưu mô hình ra file. Server phải dùng đúng bản scikit-learn này để nạp.
joblib.dump(model, "model.joblib")
print(f"Đã lưu model.joblib (scikit-learn {sklearn.__version__})")
print("Các lớp:", ", ".join(model.classes_))
