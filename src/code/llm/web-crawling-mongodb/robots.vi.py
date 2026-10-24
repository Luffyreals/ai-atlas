# Đọc một robots.txt cho sẵn rồi hỏi: có được tải đường dẫn này không?
from urllib.robotparser import RobotFileParser

ROBOTS = """
User-agent: *
Disallow: /admin/
Disallow: /search
Crawl-delay: 2

User-agent: BadBot
Disallow: /
"""

robots = RobotFileParser()
robots.parse(ROBOTS.splitlines())  # phân tích chuỗi, không cần mạng

agent = "atlas-tutorial-bot/0.1"
paths = ["/", "/blog/rag", "/admin/users", "/Admin/users",
         "/search?q=ai", "/searching-tips"]
for path in paths:
    ok = robots.can_fetch(agent, "https://example.com" + path)
    print(f"{path:<16} {ok}")

print("crawl delay:", robots.crawl_delay(agent))
# BadBot có nhóm riêng, cấm cả site
print("BadBot /blog/rag:",
      robots.can_fetch("BadBot", "https://example.com/blog/rag"))
