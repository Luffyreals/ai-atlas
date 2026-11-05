# Đếm token của cùng một câu tiếng Việt và tiếng Anh bằng hai tokenizer thật
from transformers import AutoTokenizer

# Chỉ tải tokenizer (vài file từ vựng), không tải trọng số mô hình
NAMES = ["openai-community/gpt2",
         "google-bert/bert-base-multilingual-cased"]
SENTS = {"vi": "Học sinh đang học sinh học ở trường.",
         "en": "Students are studying biology at school."}
RARE = "nhường nhịn"  # từ ít gặp hơn

for text in SENTS.values():
    n_bytes = len(text.encode("utf-8"))  # chữ có dấu tốn 2-3 byte
    print(f"{len(text)} chars, {n_bytes} bytes: {text}")

for name in NAMES:
    tok = AutoTokenizer.from_pretrained(name)
    print(f"\n{name} (vocab {tok.vocab_size})")
    for lang, text in SENTS.items():
        pieces = tok.tokenize(text)  # các mảnh, chưa thêm token đặc biệt
        print(f"{lang}: {len(pieces)} tokens")
        print("   ", pieces)
    print("rare:", tok.tokenize(RARE))
    ids = tok(SENTS["en"])["input_ids"]  # mã số, có token đặc biệt
    print("ids:", ids)
    print("back:", tok.decode(ids))
