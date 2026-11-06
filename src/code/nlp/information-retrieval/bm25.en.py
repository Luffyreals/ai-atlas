# Chỉ mục ngược, BM25 và TF-IDF cosine trên 10 câu hỏi thường gặp
import math
from collections import Counter, defaultdict

docs = [  # đã tách âm tiết bằng khoảng trắng, chữ thường
    "cửa hàng mở cửa từ 8 giờ sáng đến 9 giờ tối mỗi ngày",
    "bạn có thể đổi trả sản phẩm trong 7 ngày nếu còn hóa đơn",
    "phí giao hàng nội thành 20 nghìn đơn trên 500 nghìn "
    "được miễn phí giao hàng",
    "cửa hàng nhận tiền mặt thẻ ngân hàng và ví điện tử",
    "điện thoại mua tại cửa hàng được bảo hành 12 tháng",
    "tai nghe bt200 đang giảm giá 15 phần trăm đến hết tháng này",
    "bạn có thể đặt hàng trực tuyến và nhận hàng tại cửa hàng",
    "sản phẩm lỗi do nhà sản xuất được đổi mới trong 30 ngày đầu",
    "cửa hàng có chỗ gửi xe máy miễn phí cho khách",
    "học sinh sinh viên được giảm 5 phần trăm khi xuất trình thẻ",
]
toks = [doc.split() for doc in docs]
N = len(docs)
avgdl = sum(len(t) for t in toks) / N  # độ dài trung bình (số từ)
print(f"N = {N}, avgdl = {avgdl:.1f}")

# chỉ mục ngược: từ -> {số thứ tự văn bản: số lần từ xuất hiện}
index = defaultdict(dict)
for j, t in enumerate(toks):
    for w, c in Counter(t).items():
        index[w][j] = c
for w in ["đổi", "giảm", "bt200", "hàng"]:
    print(w, "->", index[w])

def bm25(query, k1=1.2, b=0.75):
    score = defaultdict(float)
    for w in query.split():
        post = index.get(w, {})  # từ không có trong kho: bỏ qua
        n = len(post)
        idf = math.log(1 + (N - n + 0.5) / (n + 0.5))
        for j, tf in post.items():  # chỉ duyệt văn bản chứa w
            norm = 1 - b + b * len(toks[j]) / avgdl
            score[j] += idf * tf * (k1 + 1) / (tf + k1 * norm)
    return sorted(score.items(), key=lambda x: -x[1])

def tfidf_cos(query):  # TF-IDF như scikit-learn mặc định, rồi cosine
    idf = {w: math.log((1 + N) / (1 + len(p))) + 1 for w, p in index.items()}
    def vec(t):
        v = {w: c * idf[w] for w, c in Counter(t).items() if w in idf}
        s = math.sqrt(sum(x * x for x in v.values())) or 1.0
        return {w: x / s for w, x in v.items()}
    q = vec(query.split())
    score = {j: sum(q[w] * doc.get(w, 0) for w in q)
             for j, doc in enumerate(map(vec, toks))}
    return sorted(score.items(), key=lambda x: -x[1])

queries = ["đổi trả sản phẩm lỗi", "bt200 có giảm giá không",
           "hàng bị hỏng thì làm sao"]
for q in queries:
    print("query:", q)
    for name, f in [("bm25 ", bm25), ("tfidf", tfidf_cos)]:
        top = [(j, round(s, 2)) for j, s in f(q)[:3] if s > 0]
        print(" ", name, top)
