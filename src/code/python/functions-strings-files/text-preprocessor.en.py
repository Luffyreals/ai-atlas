from typing import List


def clean_text(
    raw_text: str,
    lowercase: bool = True,
    remove_punct: bool = True,
) -> List[str]:
    # Normalize leading and trailing whitespace
    text = raw_text.strip()
    if lowercase:
        text = text.lower()

    # Remove common punctuation marks
    if remove_punct:
        for char in [".", ",", "!", "?", ";"]:
            text = text.replace(char, "")

    # Split text into token list
    tokens = text.split()
    return tokens


# Test preprocessing function on raw input text
sample = "  AI and Deep Learning: Transforming the Future!  "
cleaned = clean_text(sample)

print(f"Raw string length: {len(sample)}")
print(f"Cleaned tokens: {cleaned}")
print(f"Token count: {len(cleaned)}")
print(f"Joined text: {' '.join(cleaned)}")
