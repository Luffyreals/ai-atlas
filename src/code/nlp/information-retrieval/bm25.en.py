# Inverted index, BM25, and TF-IDF cosine on 10 FAQ answers
import math
from collections import Counter, defaultdict

docs = [  # whitespace-separated syllables, lowercased
    "cửa hàng mở cửa từ 8 giờ sáng đến 9 giờ tối mỗi ngày",  # data: vi
    "bạn có thể đổi trả sản phẩm trong 7 ngày nếu còn hóa đơn",  # data: vi
    "phí giao hàng nội thành 20 nghìn đơn trên 500 nghìn "  # data: vi
    "được miễn phí giao hàng",  # data: vi
    "cửa hàng nhận tiền mặt thẻ ngân hàng và ví điện tử",  # data: vi
    "điện thoại mua tại cửa hàng được bảo hành 12 tháng",  # data: vi
    "tai nghe bt200 đang giảm giá 15 phần trăm đến hết tháng này",  # data: vi
    "bạn có thể đặt hàng trực tuyến và nhận hàng tại cửa hàng",  # data: vi
    "sản phẩm lỗi do nhà sản xuất được đổi mới trong 30 ngày đầu",  # data: vi
    "cửa hàng có chỗ gửi xe máy miễn phí cho khách",  # data: vi
    "học sinh sinh viên được giảm 5 phần trăm khi xuất trình thẻ",  # data: vi
]
toks = [doc.split() for doc in docs]
N = len(docs)
avgdl = sum(len(t) for t in toks) / N  # average document length (in words)
print(f"N = {N}, avgdl = {avgdl:.1f}")

# inverted index: term -> {doc_id: term_frequency}
index = defaultdict(dict)
for j, t in enumerate(toks):
    for w, c in Counter(t).items():
        index[w][j] = c
for w in ["đổi", "giảm", "bt200", "hàng"]:  # data: vi
    print(w, "->", index[w])

def bm25(query, k1=1.2, b=0.75):
    score = defaultdict(float)
    for w in query.split():
        post = index.get(w, {})  # term not in corpus: skip
        n = len(post)
        idf = math.log(1 + (N - n + 0.5) / (n + 0.5))
        for j, tf in post.items():  # only visit docs containing w
            norm = 1 - b + b * len(toks[j]) / avgdl
            score[j] += idf * tf * (k1 + 1) / (tf + k1 * norm)
    return sorted(score.items(), key=lambda x: -x[1])

def tfidf_cos(query):  # default scikit-learn TF-IDF, then cosine
    idf = {w: math.log((1 + N) / (1 + len(p))) + 1 for w, p in index.items()}
    def vec(t):
        v = {w: c * idf[w] for w, c in Counter(t).items() if w in idf}
        s = math.sqrt(sum(x * x for x in v.values())) or 1.0
        return {w: x / s for w, x in v.items()}
    q = vec(query.split())
    score = {j: sum(q[w] * doc.get(w, 0) for w in q)
             for j, doc in enumerate(map(vec, toks))}
    return sorted(score.items(), key=lambda x: -x[1])

queries = ["đổi trả sản phẩm lỗi", "bt200 có giảm giá không",  # data: vi
           "hàng bị hỏng thì làm sao"]  # data: vi
for q in queries:
    print("query:", q)
    for name, f in [("bm25 ", bm25), ("tfidf", tfidf_cos)]:
        top = [(j, round(s, 2)) for j, s in f(q)[:3] if s > 0]
        print(" ", name, top)
