# TF-IDF và cosine giữa các văn bản bằng scikit-learn
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

np.set_printoptions(precision=2, suppress=True)
docs = [
    "tôi ăn phở bò ở Hà Nội",
    "phở bò và bún chả Hà Nội",
    "con mèo nhà tôi rất lười",
    "đi ô tô từ Hà Nội về quê",
]
# Mẫu mặc định (?u)\b\w\w+\b bỏ mọi token một ký tự
default = TfidfVectorizer().fit(docs)
print("dropped:", sorted(set(" ".join(docs).lower().split())
                         - set(default.vocabulary_)))
# Giữ cả âm tiết một ký tự (\w cần văn bản ở dạng NFC)
vec = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")
X = vec.fit_transform(docs)          # ma trận thưa, mỗi hàng một văn bản
terms = vec.get_feature_names_out()
print("shape:", X.shape)
for t in ["hà", "phở", "mèo"]:
    print(f"idf({t}) = {vec.idf_[vec.vocabulary_[t]]:.3f}")
row = X[0].toarray().ravel()         # văn bản 0, đã chuẩn hóa L2
print("doc 0:", ", ".join(f"{terms[j]} {row[j]:.2f}"
                          for j in np.flatnonzero(row)))
print(f"norm doc 0 = {np.linalg.norm(row):.2f}")
print(cosine_similarity(X))
