# Multi-hop traversal of a knowledge graph with a dict and BFS, no library.
from collections import deque

TRIPLES = [  # (subject, relation, object)
    ("Lan", "FOUNDED", "Blue Cloud"),
    ("Minh", "FOUNDED", "Golden Rice"),
    ("Morning Star Fund", "INVESTED_IN", "Blue Cloud"),
    ("Morning Star Fund", "INVESTED_IN", "Golden Rice"),
    ("Lan", "STUDIED_AT", "Polytechnic University"),
    ("Minh", "STUDIED_AT", "Polytechnic University"),
    ("Blue Cloud", "BASED_IN", "Da Nang"),
    ("Golden Rice", "BASED_IN", "Can Tho"),
]

# Adjacency list: each edge is stored at both ends, with its direction
graph = {}
for s, r, o in TRIPLES:
    graph.setdefault(s, []).append((f"-[{r}]->", o))
    graph.setdefault(o, []).append((f"<-[{r}]-", s))


def bfs(start, max_hops):
    """Return {entity: shortest path from start}, at most max_hops."""
    paths = {start: start}
    hops = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if hops[node] == max_hops:
            continue  # enough hops: do not go further from this node
        for edge, nxt in graph[node]:
            if nxt not in hops:  # unseen node: first visit is the shortest
                hops[nxt] = hops[node] + 1
                paths[nxt] = f"{paths[node]} {edge} {nxt}"
                queue.append(nxt)
    return paths


for h in (1, 2, 3):
    print(f"hops <= {h}: {len(bfs('Blue Cloud', h)) - 1} entities")
for path in list(bfs("Blue Cloud", 2).values())[1:]:
    print(path)
