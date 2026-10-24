# Truy xuất bằng TF-IDF trên 5 chunk của một sổ tay nhân viên
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

chunks = {
    "leave": "Nhân viên chính thức có 12 ngày nghỉ phép năm có lương. "
             "Ngày phép chưa dùng hết được chuyển sang quý một năm sau.",
    "remote": "Mỗi tuần, nhân viên được làm việc từ xa tối đa hai ngày, "
              "nếu trưởng nhóm đồng ý trước.",
    "laptop": "Công ty cấp máy tính xách tay cho nhân viên mới. Máy hỏng "
              "thì báo bộ phận IT để sửa hoặc đổi máy khác.",
    "salary": "Lương được chuyển khoản vào ngày 5 hằng tháng. Nếu ngày 5 "
              "rơi vào ngày nghỉ, lương được chuyển vào ngày làm việc "
              "liền trước.",
    "insurance": "Công ty đóng bảo hiểm y tế cho nhân viên từ tháng đầu "
                 "tiên. Thẻ bảo hiểm được gửi qua email trong vòng hai tuần.",
}
names = list(chunks)

# Mỗi hàng của X là vectơ TF-IDF của một chunk, đã chuẩn hóa về độ dài 1
vec = TfidfVectorizer()
X = vec.fit_transform(chunks.values())
print("X shape:", X.shape)


def search(label, question, k=3):
    q = vec.transform([question])  # dùng đúng bộ từ vựng của các chunk
    scores = (X @ q.T).toarray().ravel()  # độ dài 1 nên tích vô hướng = cosine
    top = np.argsort(-scores, kind="stable")[:k]  # k chunk điểm cao nhất
    print(label, " | ".join(f"{names[i]} {scores[i]:.3f}" for i in top))


search("Q1:", "Một năm tôi có bao nhiêu ngày nghỉ phép?")
# Cùng một ý, hai cách hỏi: khác từ và dùng chung từ với chunk "remote"
search("Q2:", "Tôi có thể ở nhà làm không?")
search("Q3:", "Tôi có được làm việc từ xa không?")
