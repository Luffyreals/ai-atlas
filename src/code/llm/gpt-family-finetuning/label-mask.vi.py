# Chat template đồ chơi và nhãn -100: chỉ chấm lời của assistant
import numpy as np

messages = [
    {"role": "system", "content": "Trả lời ngắn."},
    {"role": "user", "content": "Thủ đô của Pháp là gì?"},
    {"role": "assistant", "content": "Đó là Paris."},
]


def render(msgs, add_generation_prompt=False):
    # Mỗi lượt: <|vai|> các từ <|end|>. Token tách theo khoảng trắng
    toks, scored = [], []
    for m in msgs:
        body = m["content"].split() + ["<|end|>"]
        toks += [f"<|{m['role']}|>"] + body
        scored += [False] + [m["role"] == "assistant"] * len(body)
    if add_generation_prompt:  # khi sinh: mở sẵn lượt của assistant
        toks.append("<|assistant|>")
        scored.append(False)
    return toks, scored


print(" ".join(render(messages[:2], add_generation_prompt=True)[0]))
print()

toks, scored = render(messages)  # khi huấn luyện: cả câu trả lời
vocab = {t: i for i, t in enumerate(dict.fromkeys(toks))}
ids = np.array([vocab[t] for t in toks])
labels = np.where(scored, ids, -100)  # -100: không tính loss

# Dịch một vị trí: đọc token t, đoán token t + 1
for t in range(len(toks) - 1):
    target = toks[t + 1] if labels[t + 1] != -100 else "-100"
    print(f"{toks[t]:>14} -> {target}")
print(f"scored: {(labels[1:] != -100).sum()} / {len(toks) - 1}")
