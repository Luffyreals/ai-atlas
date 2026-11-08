# Summarize an English news paragraph with T5-small in three decoding modes.
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
# T5 knows which task to run from the task prefix at the start of the input
inputs = tok("summarize: " + text, return_tensors="pt")
print("input tokens:", inputs["input_ids"].shape[1])

settings = {
    "greedy": dict(num_beams=1, do_sample=False),
    "beam 4": dict(num_beams=4, do_sample=False),
    # top_k=0 disables top-k (generate defaults to top_k=50 when sampling)
    "top-p 0.9": dict(do_sample=True, top_p=0.9, top_k=0),
}
for name, kwargs in settings.items():
    set_seed(0)  # fix the seed so the sampling run is reproducible
    out = model.generate(**inputs, max_new_tokens=60, **kwargs)
    summary = tok.decode(out[0], skip_special_tokens=True)
    print(f"[{name}] {summary}")
