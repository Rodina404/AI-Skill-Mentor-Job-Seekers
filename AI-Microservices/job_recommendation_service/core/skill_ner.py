import logging
import os
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class HuggingFaceSkillExtractor:
    """Lazy JobBERT token-classification pipeline for job-description skills."""

    def __init__(self) -> None:
        self.model_name = os.getenv("HF_NER_MODEL", "jjzha/jobbert_skill_extraction")
        self.min_score = self._read_min_score()
        self._pipeline = None
        self._load_error: Optional[str] = None
        self._cache: Dict[str, List[str]] = {}

    @property
    def load_error(self) -> Optional[str]:
        return self._load_error

    def extract(self, description: str) -> List[str]:
        text = str(description or "").strip()
        if not text:
            return []
        if text in self._cache:
            return list(self._cache[text])
        ner = self._get_pipeline()
        if ner is None:
            return []
        try:
            # TokenClassificationPipeline does not forward tokenizer kwargs
            # consistently across transformers versions. Adzuna descriptions
            # are already summaries; a conservative character cap keeps the
            # request below JobBERT's token limit without unsupported kwargs.
            model_text = text[:1600]
            skills = self._merge_bio_spans(model_text, ner(model_text))
            self._cache[text] = skills
            return list(skills)
        except Exception as exc:
            self._load_error = f"HuggingFace NER inference failed: {type(exc).__name__}"
            logger.warning("%s (%s)", self._load_error, exc)
            return []

    def _get_pipeline(self):
        if self._pipeline is not None:
            return self._pipeline
        if self._load_error is not None:
            return None
        try:
            from transformers import pipeline
            self._pipeline = pipeline("token-classification", model=self.model_name, tokenizer=self.model_name)
            logger.info("Loaded HuggingFace skill NER model: %s", self.model_name)
            return self._pipeline
        except Exception as exc:
            self._load_error = f"HuggingFace NER unavailable: {type(exc).__name__}"
            logger.warning(self._load_error)
            return None

    def _merge_bio_spans(self, text: str, entities: List[Dict[str, Any]]) -> List[str]:
        spans = []
        current_start = None
        current_end = None
        for entity in entities:
            label = str(entity.get("entity") or entity.get("entity_group") or "").upper()
            if label == "O" or float(entity.get("score", 0.0)) < self.min_score:
                continue
            start, end = entity.get("start"), entity.get("end")
            if not isinstance(start, int) or not isinstance(end, int) or end <= start:
                continue
            begins = label == "B" or label.startswith("B-")
            continues = label == "I" or label.startswith("I-")
            adjacent = current_end is not None and start <= current_end + 1
            if current_start is not None and (begins or not continues or not adjacent):
                spans.append(text[current_start:current_end].strip(" ,.;:-"))
                current_start = current_end = None
            if current_start is None:
                current_start = start
            current_end = end
        if current_start is not None:
            spans.append(text[current_start:current_end].strip(" ,.;:-"))
        unique, seen = [], set()
        for span in spans:
            normalized = " ".join(span.split())
            key = normalized.casefold()
            if normalized and key not in seen:
                seen.add(key)
                unique.append(normalized)
        return unique

    def _read_min_score(self) -> float:
        try:
            return max(0.0, min(float(os.getenv("HF_NER_MIN_SCORE", "0.50")), 1.0))
        except ValueError:
            return 0.50
