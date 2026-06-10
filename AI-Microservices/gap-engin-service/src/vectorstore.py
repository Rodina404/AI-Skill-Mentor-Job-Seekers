"""
vectorstore.py - Persistent vector storage for semantic role retrieval (Mode B context).

Stores role chunks as embeddings in Chroma, enables semantic search,
and auto-rebuilds if corrupted.

Technology:
  - Database: Chroma (SQLite-backed)
  - Embeddings: HuggingFace all-MiniLM-L6-v2
  - Storage: chroma_db/ directory
  - Chunk Size: 500 chars with 50-char overlap
"""

import os
import json
import logging
from importlib.metadata import PackageNotFoundError, version
from typing import Optional

from src.loaders import load_job_title_index

logger = logging.getLogger(__name__)
os.environ.setdefault("TRANSFORMERS_NO_TORCHVISION", "1")
os.environ.setdefault("USE_TORCHVISION", "0")

DEFAULT_CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
_configured_chroma_dir = os.getenv("CHROMA_DB_PATH", DEFAULT_CHROMA_DB_DIR)
CHROMA_DB_DIR = (
    _configured_chroma_dir
    if os.path.isabs(_configured_chroma_dir)
    else os.path.join(os.path.dirname(__file__), "..", _configured_chroma_dir)
)
CHROMA_DB_DIR = os.path.abspath(CHROMA_DB_DIR)
RECOVERY_CHROMA_DB_DIR = f"{CHROMA_DB_DIR}_current"
try:
    _chroma_version = version("chromadb").replace(".", "_")
except PackageNotFoundError:
    _chroma_version = "unknown"
VERSIONED_CHROMA_DB_DIR = f"{CHROMA_DB_DIR}_v{_chroma_version}"
COLLECTION_NAME = "role_chunks"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

_client = None
_collection = None


def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks."""
    if len(text) <= size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start += size - overlap
    return chunks


def _role_to_text(role: dict) -> str:
    """Convert a role dict to a text blob for embedding."""
    title = role.get("title", "")
    skills = ", ".join(s["skillId"] for s in role.get("requiredSkills", []))
    return f"Role: {title}\nRequired Skills: {skills}"


def _get_client():
    global _client
    if _client is not None:
        return _client
    try:
        import chromadb
        candidates = [VERSIONED_CHROMA_DB_DIR, RECOVERY_CHROMA_DB_DIR, CHROMA_DB_DIR]
        active_dir = next(
            (path for path in candidates if os.path.exists(os.path.join(path, "chroma.sqlite3"))),
            CHROMA_DB_DIR,
        )
        os.makedirs(active_dir, exist_ok=True)
        _client = chromadb.PersistentClient(path=active_dir)
        logger.info(f"Chroma client initialized at {active_dir}")
    except ImportError:
        logger.warning("chromadb not installed. Vector store disabled.")
        _client = None
    except Exception as e:
        logger.error(f"Failed to initialize Chroma: {e}")
        _client = None
    return _client


def _get_embedding_function():
    try:
        from chromadb.utils import embedding_functions
        return embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
    except Exception as e:
        logger.error(f"Failed to load embedding function: {e}")
        return None


def get_or_create_collection():
    """Get or create the role chunks collection, seeding from roles file if empty."""
    global _collection
    if _collection is not None:
        return _collection

    client = _get_client()
    if client is None:
        return None

    emb_fn = _get_embedding_function()

    try:
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=emb_fn,
        )

        # Seed if empty
        if _collection.count() == 0:
            logger.info("Collection empty. Seeding from roles database...")
            _seed_collection(_collection)

        logger.info(f"Collection '{COLLECTION_NAME}' has {_collection.count()} chunks.")
        return _collection

    except Exception as e:
        logger.error(f"Chroma collection error: {e}. Attempting reset...")
        return _reset_and_recreate(client, emb_fn)


def _seed_collection(collection):
    """Seed Chroma collection from roles JSON."""
    try:
        roles, _ = load_job_title_index()
    except Exception as e:
        logger.error(f"Failed to load roles for seeding: {e}")
        return

    documents = []
    ids = []
    metadatas = []

    for idx, role in enumerate(roles):
        text = _role_to_text(role)
        chunks = _chunk_text(text)
        for c_idx, chunk in enumerate(chunks):
            doc_id = f"role_{idx}_chunk_{c_idx}"
            documents.append(chunk)
            ids.append(doc_id)
            metadatas.append({"role_title": role.get("title", ""), "role_idx": idx})

    if documents:
        collection.add(documents=documents, ids=ids, metadatas=metadatas)
        logger.info(f"Seeded {len(documents)} chunks into Chroma.")


def _reset_and_recreate(client, emb_fn):
    """Delete and recreate collection after corruption."""
    global _client, _collection
    try:
        client.delete_collection(COLLECTION_NAME)
        _collection = client.create_collection(
            name=COLLECTION_NAME,
            embedding_function=emb_fn,
        )
        _seed_collection(_collection)
        return _collection
    except Exception as e:
        logger.warning(f"Failed to reset legacy Chroma collection: {e}")

    # Preserve databases created by incompatible Chroma versions and recover
    # into a fresh store using the currently installed schema.
    try:
        import chromadb

        os.makedirs(VERSIONED_CHROMA_DB_DIR, exist_ok=True)
        _client = chromadb.PersistentClient(path=VERSIONED_CHROMA_DB_DIR)
        _collection = _client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=emb_fn,
        )
        if _collection.count() == 0:
            _seed_collection(_collection)
        logger.info(
            f"Recovered Chroma collection in '{VERSIONED_CHROMA_DB_DIR}' "
            f"with {_collection.count()} chunks."
        )
        return _collection
    except Exception as recovery_error:
        logger.error(f"Failed to recover Chroma collection: {recovery_error}")
        _collection = None
        return None


def retrieve_similar_roles_with_scores(
    query: str,
    n_results: int = 5,
    max_distance: float = 1.25,
) -> list[dict]:
    """Retrieve relevant role chunks with Chroma distances."""
    collection = get_or_create_collection()
    if collection is None:
        return []

    try:
        results = collection.query(
            query_texts=[query],
            n_results=min(n_results, collection.count()),
            include=["documents", "distances", "metadatas"],
        )
        documents = results.get("documents", [[]])[0]
        distances = results.get("distances", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        rows = []
        for document, distance, metadata in zip(documents, distances, metadatas):
            if distance is not None and float(distance) <= max_distance:
                rows.append({
                    "document": document,
                    "distance": float(distance),
                    "metadata": metadata or {},
                })
        return rows
    except Exception as e:
        logger.error(f"Chroma scored query error: {e}")
        return []


def retrieve_similar_roles(query: str, n_results: int = 5) -> list[str]:
    """
    Retrieve role chunks similar to the query from Chroma.

    Args:
        query: Job title or description text.
        n_results: Number of similar chunks to retrieve.

    Returns:
        List of text chunks (strings). Empty list on failure.
    """
    rows = retrieve_similar_roles_with_scores(query, n_results=n_results)
    docs = [row["document"] for row in rows]
    logger.debug(f"Chroma returned {len(docs)} relevant chunks for '{query}'")
    return docs
