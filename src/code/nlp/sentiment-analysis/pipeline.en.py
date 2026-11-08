# Sentiment classification with DistilBERT fine-tuned on SST-2 (English only)
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
    # sarcasm: positive words, negative meaning
    "Great, another hour of waiting for cold soup.",
    # neutral sentence: the model still has to pick one of the two labels
    "The restaurant opens at 9 am.",
]
for text, out in zip(texts, clf(texts)):
    print(f"{out['label']:<8} {out['score']:.3f}  {text}")
