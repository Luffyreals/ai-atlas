# Phân loại cảm xúc bằng DistilBERT đã fine-tune trên SST-2 (chỉ tiếng Anh)
from transformers import pipeline

clf = pipeline(
    "sentiment-analysis",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
)
texts = [
    "The food was delicious and the staff were friendly.",
    "The food was not good.",
    "Not bad at all.",
    "Great food, but the service was painfully slow.",
    # mỉa mai: chữ khen, ý chê
    "Great, another hour of waiting for cold soup.",
    # câu trung tính: mô hình vẫn phải chọn một trong hai nhãn
    "The restaurant opens at 9 am.",
]
for text, out in zip(texts, clf(texts)):
    print(f"{out['label']:<8} {out['score']:.3f}  {text}")
