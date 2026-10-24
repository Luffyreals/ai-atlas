# Extract information from a review as JSON, with retries and error handling.
import json
import os

import openai
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # empty: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
    max_retries=4,  # SDK retries temporary errors, waiting longer each time
    timeout=30,  # seconds to wait at most for each call (default 600)
)
MODEL = os.environ["LLM_MODEL"]

SYSTEM = (
    "You extract information from customer reviews. Return only a JSON "
    'object with two keys: "sentiment" (one of "positive", "negative", '
    '"mixed") and "aspects" (a list of the aspects the review mentions).'
)
review = "Lovely place, friendly staff, but the drinks are a bit pricey."

try:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": review},
        ],
        temperature=0,  # extraction: we want stable output, not creativity
        response_format={"type": "json_object"},  # JSON mode
    )
except openai.RateLimitError:
    print("Error 429: rate limit hit even after retries. Wait, then rerun.")
except openai.APIStatusError as e:
    # 400, 401, 404...: a problem with the request; retrying will not help
    print(f"Error {e.status_code}: {e.body}")  # the server's message
    print("Check the key, OPENAI_BASE_URL, LLM_MODEL. On error 400, try "
          "removing response_format or temperature.")
except openai.APIConnectionError:
    print("Could not reach the server, or the call timed out.")
else:
    text = response.choices[0].message.content
    try:
        data = json.loads(text)  # JSON mode output can still be cut off
    except (json.JSONDecodeError, TypeError):  # TypeError: text is None
        print("Could not parse JSON:", text)
    else:
        print(json.dumps(data, ensure_ascii=False, indent=2))
