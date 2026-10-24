# Ask an LLM to read a passage and return its triples as JSON.
import json
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # empty: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

RELATIONS = ["FOUNDED", "INVESTED_IN", "STUDIED_AT", "BASED_IN"]
SYSTEM = (
    "You extract knowledge triples from text. Return only a JSON object "
    'of the form {"triples": [{"subject": "...", "relation": "...", '
    '"object": "..."}]}. relation must be one of: '
    + ", ".join(RELATIONS)
    + ". Only record what the text states, do not guess. Write company "
    "and organization names as in the text, drop titles like Mr or Ms."
)
EXAMPLE_IN = "Mr Tung founded South Wind, a company based in Hue."
EXAMPLE_OUT = json.dumps({"triples": [
    {"subject": "Tung", "relation": "FOUNDED", "object": "South Wind"},
    {"subject": "South Wind", "relation": "BASED_IN", "object": "Hue"},
]}, ensure_ascii=False)
TEXT = (
    "Ms Lan graduated from Polytechnic University and founded Blue Cloud "
    "in 2021. It is based in Da Nang and was funded by Morning Star Fund."
)

response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": EXAMPLE_IN},  # one worked example
        {"role": "assistant", "content": EXAMPLE_OUT},
        {"role": "user", "content": TEXT},
    ],
    temperature=0,  # extraction: we want stable output
    response_format={"type": "json_object"},  # JSON mode; remove on 400
)
text = response.choices[0].message.content
try:
    items = json.loads(text)["triples"]
except (json.JSONDecodeError, KeyError, TypeError):
    items = None
if not isinstance(items, list):
    print("Could not parse JSON:", text)
    items = []
for item in items:  # do not trust the output: check every triple
    if not isinstance(item, dict) or item.get("relation") not in RELATIONS:
        print("Skipped (not in the schema):", item)
        continue
    s = " ".join(str(item.get("subject", "")).split())  # drop extra spaces
    o = " ".join(str(item.get("object", "")).split())
    if s and o:
        print((s, item["relation"], o))
    else:
        print("Skipped (empty name):", item)
