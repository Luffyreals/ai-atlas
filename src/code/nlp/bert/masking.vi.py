# Chọn và che token cho MLM theo cách của BERT: 15%, rồi 80/10/10
import numpy as np

rng = np.random.default_rng(0)
# Một câu đã tách token (theo âm tiết, để dễ đọc), có [CLS] và [SEP]
tokens = ("[CLS] hà nội là thủ đô của việt nam , nơi có hơn một nghìn "
          "năm lịch sử và rất nhiều món ăn ngon . [SEP]").split()
special = {"[CLS]", "[SEP]"}
vocab = sorted(set(tokens) - special) + ["mèo", "sông", "xanh"]


def mask_tokens(toks, rng):
    out, picked = list(toks), []
    for i, t in enumerate(toks):
        if t in special or rng.random() >= 0.15:
            continue  # không chọn: vị trí này không tính loss
        u = rng.random()
        if u < 0.8:
            out[i] = "[MASK]"  # 80%: thay bằng [MASK]
        elif u < 0.9:
            out[i] = vocab[rng.integers(len(vocab))]  # 10%: token ngẫu nhiên
        # 10% còn lại: giữ nguyên token gốc
        picked.append(i)
    return out, picked


out, picked = mask_tokens(tokens, rng)
print(" ".join(out))
print(f"{len(picked)} of {len(tokens) - 2} tokens picked")
for i in picked:
    print(f"pos {i:2d}: {tokens[i]:>6} -> {out[i]}")

# Đếm trên 2000 câu giả lập, mỗi câu 126 token (cộng [CLS], [SEP])
n_sent, n_tok = 2000, 126
sel = rng.random((n_sent, n_tok)) < 0.15
u = rng.random((n_sent, n_tok))[sel]  # chỉ xét các vị trí được chọn
print(f"picked: {sel.mean():.4f}")
print(f"[MASK] {np.mean(u < 0.8):.3f}  random "
      f"{np.mean((u >= 0.8) & (u < 0.9)):.3f}  keep {np.mean(u >= 0.9):.3f}")
