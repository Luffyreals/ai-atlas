# Read a given robots.txt, then ask: may we fetch this path?
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
robots.parse(ROBOTS.splitlines())  # parse a string, no network needed

agent = "atlas-tutorial-bot/0.1"
paths = ["/", "/blog/rag", "/admin/users", "/Admin/users",
         "/search?q=ai", "/searching-tips"]
for path in paths:
    ok = robots.can_fetch(agent, "https://example.com" + path)
    print(f"{path:<16} {ok}")

print("crawl delay:", robots.crawl_delay(agent))
# BadBot has its own group, which blocks the whole site
print("BadBot /blog/rag:",
      robots.can_fetch("BadBot", "https://example.com/blog/rag"))
