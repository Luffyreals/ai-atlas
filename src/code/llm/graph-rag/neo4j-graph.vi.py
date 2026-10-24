# Ghi bộ ba vào Neo4j, rồi hỏi hai bước và nhiều bước bằng Cypher.
import os

from neo4j import GraphDatabase

URI = os.environ.get("NEO4J_URI", "neo4j://127.0.0.1:7687")
AUTH = ("neo4j", os.environ["NEO4J_PASSWORD"])

TRIPLES = [  # cùng 8 bộ ba với ô chạy trên trang
    ("Lan", "FOUNDED", "Mây Xanh"),
    ("Minh", "FOUNDED", "Lúa Vàng"),
    ("Quỹ Sao Mai", "INVESTED_IN", "Mây Xanh"),
    ("Quỹ Sao Mai", "INVESTED_IN", "Lúa Vàng"),
    ("Lan", "STUDIED_AT", "ĐH Bách khoa"),
    ("Minh", "STUDIED_AT", "ĐH Bách khoa"),
    ("Mây Xanh", "BASED_IN", "Đà Nẵng"),
    ("Lúa Vàng", "BASED_IN", "Cần Thơ"),
]
RELATIONS = {"FOUNDED", "INVESTED_IN", "STUDIED_AT", "BASED_IN"}

SHARED_INVESTOR = """
MATCH (c:Entity {name: $name})<-[:INVESTED_IN]-(f)-[:INVESTED_IN]->(o)
RETURN f.name AS fund, o.name AS company
"""
WITHIN_3 = """
MATCH (c:Entity {name: $name})-[]-{1,3}(n)
RETURN count(DISTINCT n) AS n
"""

with GraphDatabase.driver(URI, auth=AUTH) as driver:
    driver.verify_connectivity()
    # Xóa đồ thị cũ của bài để chạy lại nhiều lần vẫn ra cùng kết quả
    driver.execute_query("MATCH (n:Entity) DETACH DELETE n")
    for s, r, o in TRIPLES:
        # Tên đi qua tham số $s, $o. Kiểu quan hệ được ghép vào chuỗi,
        # nên phải kiểm trước rằng nó nằm trong lược đồ.
        if r not in RELATIONS:
            raise ValueError(f"Quan hệ ngoài lược đồ: {r}")
        driver.execute_query(
            "MERGE (a:Entity {name: $s}) MERGE (b:Entity {name: $o}) "
            f"MERGE (a)-[:{r}]->(b)",
            s=s, o=o,
        )
    for query in (SHARED_INVESTOR, WITHIN_3):
        records, _, _ = driver.execute_query(query, name="Mây Xanh")
        for record in records:
            print(record.data())
