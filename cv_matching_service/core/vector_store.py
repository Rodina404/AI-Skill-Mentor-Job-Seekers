"""
core/vector_store.py

Tries to use FAISS + HuggingFace sentence-transformers for semantic search.
If sentence_transformers is unavailable, falls back to a scikit-learn
TF-IDF cosine-similarity in-memory store — no model download required.
"""
import logging
import os
from typing import List, Any

import core.config as config

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Attempt FAISS + HuggingFace (semantic)
# ---------------------------------------------------------------------------

def _try_get_hf_embeddings():
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(model_name=config.EMBEDDING_MODEL)
    except Exception as e:
        logger.warning(f"HuggingFace embeddings unavailable: {e}. Using TF-IDF fallback.")
        return None


# ---------------------------------------------------------------------------
# TF-IDF fallback vector store (pure sklearn, zero network calls)
# ---------------------------------------------------------------------------

class _TfidfVectorStore:
    """Minimal FAISS-compatible interface backed by sklearn TF-IDF + cosine sim."""

    def __init__(self, texts: List[str], metadatas: List[Any]):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np

        self._cosine_similarity = cosine_similarity
        self._np = np
        self._metadatas = metadatas

        self._vectorizer = TfidfVectorizer(stop_words="english")
        self._matrix = self._vectorizer.fit_transform(texts)
        logger.info(f"TF-IDF vector store built with {len(texts)} documents.")

    def similarity_search_with_score(self, query: str, k: int = 5):
        query_vec = self._vectorizer.transform([query])
        scores = self._cosine_similarity(query_vec, self._matrix).flatten()
        top_k = self._np.argsort(scores)[::-1][:k]

        results = []
        for idx in top_k:
            doc = _FakeDoc(self._metadatas[idx])
            results.append((doc, float(scores[idx])))
        return results


class _FakeDoc:
    def __init__(self, metadata):
        self.metadata = metadata


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_vector_store(texts: List[str], metadatas: List[Any], rebuild: bool = False):
    """
    Build a vector store from texts.
    Tries FAISS + HuggingFace first; falls back to TF-IDF if unavailable.
    """
    if not texts:
        logger.warning("No texts provided for vector store.")
        return None

    embeddings = _try_get_hf_embeddings()

    if embeddings is not None:
        # ── FAISS path ────────────────────────────────────────────────────
        try:
            from langchain_community.vectorstores import FAISS

            store_path = config.VECTOR_STORE_PATH
            if config.VECTOR_STORE_PERSIST and not rebuild and os.path.exists(store_path):
                try:
                    store = FAISS.load_local(
                        store_path, embeddings,
                        allow_dangerous_deserialization=True
                    )
                    logger.info("Loaded cached FAISS vector store.")
                    return store
                except Exception as e:
                    logger.warning(f"Cache load failed ({e}), rebuilding.")

            store = FAISS.from_texts(texts, embeddings, metadatas=metadatas)
            logger.info(f"FAISS vector store built with {len(texts)} documents.")

            if config.VECTOR_STORE_PERSIST:
                try:
                    os.makedirs(store_path, exist_ok=True)
                    store.save_local(store_path)
                except Exception as e:
                    logger.warning(f"Could not persist vector store: {e}")

            return store

        except Exception as e:
            logger.warning(f"FAISS build failed ({e}), falling back to TF-IDF.")

    # ── TF-IDF fallback ───────────────────────────────────────────────────
    return _TfidfVectorStore(texts, metadatas)
