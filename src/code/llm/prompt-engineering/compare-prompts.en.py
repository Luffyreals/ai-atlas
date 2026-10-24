# Compare a zero-shot and a few-shot prompt on the same small set.
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # unset: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

LABELS = {"positive", "negative", "neutral"}
CASES = [  # (review, correct label)
    ("Great coffee, friendly staff.", "positive"),
    ("Waited 40 minutes for a drink.", "negative"),
    ("The cafe opens at 7 a.m.", "neutral"),
    ("A bit pricey but worth it.", "positive"),
    ("Dry cake, not coming back.", "negative"),
    ("Drinks are fine, seats are a bit cramped.", "neutral"),
    ("Wonderful, I will recommend it to friends.", "positive"),
    ("Weak wifi, loud music, impossible to work.", "negative"),
]
SYSTEM = (
    "You classify the sentiment of reviews of a cafe.\n"
    "Labels: positive (praise, satisfied, even with a small complaint); "
    "negative (complaint, not satisfied); "
    "neutral (only facts, or praise and complaint in equal measure).\n"
    "The review sits between the <comment> and </comment> tags.\n"
    "Answer with exactly one label, lowercase, no explanation."
)


def wrap(text):
    return f"<comment>{text}</comment>"


SHOTS = [  # Few-shot: one pair per label, none from the test set
    {"role": "user", "content": wrap("The staff greeted us warmly.")},
    {"role": "assistant", "content": "positive"},
    {"role": "user", "content": wrap("A drink got spilled; nobody wiped it.")},
    {"role": "assistant", "content": "negative"},
    {"role": "user", "content": wrap("They also sell sandwiches.")},
    {"role": "assistant", "content": "neutral"},
]


def classify(text, shots):
    messages = [{"role": "system", "content": SYSTEM}, *shots,
                {"role": "user", "content": wrap(text)}]
    response = client.chat.completions.create(
        model=MODEL, messages=messages, temperature=0)
    answer = response.choices[0].message.content or ""
    label = answer.strip().lower().rstrip(".!")
    return label if label in LABELS else None  # None: wrong format


for name, shots in [("zero-shot", []), ("few-shot", SHOTS)]:
    preds = [classify(text, shots) for text, _ in CASES]
    correct = sum(p == y for p, (_, y) in zip(preds, CASES))
    invalid = sum(p is None for p in preds)
    print(f"{name}: correct {correct}/{len(CASES)}, wrong format {invalid}")
