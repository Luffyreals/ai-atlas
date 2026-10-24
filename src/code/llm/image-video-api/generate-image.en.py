# Generates an image from a prompt with images.generate, then saves it.
import base64
import os

import openai
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # unset: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
IMAGE_MODEL = os.environ["IMAGE_MODEL"]  # image model, not LLM_MODEL

prompt = (
    "Watercolor: a bicycle parked next to a sidewalk cafe "
    "in Hanoi, in the morning, soft sunlight."
)
try:
    response = client.images.generate(
        model=IMAGE_MODEL,
        prompt=prompt,
        size="1024x1024",
        n=1,
    )
except openai.BadRequestError as err:
    # Blocked by moderation, or a parameter the model does not accept.
    # Sending it again unchanged gives the same result: edit the prompt.
    print("Request refused:", err.code or err.message)
    raise SystemExit(1)

image = response.data[0]
if image.b64_json:  # the image comes back as a base64 string
    with open("generated.png", "wb") as f:
        f.write(base64.b64decode(image.b64_json))
    print("Saved generated.png")
else:  # some providers return a temporary URL: download it now
    print("Image URL:", image.url)
