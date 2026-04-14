import os
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
VECTOR_STORE_PATH = ".vector_store"
VECTOR_STORE_PERSIST = False

SCORING_WEIGHTS = {
    "semantic_similarity": 0.40,
    "skill_match": 0.35,
    "tools_match": 0.15,
    "experience": 0.10
}

SKILL_MATCH_THRESHOLD = 80
TOOL_MATCH_THRESHOLD = 75
EXPERIENCE_BASELINE = 2
