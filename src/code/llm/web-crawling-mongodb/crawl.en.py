# Fetch a few pages politely: check robots.txt, say who you are, wait.
import time
from datetime import datetime, timezone
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

SITE = "https://example.com"  # change to a site you may crawl
PATHS = ["/", "/no-such-page/"]
# Say honestly who you are and how to reach you; do not pose as a browser
HEADERS = {"User-Agent": "atlas-tutorial-bot/0.1 (+https://example.com/)"}
DELAY = 1.0  # seconds between two requests: this lesson's suggestion


def load_robots():
    """Fetch robots.txt and handle the status code as RFC 9309 says."""
    robots = RobotFileParser()
    try:
        r = requests.get(SITE + "/robots.txt", headers=HEADERS, timeout=10)
        status = r.status_code
    except requests.RequestException:
        status = 503  # unreachable: treat it like a server error
    if 200 <= status < 300:
        # RFC 9309: robots.txt must be UTF-8 encoded
        robots.parse(r.content.decode("utf-8", "replace").splitlines())
    elif 400 <= status < 500 and status != 429:
        robots.parse(["User-agent: *", "Allow: /"])  # file not available
    else:
        robots.parse(["User-agent: *", "Disallow: /"])  # 5xx, 429: block all
    return robots


robots = load_robots()
agent = HEADERS["User-Agent"]
delay = max(DELAY, robots.crawl_delay(agent) or 0)
pages = []
for path in PATHS:
    url = SITE + path
    if not robots.can_fetch(agent, url):
        print("Blocked by robots.txt:", url)
        continue
    r = requests.get(url, headers=HEADERS, timeout=10)  # always a timeout
    print(r.status_code, url)
    if r.status_code in (429, 503):
        print("The site is overloaded or asks us to slow down: stop.")
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

print("Pages fetched:", len(pages))
