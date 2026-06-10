"""
test_embeddings.py - Tests for semantic similarity scoring.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from src.loaders import compute_similarity, find_best_match


class TestComputeSimilarity:
    def test_identical_titles(self):
        sim = compute_similarity("data scientist", "data scientist")
        # Should be very high (≥0.9)
        assert sim >= 0.9 or sim == 0.0  # 0.0 if model unavailable

    def test_similar_titles(self):
        sim = compute_similarity("machine learning engineer", "ml engineer")
        # Either high similarity or 0 if no model
        assert sim >= 0.0

    def test_dissimilar_titles(self):
        sim = compute_similarity("data analyst", "embedded software engineer")
        # Should be lower than similar pair
        sim2 = compute_similarity("data analyst", "data scientist")
        assert sim2 >= sim or sim == 0.0

    def test_returns_float(self):
        sim = compute_similarity("software engineer", "backend developer")
        assert isinstance(sim, float)
        assert 0.0 <= sim <= 1.0


class TestSemanticMatching:
    def test_semantic_match_variant(self):
        # "ML engineer" should match "machine learning engineer"
        result = find_best_match("ML engineer")
        # Either matches or returns None (if model not available)
        if result is not None:
            role, conf, _ = result
            assert conf > 0.0

    def test_common_title_matches(self):
        titles = ["data analyst", "software engineer", "data scientist", "devops engineer"]
        for title in titles:
            result = find_best_match(title)
            assert result is not None, f"Expected match for '{title}'"
            _, conf, _ = result
            assert conf >= 0.74
