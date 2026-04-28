"""
RAG Retriever — ChromaDB + sentence-transformers
Embeds BBMP/IRC regulations on first run, then retrieves top-K
relevant rules for each traffic situation.
"""
import os
import chromadb
from chromadb.utils import embedding_functions
from rag.knowledge_base import TRAFFIC_REGULATIONS

# Persist the vector store inside backend/rag/chroma_store
_CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_store")
_COLLECTION   = "traffic_regulations"

# Use the lightweight all-MiniLM model (downloads ~90MB once)
_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

def _get_collection():
    client = chromadb.PersistentClient(path=_CHROMA_PATH)
    collection = client.get_or_create_collection(
        name=_COLLECTION,
        embedding_function=_ef,
        metadata={"hnsw:space": "cosine"}
    )

    # Only embed documents if the collection is empty
    if collection.count() == 0:
        print("[RAG] Embedding traffic regulations into ChromaDB... (first run only)")
        collection.add(
            ids=[r["id"] for r in TRAFFIC_REGULATIONS],
            documents=[r["text"] for r in TRAFFIC_REGULATIONS],
            metadatas=[{"source": r["source"]} for r in TRAFFIC_REGULATIONS],
        )
        print(f"[RAG] {collection.count()} regulations embedded successfully.")
    
    return collection

# Initialize once at module load
try:
    _collection = _get_collection()
    RAG_AVAILABLE = True
    print("[RAG] Retriever ready.")
except Exception as e:
    _collection = None
    RAG_AVAILABLE = False
    print(f"[RAG] Warning: ChromaDB unavailable ({e}). Proceeding without RAG.")


def retrieve_regulations(query: str, top_k: int = 3) -> list[dict]:
    """
    Retrieve the top_k most relevant traffic regulations for the given situation.
    Returns a list of {source, text} dicts.
    """
    if not RAG_AVAILABLE or _collection is None:
        return []

    try:
        results = _collection.query(
            query_texts=[query],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        regulations = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            # Only include results with reasonable cosine similarity (< 0.8 distance)
            if dist < 0.8:
                regulations.append({"source": meta["source"], "text": doc})
        return regulations
    except Exception as e:
        print(f"[RAG] Retrieval error: {e}")
        return []


def build_regulation_context(counts: dict) -> str:
    """
    Build a regulation context string to inject into the LLM prompt.
    Constructs a relevant query from the vehicle counts.
    """
    total = sum(counts.values())
    max_lane = max(counts, key=counts.get)
    query = f"traffic congestion {total} vehicles {max_lane} lane heavy traffic signal timing optimization"

    regulations = retrieve_regulations(query, top_k=3)
    if not regulations:
        return ""

    lines = ["\n\nRelevant Traffic Regulations You Must Cite:"]
    for i, reg in enumerate(regulations, 1):
        lines.append(f"{i}. [{reg['source']}] {reg['text']}")
    
    return "\n".join(lines)
