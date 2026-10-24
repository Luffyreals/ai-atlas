# Bóc tiêu đề, nội dung chính và liên kết từ một trang HTML cho sẵn.
from urllib.parse import urljoin

from bs4 import BeautifulSoup

URL = "https://example.com/blog/rag"  # địa chỉ giả định, không tải gì
HTML = """
<html><head><title>RAG là gì? | Blog</title></head>
<body>
  <nav><a href="/">Trang chủ</a> <a href="/blog/">Blog</a></nav>
  <article>
    <h1>RAG là gì?</h1>
    <p class="meta">Đăng ngày 01/10/2026</p>
    <p>RAG tìm đoạn văn liên quan rồi ghép vào prompt.</p>
    <p>Nhờ vậy mô hình trả lời dựa trên nguồn có thật.</p>
    <a href="embedding">Đọc tiếp: embedding</a>
  </article>
  <footer>© 2026 Blog</footer>
  <script>trackVisit();</script>
</body></html>
"""

soup = BeautifulSoup(HTML, "html.parser")  # parser có sẵn trong Python

# find trả thẻ đầu tiên khớp, hoặc None nếu không có
title = soup.find("title")
print("Tiêu đề:", title.get_text(strip=True) if title else None)
print("Thẻ h2:", soup.find("h2"))

# Chỉ lấy phần bài viết: bỏ menu, chân trang, script và dòng ngày đăng
article = soup.find("article")
paragraphs = [p.get_text(" ", strip=True)
              for p in article.select("p:not(.meta)")]
print("Nội dung:", " ".join(paragraphs))

# Liên kết tương đối thành tuyệt đối, để crawler đi tiếp được
for a in soup.find_all("a"):
    print("Liên kết:", urljoin(URL, a.get("href")))
