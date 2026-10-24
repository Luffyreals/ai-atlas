# Tải vài trang một cách lịch sự: hỏi robots.txt, khai tên, giãn cách.
import time
from datetime import datetime, timezone
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

SITE = "https://example.com"  # đổi thành site bạn được phép crawl
PATHS = ["/", "/trang-khong-co/"]
# Khai thật bạn là ai và liên hệ ở đâu, đừng giả làm trình duyệt
HEADERS = {"User-Agent": "atlas-tutorial-bot/0.1 (+https://example.com/)"}
DELAY = 1.0  # giây giữa hai yêu cầu: gợi ý của bài, không phải chuẩn


def load_robots():
    """Tải robots.txt, xử lý mã trạng thái theo RFC 9309."""
    robots = RobotFileParser()
    try:
        r = requests.get(SITE + "/robots.txt", headers=HEADERS, timeout=10)
        status = r.status_code
    except requests.RequestException:
        status = 503  # không với tới được: xử lý như lỗi server
    if 200 <= status < 300:
        # RFC 9309: robots.txt phải mã hóa UTF-8
        robots.parse(r.content.decode("utf-8", "replace").splitlines())
    elif 400 <= status < 500 and status != 429:
        robots.parse(["User-agent: *", "Allow: /"])  # không lấy được tệp
    else:
        robots.parse(["User-agent: *", "Disallow: /"])  # 5xx, 429: cấm hết
    return robots


robots = load_robots()
agent = HEADERS["User-Agent"]
delay = max(DELAY, robots.crawl_delay(agent) or 0)
pages = []
for path in PATHS:
    url = SITE + path
    if not robots.can_fetch(agent, url):
        print("robots.txt cấm:", url)
        continue
    r = requests.get(url, headers=HEADERS, timeout=10)  # luôn có timeout
    print(r.status_code, url)
    if r.status_code in (429, 503):
        print("Site đang quá tải hoặc bảo chậm lại: dừng.")
        break
    if r.status_code == 200:
        soup = BeautifulSoup(r.content, "html.parser")
        title = soup.find("title")
        pages.append({
            "url": url,
            "title": title.get_text(strip=True) if title else "",
            "text": soup.get_text(" ", strip=True),
            "fetched_at": datetime.now(timezone.utc),
        })
    time.sleep(delay)

print("Số trang lấy được:", len(pages))
