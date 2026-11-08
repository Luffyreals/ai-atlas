# Ask a small LLaVA-style model (LLaVA-OneVision 0.5B) about a synthetic image.
# First run downloads ~1.8 GB from Hugging Face.
import torch
from PIL import Image, ImageDraw
from transformers import AutoProcessor, LlavaOnevisionForConditionalGeneration

torch.manual_seed(0)
CKPT = "llava-hf/llava-onevision-qwen2-0.5b-ov-hf"
processor = AutoProcessor.from_pretrained(CKPT)


def draw(width, height):
    # White background, three red circles, and one blue square
    img = Image.new("RGB", (width, height), "white")
    pen = ImageDraw.Draw(img)
    for x in (60, 170, 280):
        pen.ellipse([x, 60, x + 80, 140], fill="red")
    pen.rectangle([150, 220, 250, 320], fill="blue")
    return img


def prompt_for(question):
    # Chat template inserts <image>; processor expands it to image tokens
    content = [{"type": "image"}, {"type": "text", "text": question}]
    chat = [{"role": "user", "content": content}]
    return processor.apply_chat_template(chat, add_generation_prompt=True)


IMG_ID = processor.tokenizer.convert_tokens_to_ids("<image>")

# 1) Count image tokens by image size (AnyRes): only needs the processor
for w, h in [(384, 384), (768, 384), (768, 768), (1152, 768)]:
    ids = processor(images=draw(w, h), text=prompt_for("Hi"),
                    return_tensors="pt")["input_ids"]
    print(f"{w}x{h}: {int((ids == IMG_ID).sum())} image tokens")

# 2) Ask the model about a 384x384 image (greedy decoding, no sampling)
model = LlavaOnevisionForConditionalGeneration.from_pretrained(
    CKPT, dtype=torch.float32).eval()
img = draw(384, 384)
for q in ["How many red circles are in the image?",
          "What color is the square?"]:
    inputs = processor(images=img, text=prompt_for(q), return_tensors="pt")
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=20, do_sample=False)
    answer = processor.decode(out[0, inputs["input_ids"].shape[1]:],
                              skip_special_tokens=True).strip()
    print(f"Q: {q}\nA: {answer}")
