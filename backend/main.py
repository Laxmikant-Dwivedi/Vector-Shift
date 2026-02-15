from dotenv import load_dotenv
from pathlib import Path
import os

# Load .env from backend directory
load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

# CORS: use ALLOWED_ORIGINS env var in production, or localhost for dev
_origins = os.environ.get("ALLOWED_ORIGINS")
if _origins:
    origins = [x.strip() for x in _origins.split(",") if x.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _id(v):
    return str(v) if v is not None else None


class ParseResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool


def is_dag(nodes: List[Dict], edges: List[Dict]) -> bool:
    """Check if the pipeline forms a directed acyclic graph."""
    if not edges:
        return True  # No edges = no cycles

    # Build adjacency list from edges
    def _id(v):
        return str(v) if v is not None else None

    node_ids = {_id(n.get("id")) for n in nodes if isinstance(n, dict) and n.get("id") is not None}
    for edge in edges:
        if isinstance(edge, dict):
            node_ids.add(_id(edge.get("source")))
            node_ids.add(_id(edge.get("target")))
    node_ids.discard(None)

    adj: Dict[str, List[str]] = {nid: [] for nid in node_ids}
    for edge in edges:
        if not isinstance(edge, dict):
            continue
        src = _id(edge.get("source"))
        target = _id(edge.get("target"))
        if src and target:
            adj.setdefault(src, []).append(target)

    # DFS for cycle detection
    WHITE, GRAY, BLACK = 0, 1, 2
    color: Dict[str, int] = {nid: WHITE for nid in node_ids}

    def has_cycle(node: str) -> bool:
        color[node] = GRAY
        for neighbor in adj[node]:
            if color[neighbor] == GRAY:
                return True
            if color[neighbor] == WHITE and has_cycle(neighbor):
                return True
        color[node] = BLACK
        return False

    for node_id in node_ids:
        if color[node_id] == WHITE and has_cycle(node_id):
            return False
    return True


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


def _build_graph(nodes: List[Dict], edges: List[Dict]):
    """Build adjacency list and reverse adjacency list."""
    node_map = {_id(n.get("id")): n for n in nodes if isinstance(n, dict) and n.get("id") is not None}
    for e in edges:
        if isinstance(e, dict):
            s, t = _id(e.get("source")), _id(e.get("target"))
            if s:
                node_map.setdefault(s, {"id": s})
            if t:
                node_map.setdefault(t, {"id": t})

    adj = {nid: [] for nid in node_map}
    rev_adj = {nid: [] for nid in node_map}
    for e in edges:
        if not isinstance(e, dict):
            continue
        src, tgt = _id(e.get("source")), _id(e.get("target"))
        if src and tgt:
            adj[src].append(tgt)
            rev_adj[tgt].append(src)
    return node_map, adj, rev_adj


def _topological_sort(node_map: dict, adj: dict, rev_adj: dict) -> List[str]:
    """Kahn's algorithm for topological sort."""
    in_degree = {nid: len(rev_adj[nid]) for nid in node_map}
    queue = [nid for nid in node_map if in_degree[nid] == 0]
    order = []
    while queue:
        nid = queue.pop(0)
        order.append(nid)
        for neighbor in adj[nid]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return order


@app.post("/pipelines/execute")
async def execute_pipeline(request: Request):
    """Execute the pipeline: Input -> LLM -> Output, return results for output nodes."""
    import os
    try:
        body = await request.json()
        nodes_list = body.get("nodes", [])
        edges_list = body.get("edges", [])
    except Exception:
        return {"error": "Invalid request", "outputs": {}}

    if not isinstance(nodes_list, list):
        nodes_list = []
    if not isinstance(edges_list, list):
        edges_list = []

    try:
        node_map, adj, rev_adj = _build_graph(nodes_list, edges_list)
        if not is_dag(nodes_list, edges_list):
            return {"error": "Pipeline has a cycle", "outputs": {}}

        order = _topological_sort(node_map, adj, rev_adj)
        values = {}

        for nid in order:
            node = node_map.get(nid, {})
            ntype = (node.get("type") or "").lower()
            data = node.get("data") or {}

            if ntype == "input":
                values[nid] = str(data.get("value", ""))

            elif ntype == "llm":
                # Get input from connected upstream nodes
                upstream = rev_adj.get(nid, [])
                inp = " ".join(str(values.get(u, "")) for u in upstream) if upstream else ""
                if not inp.strip():
                    inp = "Hello"

                api_key = os.environ.get("OPENAI_API_KEY")
                if not api_key:
                    values[nid] = f"[No OPENAI_API_KEY set] Would process: {inp[:100]}..."
                else:
                    try:
                        from openai import OpenAI
                        client = OpenAI(api_key=api_key)
                        model_name = data.get("model") or "gpt-4o-mini"
                        temperature = float(data.get("temperature", 0.7))
                        resp = client.chat.completions.create(
                            model=model_name,
                            messages=[{"role": "user", "content": inp}],
                            max_tokens=500,
                            temperature=temperature,
                        )
                        values[nid] = (resp.choices[0].message.content or "").strip()
                    except Exception as e:
                        values[nid] = f"[LLM Error] {str(e)}"

            elif ntype == "output":
                upstream = rev_adj.get(nid, [])
                values[nid] = " ".join(str(values.get(u, "")) for u in upstream) if upstream else ""

            elif ntype == "text":
                import re
                text = str(data.get("text", ""))
                # Map targetHandle -> source node id from edges
                handle_to_source = {}
                upstream_sources = []
                for e in edges_list:
                    if not isinstance(e, dict):
                        continue
                    tgt = _id(e.get("target"))
                    if tgt == nid:
                        src = _id(e.get("source"))
                        handle = str(e.get("targetHandle")) if e.get("targetHandle") else "input"
                        if src:
                            handle_to_source[handle] = src
                            upstream_sources.append(src)
                # Find variables in text: {{ var_name }}
                vars_in_text = re.findall(r'\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}', text)
                # Substitute: use handle_to_source, or map first upstream to first variable if handle is "input"
                for i, var_name in enumerate(vars_in_text):
                    src_id = handle_to_source.get(var_name)
                    if src_id is None and handle_to_source.get("input") and i == 0:
                        src_id = handle_to_source["input"]
                    if src_id is None and len(upstream_sources) == 1 and len(vars_in_text) == 1:
                        src_id = upstream_sources[0]
                    if src_id is not None:
                        val = str(values.get(src_id, ""))
                        pattern = r'\{\{\s*' + re.escape(var_name) + r'\s*\}\}'
                        text = re.sub(pattern, val, text, count=1)
                values[nid] = text

            else:
                upstream = rev_adj.get(nid, [])
                values[nid] = " ".join(str(values.get(u, "")) for u in upstream) if upstream else ""

        outputs = {nid: values.get(nid, "") for nid in order if (node_map.get(nid, {}).get("type") or "").lower() == "output"}
        return {"outputs": outputs, "error": None}
    except Exception as e:
        return {"error": str(e), "outputs": {}}


@app.post("/pipelines/parse")
async def parse_pipeline(request: Request):
    try:
        body = await request.json()
        nodes_list = body.get("nodes", [])
        edges_list = body.get("edges", [])
    except Exception:
        return {"num_nodes": 0, "num_edges": 0, "is_dag": False}

    if not isinstance(nodes_list, list):
        nodes_list = []
    if not isinstance(edges_list, list):
        edges_list = []

    try:
        num_nodes = len(nodes_list)
        num_edges = len(edges_list)
        dag = is_dag(nodes_list, edges_list)
        return ParseResponse(num_nodes=num_nodes, num_edges=num_edges, is_dag=dag)
    except Exception:
        return {"num_nodes": 0, "num_edges": 0, "is_dag": False}
