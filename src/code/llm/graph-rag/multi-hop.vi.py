# Duyệt đồ thị tri thức nhiều bước bằng dict và BFS, không cần thư viện.
from collections import deque

TRIPLES = [  # (chủ thể, quan hệ, đối tượng)
    ("Lan", "FOUNDED", "Mây Xanh"),
    ("Minh", "FOUNDED", "Lúa Vàng"),
    ("Quỹ Sao Mai", "INVESTED_IN", "Mây Xanh"),
    ("Quỹ Sao Mai", "INVESTED_IN", "Lúa Vàng"),
    ("Lan", "STUDIED_AT", "ĐH Bách khoa"),
    ("Minh", "STUDIED_AT", "ĐH Bách khoa"),
    ("Mây Xanh", "BASED_IN", "Đà Nẵng"),
    ("Lúa Vàng", "BASED_IN", "Cần Thơ"),
]

# Danh sách kề: mỗi cạnh được ghi ở cả hai đầu, kèm chiều của nó
graph = {}
for s, r, o in TRIPLES:
    graph.setdefault(s, []).append((f"-[{r}]->", o))
    graph.setdefault(o, []).append((f"<-[{r}]-", s))


def bfs(start, max_hops):
    """Trả về {thực thể: đường đi ngắn nhất từ start}, tối đa max_hops."""
    paths = {start: start}
    hops = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if hops[node] == max_hops:
            continue  # đủ số bước, không đi tiếp từ nút này
        for edge, nxt in graph[node]:
            if nxt not in hops:  # nút chưa gặp: lần đầu gặp là ngắn nhất
                hops[nxt] = hops[node] + 1
                paths[nxt] = f"{paths[node]} {edge} {nxt}"
                queue.append(nxt)
    return paths


for h in (1, 2, 3):
    print(f"hops <= {h}: {len(bfs('Mây Xanh', h)) - 1} entities")
for path in list(bfs("Mây Xanh", 2).values())[1:]:
    print(path)
