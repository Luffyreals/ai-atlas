# BPE đồ chơi: học các phép gộp từ một bộ âm tiết có tần số
from collections import Counter

# Bộ âm tiết và số lần xuất hiện (cùng dữ liệu với hình BpeMergeViz)
WORDS = {"người": 8, "ngành": 3, "nghề": 4, "trường": 6,
         "đường": 5, "thương": 3, "nhà": 7}
END = "_"  # ký hiệu cuối âm tiết


def merge(symbols, pair):
    # Thay mọi chỗ hai ký hiệu kề nhau bằng pair bởi một ký hiệu gộp.
    out, i = [], 0
    while i < len(symbols):
        if tuple(symbols[i:i + 2]) == pair:
            out.append(pair[0] + pair[1])
            i += 2
        else:
            out.append(symbols[i])
            i += 1
    return out


# Lúc đầu mỗi âm tiết là dãy ký tự, thêm ký hiệu cuối
corpus = {w: list(w) + [END] for w in WORDS}
vocab = {s for syms in corpus.values() for s in syms}
print("start vocab:", len(vocab))
merges = []
for step in range(1, 13):
    pairs = Counter()  # đếm cặp kề nhau, nhân với tần số của âm tiết
    for w, syms in corpus.items():
        for pair in zip(syms, syms[1:]):
            pairs[pair] += WORDS[w]
    best = max(pairs, key=pairs.get)  # hòa thì lấy cặp gặp trước
    merges.append(best)
    corpus = {w: merge(syms, best) for w, syms in corpus.items()}
    print(f"{step:2d}: {best[0]} + {best[1]} ({pairs[best]})")
print("end vocab:", len(vocab) + len(merges))

# Tách âm tiết bằng cách áp lại các phép gộp theo đúng thứ tự đã học
for w in ["trường", "thương", "nhường", "nghiêng"]:
    syms = list(w) + [END]
    for pair in merges:
        syms = merge(syms, pair)
    print(w, "->", syms)
