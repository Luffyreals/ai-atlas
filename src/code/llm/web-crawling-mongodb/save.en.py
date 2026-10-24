# Save crawled pages to MongoDB, exactly one document per url.
import os
from datetime import datetime, timezone

from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

# The connection string may hold a password: read it from the environment
client = MongoClient(os.environ["MONGODB_URI"],
                     serverSelectionTimeoutMS=5000)
pages = client["atlas_demo"]["pages"]
pages.drop()  # drop the demo collection, so a rerun gives the same result

# Unique index: no two documents may have the same url
pages.create_index("url", unique=True)

now = datetime.now(timezone.utc)
pages.insert_many([
    {"url": "https://example.com/a", "title": "Page A",
     "text": "Content A.", "fetched_at": now},
    {"url": "https://example.com/b", "title": "Page B",
     "text": "Content B.", "fetched_at": now, "lang": "en"},
])

# Insert page A again with insert_one: the index stops it
try:
    pages.insert_one({"url": "https://example.com/a", "title": "A"})
except DuplicateKeyError:
    print("Duplicate url, not inserted.")

# Upsert: update the url when it exists, insert it when it does not
for page in [
    {"url": "https://example.com/a", "title": "Page A",
     "text": "Content A, new version.", "fetched_at": now},
    {"url": "https://example.com/c", "title": "Page C",
     "text": "Content C.", "fetched_at": now},
]:
    result = pages.update_one({"url": page["url"]}, {"$set": page},
                              upsert=True)
    print(page["url"], "matched:", result.matched_count,
          "inserted:", result.upserted_id is not None)

print("Documents:", pages.count_documents({}))
# find returns a cursor; the second argument picks the fields to return
for doc in pages.find({}, {"_id": 0, "url": 1, "text": 1}).sort("url"):
    print(doc)
print(pages.find_one({"lang": "en"}, {"_id": 0, "title": 1}))
