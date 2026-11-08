# Multilingual BERT: fill-mask, then compare "bay" vectors across 3 sentences
import torch
from transformers import AutoModel, AutoTokenizer, pipeline

MODEL = "google-bert/bert-base-multilingual-cased"
fill = pipeline("fill-mask", model=MODEL)
for text in ["Hà Nội là [MASK] đô của Việt Nam.",  # data: vi
             "I drink a cup of [MASK] every morning."]:
    print(text)
    for r in fill(text, top_k=5):  # top 5 most probable tokens
        print(f"  {r['token_str']:<8} {r['score']:.3f}")

tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModel.from_pretrained(MODEL)  # encoder only, no MLM head
model.eval()


def encode(sentence):
    enc = tok(sentence, return_tensors="pt")
    with torch.no_grad():
        h = model(**enc).last_hidden_state[0]  # (num_tokens, 768)
    tokens = tok.convert_ids_to_tokens(enc["input_ids"][0])
    print(f"{tuple(h.shape)} {tokens}")
    return tokens, h


t1, h1 = encode("Con chim bay qua sông.")  # data: vi
t2, h2 = encode("Đàn chim bay về phía nam.")  # data: vi
t3, h3 = encode("Máy bay hạ cánh lúc tám giờ.")  # data: vi
v1, v2, v3 = (h[t.index("bay")] for t, h in [(t1, h1), (t2, h2), (t3, h3)])
cos = torch.nn.functional.cosine_similarity
print(f"cos(bird flies, birds fly) = {cos(v1, v2, dim=0):.3f}")
print(f"cos(bird flies, airplane)  = {cos(v1, v3, dim=0):.3f}")
print(f"cos(birds fly, airplane)   = {cos(v2, v3, dim=0):.3f}")
# Reference: "bay" in sentence 1 vs a different word in sentence 2; data: vi
print(f"cos(bay, ve)               = {cos(v1, h2[t2.index('về')], dim=0):.3f}")
# Baseline: mean cosine across all token pairs of sentences 1 and 3
n1 = torch.nn.functional.normalize(h1, dim=1)
n3 = torch.nn.functional.normalize(h3, dim=1)
print(f"mean cos, any token pair   = {(n1 @ n3.T).mean():.3f}")
