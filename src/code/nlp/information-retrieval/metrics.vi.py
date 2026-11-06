# Các độ đo xếp hạng: P@k, R@k, RR, AP, nDCG@k cho hai hệ thống
import math

# mức liên quan do người chấm cho truy vấn "hàng bị hỏng thì làm sao"
# (2: rất liên quan, 1: liên quan; văn bản không có tên ở đây là 0)
rel = {7: 2, 1: 1, 4: 1}
runs = {
    "A (bm25)": [6, 3, 2, 4, 8],  # top-5 của BM25 ở ô trước
    "B (dense)": [7, 4, 6, 1, 3],  # một bộ truy xuất dày, giả định
}

def precision_at(ranked, k):
    return sum(doc in rel for doc in ranked[:k]) / k

def recall_at(ranked, k):
    return sum(doc in rel for doc in ranked[:k]) / len(rel)

def reciprocal_rank(ranked):
    for i, doc in enumerate(ranked, start=1):
        if doc in rel:
            return 1 / i
    return 0.0  # không tìm thấy văn bản liên quan nào

def average_precision(ranked):
    hits, total = 0, 0.0
    for i, doc in enumerate(ranked, start=1):
        if doc in rel:
            hits += 1
            total += hits / i  # precision tại đúng vị trí trúng
    return total / len(rel)  # chia cho mọi văn bản liên quan

def ndcg_at(ranked, k):
    dcg = sum(rel.get(doc, 0) / math.log2(i + 1)
              for i, doc in enumerate(ranked[:k], start=1))
    ideal = sorted(rel.values(), reverse=True)[:k]
    idcg = sum(g / math.log2(i + 1) for i, g in enumerate(ideal, start=1))
    return dcg / idcg

for name, ranked in runs.items():
    print(name)
    print(f"  P@3 = {precision_at(ranked, 3):.3f}"
          f"  R@3 = {recall_at(ranked, 3):.3f}"
          f"  R@5 = {recall_at(ranked, 5):.3f}")
    print(f"  RR = {reciprocal_rank(ranked):.3f}"
          f"  AP = {average_precision(ranked):.3f}"
          f"  nDCG@5 = {ndcg_at(ranked, 5):.3f}")
