"""
Configuration module for CV Matching System.
Centralized configuration for easy tuning and deployment.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============================================================================
# EMBEDDING CONFIGURATION
# ============================================================================
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_CACHE_DIR = ".embeddings_cache"

# ============================================================================
# VECTOR STORE CONFIGURATION
# ============================================================================
VECTOR_STORE_TYPE = "faiss"  # Options: faiss, pinecone, weaviate
VECTOR_STORE_PATH = ".vector_store"  # Local path for FAISS persistence
VECTOR_STORE_PERSIST = True  # Enable vector store persistence

# ============================================================================
# MATCHING CONFIGURATION
# ============================================================================
# Scoring weights (must sum to 1.0)
SCORING_WEIGHTS = {
    "semantic_similarity": 0.40,      # Vector similarity score
    "skill_match": 0.35,              # Technical skills alignment
    "tools_match": 0.15,              # Tools and technologies
    "experience": 0.10                # Years of experience
}

# Fuzzy matching thresholds
SKILL_MATCH_THRESHOLD = 80            # Minimum fuzzy match score for skills
TOOL_MATCH_THRESHOLD = 75             # Minimum fuzzy match score for tools

# Experience baseline (years)
EXPERIENCE_BASELINE = 2               # Expected experience years in job description

# OpenAI API configuration (if LLM parsing enabled)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-3.5-turbo"

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================
LOG_LEVEL = "INFO"                    # Options: DEBUG, INFO, WARNING, ERROR
LOG_FILE = "cv_matcher.log"
LOG_MAX_BYTES = 10 * 1024 * 1024     # 10 MB
LOG_BACKUP_COUNT = 5

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
# Where to load candidates from
CANDIDATES_SOURCE = "memory"          # Options: memory, csv, database, api
CANDIDATES_FILE = None                # CSV file path if using file source

# ============================================================================
# PERFORMANCE CONFIGURATION
# ============================================================================
# Cache embeddings to avoid recomputation
CACHE_EMBEDDINGS = True
BATCH_PROCESSING_SIZE = 100           # Process candidates in batches

# ============================================================================
# EVALUATION CONFIGURATION
# ============================================================================
# Enable evaluation metrics computation
COMPUTE_EVALUATION_METRICS = True

# Test set for evaluation
EVALUATION_TEST_JOBS = [
    {
        "description": "Senior ML Engineer with Python and TensorFlow",
        "expected_candidates": [2, 4, 6, 10, 14]  # Candidate IDs
    },
    {
        "description": "Data Engineer with SQL and Spark",
        "expected_candidates": [7, 12]
    },
    {
        "description": "Full Stack Developer with Python and Web frameworks",
        "expected_candidates": [3, 9]
    }
]

# ============================================================================
# VALIDATION
# ============================================================================
def validate_weights():
    """Ensure scoring weights sum to 1.0."""
    total = sum(SCORING_WEIGHTS.values())
    assert abs(total - 1.0) < 0.01, f"Scoring weights must sum to 1.0, got {total}"

# Validate on import
validate_weights()
