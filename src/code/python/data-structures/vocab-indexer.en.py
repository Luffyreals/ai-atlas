# Input text corpus for vocabulary building
corpus = [
    "deep learning with python",
    "machine learning and deep neural networks",
    "python for machine learning",
]

# Extract unique words using set
unique_words = set()
for text in corpus:
    for word in text.split():
        unique_words.add(word)

# Build two-way lookup tables between words and token identifiers
sorted_words = sorted(unique_words)
word_to_id = {w: idx for idx, w in enumerate(sorted_words)}
id_to_word = {idx: w for w, idx in word_to_id.items()}

# Test lookup with a query token
query = "learning"
token_id = word_to_id.get(query, -1)

print(f"Vocabulary size: {len(word_to_id)}")
print(f"Token '{query}' -> id: {token_id}")
print(f"Token id {token_id} -> '{id_to_word[token_id]}'")
print(f"First 3 words: {sorted_words[:3]}")
