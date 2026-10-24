# Toy chat template and -100 labels: only the assistant's words are scored
import numpy as np

messages = [
    {"role": "system", "content": "Answer briefly."},
    {"role": "user", "content": "What is the capital of France?"},
    {"role": "assistant", "content": "It is Paris."},
]


def render(msgs, add_generation_prompt=False):
    # Each turn: <|role|> words <|end|>. Tokens are split on whitespace
    toks, scored = [], []
    for m in msgs:
        body = m["content"].split() + ["<|end|>"]
        toks += [f"<|{m['role']}|>"] + body
        scored += [False] + [m["role"] == "assistant"] * len(body)
    if add_generation_prompt:  # at inference: open the assistant turn
        toks.append("<|assistant|>")
        scored.append(False)
    return toks, scored


print(" ".join(render(messages[:2], add_generation_prompt=True)[0]))
print()

toks, scored = render(messages)  # in training: the whole answer
vocab = {t: i for i, t in enumerate(dict.fromkeys(toks))}
ids = np.array([vocab[t] for t in toks])
labels = np.where(scored, ids, -100)  # -100: no loss here

# Shift by one: read token t, predict token t + 1
for t in range(len(toks) - 1):
    target = toks[t + 1] if labels[t + 1] != -100 else "-100"
    print(f"{toks[t]:>14} -> {target}")
print(f"scored: {(labels[1:] != -100).sum()} / {len(toks) - 1}")
