# QA trích xuất bằng DistilBERT fine-tune trên SQuAD 1.1: logit đầu/cuối
import torch
from transformers import AutoModelForQuestionAnswering, AutoTokenizer

NAME = "distilbert/distilbert-base-cased-distilled-squad"
tok = AutoTokenizer.from_pretrained(NAME)
model = AutoModelForQuestionAnswering.from_pretrained(NAME).eval()

context = (
    "Ha Long Bay is in Quang Ninh province, in northeast Vietnam. "
    "It has nearly 2,000 limestone islands and islets. UNESCO first "
    "inscribed the bay as a World Heritage Site in 1994, and again "
    "in 2000 for its geology. Tourists usually explore it by boat."
)
questions = [
    "When was Ha Long Bay first inscribed as a World Heritage Site?",
    "Which province is Ha Long Bay in?",
    "How deep is the water in Ha Long Bay?",  # đoạn văn không nói
]


def answer(q, max_len=15):
    enc = tok(q, context, return_tensors="pt",
              return_offsets_mapping=True)
    offsets = enc.pop("offset_mapping")[0]
    in_ctx = torch.tensor([k == 1 for k in enc.sequence_ids(0)])
    with torch.no_grad():
        out = model(**enc)
    s, e = out.start_logits[0], out.end_logits[0]
    null = (s[0] + e[0]).item()  # điểm của [CLS]
    s = s.masked_fill(~in_ctx, -1e4)  # chỉ chọn token của đoạn văn
    e = e.masked_fill(~in_ctx, -1e4)
    score = s[:, None] + e[None, :]  # score[i, j] = s_i + e_j
    n = len(s)
    ok = torch.ones(n, n).triu().tril(max_len - 1).bool()
    score = score.masked_fill(~ok, -1e4)  # bỏ j < i và span quá dài
    i, j = divmod(int(score.argmax()), n)
    p = s.softmax(0)[i] * e.softmax(0)[j]  # xác suất của span
    a, b = int(offsets[i][0]), int(offsets[j][1])
    return context[a:b], p.item(), a, b, score[i, j].item(), null


for q in questions:
    text, p, a, b, best, null = answer(q)
    print(q)
    print(f"  answer={text!r} p={p:.3f} start={a} end={b}")
    print(f"  best span score={best:.2f}  [CLS] score={null:.2f}")
