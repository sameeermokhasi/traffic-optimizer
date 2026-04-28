"""
Historical Semantic Memory (Feature 3)
Embeds every completed traffic cycle into ChromaDB.
Before each Gemini call, retrieves the 3 most similar past cycles
so the AI can say "Last Monday at 8am a similar pattern resolved 12% faster with X."
"""
import os
import json
import chromadb
from chromadb.utils import embedding_functions
from datetime import datetime

_CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_store")
_COLLECTION  = "cycle_history"

_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

def _get_history_collection():
    client = chromadb.PersistentClient(path=_CHROMA_PATH)
    return client.get_or_create_collection(
        name=_COLLECTION,
        embedding_function=_ef,
        metadata={"hnsw:space": "cosine"}
    )

try:
    _hist_collection = _get_history_collection()
    MEMORY_AVAILABLE = True
    print("[Memory] Historical cycle memory ready.")
except Exception as e:
    _hist_collection = None
    MEMORY_AVAILABLE = False
    print(f"[Memory] Warning: Cycle memory unavailable ({e}).")


def embed_cycle(cycle_number: int, counts: dict, signal_plan: dict,
                metrics: dict, severity: str) -> None:
    """
    Embeds a completed cycle into the vector store.
    Called by the reporter agent after every cycle.
    """
    if not MEMORY_AVAILABLE or _hist_collection is None:
        return
    try:
        total = sum(counts.values())
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        # Build a natural-language description of the cycle for embedding
        text = (
            f"Cycle {cycle_number} at {timestamp}. "
            f"Total {total} vehicles: North={counts.get('N',0)}, South={counts.get('S',0)}, "
            f"East={counts.get('E',0)}, West={counts.get('W',0)}. "
            f"Severity: {severity}. "
            f"Signal plan: N={signal_plan.get('N',0)}s, S={signal_plan.get('S',0)}s, "
            f"E={signal_plan.get('E',0)}s, W={signal_plan.get('W',0)}s. "
            f"Improvement: {metrics.get('improvement_percent', 0):.1f}% "
            f"(Fixed {metrics.get('avg_wait_fixed',0):.1f}s → Optimized {metrics.get('avg_wait_optimized',0):.1f}s)."
        )
        _hist_collection.upsert(
            ids=[f"cycle_{cycle_number}"],
            documents=[text],
            metadatas=[{
                "cycle": cycle_number,
                "timestamp": timestamp,
                "severity": severity,
                "improvement": metrics.get("improvement_percent", 0),
                "total_vehicles": total,
            }]
        )
    except Exception as e:
        print(f"[Memory] Embed error: {e}")


def retrieve_similar_cycles(counts: dict, top_k: int = 3) -> str:
    """
    Retrieve the top_k most similar historical cycles and format them
    as a string to inject into the LLM prompt.
    """
    if not MEMORY_AVAILABLE or _hist_collection is None:
        return ""
    if _hist_collection.count() < 2:
        return ""

    try:
        total = sum(counts.values())
        query = (
            f"traffic {total} vehicles North={counts.get('N',0)} "
            f"South={counts.get('S',0)} East={counts.get('E',0)} West={counts.get('W',0)}"
        )
        results = _hist_collection.query(
            query_texts=[query],
            n_results=min(top_k, _hist_collection.count() - 1),
            include=["documents", "metadatas", "distances"]
        )
        if not results["documents"][0]:
            return ""

        lines = ["\n\nSimilar Historical Cycles (for context):"]
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            if dist < 0.7:  # Only include highly similar cycles
                imp = meta.get("improvement", 0)
                lines.append(
                    f"- Cycle {meta['cycle']} at {meta['timestamp']}: "
                    f"{meta['total_vehicles']} vehicles, {meta['severity']} severity, "
                    f"achieved {imp:.1f}% improvement."
                )
        return "\n".join(lines) if len(lines) > 1 else ""
    except Exception as e:
        print(f"[Memory] Retrieval error: {e}")
        return ""
