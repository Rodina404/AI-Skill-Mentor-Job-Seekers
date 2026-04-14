"""Core business logic - pure Python modules with zero FastAPI imports."""

from .embedding_engine import compute_embeddings
from .normalizer import normalize_skills
from .profile_builder import build_user_profile
from .rule_engine import apply_rules, batch_apply_rules
from .info_extractor import extract_skill_ids, extract_skill_names, filter_by_confidence

__all__ = [
    'compute_embeddings',
    'normalize_skills',
    'build_user_profile',
    'apply_rules',
    'batch_apply_rules',
    'extract_skill_ids',
    'extract_skill_names',
    'filter_by_confidence',
]
