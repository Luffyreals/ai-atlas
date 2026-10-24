# Score two prompts on a small labelled set of examples.
# The "model" answers here are simulated: written by hand to show
# common kinds of answers, not real output from a model.
LABELS = {"positive", "negative", "neutral"}
gold = ["positive", "negative", "neutral", "positive",
        "negative", "neutral", "positive", "negative"]

# Prompt A: vague, it only asks "What about this review?"
answers_a = ["Positive.",
             "This review is negative because the wait was long.",
             "neutral", "Positive", "Negative.",
             "Mixed: praises the drinks, criticizes the seating.",
             "Very positive!", "negative"]
# Prompt B: names the three labels and says "answer with one label only"
answers_b = ["positive", "negative", "neutral", "positive",
             "negative", "negative", "positive", "negative"]


def parse(text):
    """Normalize an answer; return None when it is not one label."""
    label = text.strip().lower().rstrip(".!")
    return label if label in LABELS else None


def score(name, answers):
    preds = [parse(a) for a in answers]
    m = len(gold)
    correct = sum(p == y for p, y in zip(preds, gold))
    invalid = sum(p is None for p in preds)
    # Case numbers (counting from 1) that are scored wrong
    wrong = [i + 1 for i in range(m) if preds[i] != gold[i]]
    print(f"{name}: accuracy = {correct / m:.3f}, "
          f"invalid = {invalid}, wrong = {wrong}")


score("A", answers_a)
score("B", answers_b)
print(f"one case = {1 / len(gold):.3f} of accuracy")
