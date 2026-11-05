# Tóm tắt một đoạn tin tiếng Anh bằng T5-small với ba cách giải mã.
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, set_seed

NAME = "google-t5/t5-small"
tok = AutoTokenizer.from_pretrained(NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(NAME)

text = (
    "Heavy rain hit the central city of Hue on Monday, flooding more than "
    "2,000 homes and closing 40 schools. Local officials said the river "
    "rose 1.5 metres overnight, the highest level since 2020. About 3,000 "
    "people were moved to safer areas, and no deaths have been reported. "
    "Forecasters expect the rain to continue until Wednesday, and the city "
    "has asked residents to avoid low-lying roads."
)
# T5 biết cần làm việc gì nhờ tiền tố tác vụ ở đầu đầu vào
inputs = tok("summarize: " + text, return_tensors="pt")
print("input tokens:", inputs["input_ids"].shape[1])

settings = {
    "greedy": dict(num_beams=1, do_sample=False),
    "beam 4": dict(num_beams=4, do_sample=False),
    # top_k=0 tắt top-k (generate mặc định dùng top_k=50 khi lấy mẫu)
    "top-p 0.9": dict(do_sample=True, top_p=0.9, top_k=0),
}
for name, kwargs in settings.items():
    set_seed(0)  # cố định seed để lần lấy mẫu lặp lại được
    out = model.generate(**inputs, max_new_tokens=60, **kwargs)
    summary = tok.decode(out[0], skip_special_tokens=True)
    print(f"[{name}] {summary}")
