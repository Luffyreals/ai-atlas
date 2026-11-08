# Ranking metrics: P@k, R@k, RR, AP, nDCG@k for two systems
import math

# human relevance grades for the query "what if an item is broken"
# (2: highly relevant, 1: relevant; unlisted documents have grade 0)
rel = {7: 2, 1: 1, 4: 1}
runs = {
    "A (bm25)": [6, 3, 2, 4, 8],  # top-5 from BM25 in the previous cell
    "B (dense)": [7, 4, 6, 1, 3],  # a hypothetical dense retriever
}

def precision_at(ranked, k):
    return sum(doc in rel for doc in ranked[:k]) / k

def recall_at(ranked, k):
    return sum(doc in rel for doc in ranked[:k]) / len(rel)

def reciprocal_rank(ranked):
    for i, doc in enumerate(ranked, start=1):
        if doc in rel:
            return 1 / i
    return 0.0  # no relevant document found

def average_precision(ranked):
    hits, total = 0, 0.0
    for i, doc in enumerate(ranked, start=1):
        if doc in rel:
            hits += 1
            total += hits / i  # precision at each relevant hit
    return total / len(rel)  # divide by all relevant documents

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
