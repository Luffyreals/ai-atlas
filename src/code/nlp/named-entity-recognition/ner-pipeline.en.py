# Named entity recognition with BERT fine-tuned on CoNLL-2003
from transformers import pipeline

text = ("Sundar Pichai met Nguyen Thi Lan at the Vietcombank office "
        "in Hanoi before flying to Berlin.")
ner = pipeline("ner", model="dslim/bert-base-NER")

# No aggregation: each token (including WordPiece ## pieces) gets B-/I-
for tok in ner(text, aggregation_strategy="none")[:11]:
    print(f"{tok['entity']:6} {tok['score']:.3f} {tok['word']}")

# Group tokens into entities in two ways:
# "simple" groups by each token's tag; "first" uses the first subword's tag
for strategy in ["simple", "first"]:
    print("---", strategy)
    for ent in ner(text, aggregation_strategy=strategy):
        word = text[ent["start"]:ent["end"]]
        print(f"{ent['entity_group']:4} {ent['score']:.3f} "
              f"[{ent['start']:2}, {ent['end']:2}) {word}")
