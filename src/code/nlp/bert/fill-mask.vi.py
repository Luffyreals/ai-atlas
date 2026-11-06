# BERT đa ngôn ngữ: điền chỗ trống, rồi so vectơ của "bay" trong ba câu
import torch
from transformers import AutoModel, AutoTokenizer, pipeline

MODEL = "google-bert/bert-base-multilingual-cased"
fill = pipeline("fill-mask", model=MODEL)
for text in ["Hà Nội là [MASK] đô của Việt Nam.",
             "I drink a cup of [MASK] every morning."]:
    print(text)
    for r in fill(text, top_k=5):  # 5 token có xác suất cao nhất
        print(f"  {r['token_str']:<8} {r['score']:.3f}")

tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModel.from_pretrained(MODEL)  # chỉ phần encoder, không có đầu MLM
model.eval()


def encode(sentence):
    enc = tok(sentence, return_tensors="pt")
    with torch.no_grad():
        h = model(**enc).last_hidden_state[0]  # (số token, 768)
    tokens = tok.convert_ids_to_tokens(enc["input_ids"][0])
    print(f"{tuple(h.shape)} {tokens}")
    return tokens, h


t1, h1 = encode("Con chim bay qua sông.")
t2, h2 = encode("Đàn chim bay về phía nam.")
t3, h3 = encode("Máy bay hạ cánh lúc tám giờ.")
v1, v2, v3 = (h[t.index("bay")] for t, h in [(t1, h1), (t2, h2), (t3, h3)])
cos = torch.nn.functional.cosine_similarity
print(f"cos(bird flies, birds fly) = {cos(v1, v2, dim=0):.3f}")
print(f"cos(bird flies, airplane)  = {cos(v1, v3, dim=0):.3f}")
print(f"cos(birds fly, airplane)   = {cos(v2, v3, dim=0):.3f}")
# Mốc so sánh: "bay" của câu 1 với một chữ khác hẳn ("về" của câu 2)
print(f"cos(bay, ve)               = {cos(v1, h2[t2.index('về')], dim=0):.3f}")
# Mốc nền: trung bình cosine giữa mọi cặp token của câu 1 và câu 3
n1 = torch.nn.functional.normalize(h1, dim=1)
n3 = torch.nn.functional.normalize(h3, dim=1)
print(f"mean cos, any token pair   = {(n1 @ n3.T).mean():.3f}")
