# TF-IDF and cosine similarity between documents with scikit-learn
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

np.set_printoptions(precision=2, suppress=True)
docs = [
    "tôi ăn phở bò ở Hà Nội",  # data: vi
    "phở bò và bún chả Hà Nội",  # data: vi
    "con mèo nhà tôi rất lười",  # data: vi
    "đi ô tô từ Hà Nội về quê",  # data: vi
]
# Default pattern (?u)\b\w\w+\b drops all 1-character tokens
default = TfidfVectorizer().fit(docs)
print("dropped:", sorted(set(" ".join(docs).lower().split())
                         - set(default.vocabulary_)))
# Keep 1-character syllables too (\w requires NFC text)
vec = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")
X = vec.fit_transform(docs)          # sparse matrix, one row per document
terms = vec.get_feature_names_out()
print("shape:", X.shape)
for t in ["hà", "phở", "mèo"]:  # data: vi
    print(f"idf({t}) = {vec.idf_[vec.vocabulary_[t]]:.3f}")
row = X[0].toarray().ravel()         # document 0, L2-normalized
print("doc 0:", ", ".join(f"{terms[j]} {row[j]:.2f}"
                          for j in np.flatnonzero(row)))
print(f"norm doc 0 = {np.linalg.norm(row):.2f}")
print(cosine_similarity(X))
