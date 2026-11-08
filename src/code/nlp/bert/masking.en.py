# Select and mask tokens for MLM as in BERT: 15%, then 80/10/10
import numpy as np

rng = np.random.default_rng(0)
# Pre-tokenized sentence (by syllable), with [CLS] and [SEP]; data: vi
tokens = ("[CLS] hà nội là thủ đô của việt nam , nơi có hơn một nghìn "
          "năm lịch sử và rất nhiều món ăn ngon . [SEP]").split()  # data: vi
special = {"[CLS]", "[SEP]"}
vocab = sorted(set(tokens) - special) + ["mèo", "sông", "xanh"]  # data: vi


def mask_tokens(toks, rng):
    out, picked = list(toks), []
    for i, t in enumerate(toks):
        if t in special or rng.random() >= 0.15:
            continue  # not selected: this position has no loss
        u = rng.random()
        if u < 0.8:
            out[i] = "[MASK]"  # 80%: replace with [MASK]
        elif u < 0.9:
            out[i] = vocab[rng.integers(len(vocab))]  # 10%: random token
        # remaining 10%: keep original token
        picked.append(i)
    return out, picked


out, picked = mask_tokens(tokens, rng)
print(" ".join(out))
print(f"{len(picked)} of {len(tokens) - 2} tokens picked")
for i in picked:
    print(f"pos {i:2d}: {tokens[i]:>6} -> {out[i]}")

# Count over 2000 simulated sentences, 126 tokens each (plus [CLS], [SEP])
n_sent, n_tok = 2000, 126
sel = rng.random((n_sent, n_tok)) < 0.15
u = rng.random((n_sent, n_tok))[sel]  # only consider selected positions
print(f"picked: {sel.mean():.4f}")
print(f"[MASK] {np.mean(u < 0.8):.3f}  random "
      f"{np.mean((u >= 0.8) & (u < 0.9)):.3f}  keep {np.mean(u >= 0.9):.3f}")
