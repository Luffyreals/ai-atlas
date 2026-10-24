# Write triples into Neo4j, then ask two-hop and multi-hop Cypher queries.
import os

from neo4j import GraphDatabase

URI = os.environ.get("NEO4J_URI", "neo4j://127.0.0.1:7687")
AUTH = ("neo4j", os.environ["NEO4J_PASSWORD"])

TRIPLES = [  # the same 8 triples as the cell that runs on the page
    ("Lan", "FOUNDED", "Blue Cloud"),
    ("Minh", "FOUNDED", "Golden Rice"),
    ("Morning Star Fund", "INVESTED_IN", "Blue Cloud"),
    ("Morning Star Fund", "INVESTED_IN", "Golden Rice"),
    ("Lan", "STUDIED_AT", "Polytechnic University"),
    ("Minh", "STUDIED_AT", "Polytechnic University"),
    ("Blue Cloud", "BASED_IN", "Da Nang"),
    ("Golden Rice", "BASED_IN", "Can Tho"),
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
    # Delete the lesson's old graph so that every run gives the same result
    driver.execute_query("MATCH (n:Entity) DETACH DELETE n")
    for s, r, o in TRIPLES:
        # Names go through the parameters $s, $o. The relationship type is
        # pasted into the string, so check first that it is in the schema.
        if r not in RELATIONS:
            raise ValueError(f"Relation outside the schema: {r}")
        driver.execute_query(
            "MERGE (a:Entity {name: $s}) MERGE (b:Entity {name: $o}) "
            f"MERGE (a)-[:{r}]->(b)",
            s=s, o=o,
        )
    for query in (SHARED_INVESTOR, WITHIN_3):
        records, _, _ = driver.execute_query(query, name="Blue Cloud")
        for record in records:
            print(record.data())
