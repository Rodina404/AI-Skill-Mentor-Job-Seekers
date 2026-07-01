import logging
import os
from typing import List, Optional

import numpy as np

logger = logging.getLogger(__name__)


class SemanticRanker:
    """Optional sentence-transformer ranker for semantic job relevance."""

    def __init__(self) -> None:
        self.enabled = os.getenv("ENABLE_SEMANTIC_RANKING", "false").lower() == "true"
        self.model_name = os.getenv("SEMANTIC_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        self._model = None
        self._load_failed = False

    def score(self, query_text: str, job_text: str) -> Optional[float]:
        if not self.enabled or not query_text.strip() or not job_text.strip():
            return None

        model = self._get_model()
        if model is None:
            return None

        try:
            vectors = model.encode(
                [query_text, job_text],
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            score = float(np.dot(vectors[0], vectors[1]))
            return round(max(0.0, min(score, 1.0)), 3)
        except Exception as exc:
            logger.warning("Semantic scoring failed: %s", exc)
            return None

    def build_user_text(self, skills: List[str], desired_role: str = "", education: str = "") -> str:
        parts = []
        if desired_role:
            parts.append(f"Target role: {desired_role}")
        if skills:
            parts.append(f"Skills: {', '.join(skills)}")
        if education:
            parts.append(f"Education: {education}")
        return ". ".join(parts)

    def _get_model(self):
        if self._model is not None:
            return self._model
        if self._load_failed:
            return None

        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
            logger.info("Semantic ranker loaded model: %s", self.model_name)
            return self._model
        except Exception as exc:
            self._load_failed = True
            logger.warning("Semantic ranker unavailable: %s", exc)
            return None
