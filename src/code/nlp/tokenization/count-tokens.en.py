# Count tokens for the same sentence in Vietnamese and English
from transformers import AutoTokenizer

# Download only the tokenizer files (a few MB), not the model weights
NAMES = ["openai-community/gpt2",
         "google-bert/bert-base-multilingual-cased"]
SENTS = {"vi": "Học sinh đang học sinh học ở trường.",  # data: vi
         "en": "Students are studying biology at school."}
RARE = "nhường nhịn"  # data: vi; a less common compound

for text in SENTS.values():
    n_bytes = len(text.encode("utf-8"))  # accented letters take 2-3 bytes
    print(f"{len(text)} chars, {n_bytes} bytes: {text}")

for name in NAMES:
    tok = AutoTokenizer.from_pretrained(name)
    print(f"\n{name} (vocab {tok.vocab_size})")
    for lang, text in SENTS.items():
        pieces = tok.tokenize(text)  # subword pieces, without special tokens
        print(f"{lang}: {len(pieces)} tokens")
        print("   ", pieces)
    print("rare:", tok.tokenize(RARE))
    ids = tok(SENTS["en"])["input_ids"]  # token IDs, with special tokens
    print("ids:", ids)
    print("back:", tok.decode(ids))
