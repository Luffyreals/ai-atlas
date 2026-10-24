# Extract the title, the main text and the links from a given HTML page.
from urllib.parse import urljoin

from bs4 import BeautifulSoup

URL = "https://example.com/blog/rag"  # a made-up address, nothing is fetched
HTML = """
<html><head><title>What is RAG? | Blog</title></head>
<body>
  <nav><a href="/">Home</a> <a href="/blog/">Blog</a></nav>
  <article>
    <h1>What is RAG?</h1>
    <p class="meta">Posted on 2026-10-01</p>
    <p>RAG finds relevant passages and adds them to the prompt.</p>
    <p>So the model answers from real sources.</p>
    <a href="embedding">Read next: embeddings</a>
  </article>
  <footer>© 2026 Blog</footer>
  <script>trackVisit();</script>
</body></html>
"""

soup = BeautifulSoup(HTML, "html.parser")  # the parser built into Python

# find returns the first matching tag, or None when there is none
title = soup.find("title")
print("Title:", title.get_text(strip=True) if title else None)
print("h2 tag:", soup.find("h2"))

# Keep only the article: drop the menu, footer, script and the date line
article = soup.find("article")
paragraphs = [p.get_text(" ", strip=True)
              for p in article.select("p:not(.meta)")]
print("Text:", " ".join(paragraphs))

# Turn relative links into absolute ones, so the crawler can follow them
for a in soup.find_all("a"):
    print("Link:", urljoin(URL, a.get("href")))
