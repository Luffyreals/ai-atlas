# Lưu các trang đã crawl vào MongoDB, mỗi url đúng một document.
import os
from datetime import datetime, timezone

from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

# Chuỗi kết nối có thể chứa mật khẩu: đọc từ biến môi trường
client = MongoClient(os.environ["MONGODB_URI"],
                     serverSelectionTimeoutMS=5000)
pages = client["atlas_demo"]["pages"]
pages.drop()  # xóa collection demo, để chạy lại vẫn ra cùng kết quả

# Chỉ mục duy nhất: hai document không thể có cùng url
pages.create_index("url", unique=True)

now = datetime.now(timezone.utc)
pages.insert_many([
    {"url": "https://example.com/a", "title": "Trang A",
     "text": "Nội dung A.", "fetched_at": now},
    {"url": "https://example.com/b", "title": "Trang B",
     "text": "Nội dung B.", "fetched_at": now, "lang": "vi"},
])

# Chèn lại trang A bằng insert_one: chỉ mục chặn lại
try:
    pages.insert_one({"url": "https://example.com/a", "title": "A"})
except DuplicateKeyError:
    print("Trùng url, không chèn thêm.")

# Upsert: url đã có thì cập nhật, chưa có thì thêm mới
for page in [
    {"url": "https://example.com/a", "title": "Trang A",
     "text": "Nội dung A, bản mới.", "fetched_at": now},
    {"url": "https://example.com/c", "title": "Trang C",
     "text": "Nội dung C.", "fetched_at": now},
]:
    result = pages.update_one({"url": page["url"]}, {"$set": page},
                              upsert=True)
    print(page["url"], "khớp:", result.matched_count,
          "thêm mới:", result.upserted_id is not None)

print("Số document:", pages.count_documents({}))
# find trả con trỏ; tham số thứ hai chọn trường cần lấy
for doc in pages.find({}, {"_id": 0, "url": 1, "text": 1}).sort("url"):
    print(doc)
print(pages.find_one({"lang": "vi"}, {"_id": 0, "title": 1}))
