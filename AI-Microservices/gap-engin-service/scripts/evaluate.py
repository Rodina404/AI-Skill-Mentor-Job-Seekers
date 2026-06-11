#!/usr/bin/env python3
"""Evaluate GradRAG Mode A and Mode B separately.

Outputs:
  reports/evaluation_results.json
  reports/mode_quality_comparison.png
  reports/mode_speed_comparison.png
  reports/rag_evidence_quality.png
  reports/consistency_comparison.png
"""

import json
import os
import statistics
import sys
import time
from typing import Any
from unittest.mock import patch

import matplotlib.pyplot as plt
import numpy as np
from dotenv import load_dotenv

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
load_dotenv(override=True)

from src.loaders import find_best_match
from src.pipeline import run_pipeline
from src.retrieval_helpers import gather_evidence
from src.role_library import normalize_skill_name
from src.llm import get_last_extraction_source


REPORTS_DIR = os.path.join(ROOT, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)
with open(os.path.join(ROOT, "data", "mode_b_evaluation.json"), encoding="utf-8") as file:
    OFFLINE_MODE_B_CASES = json.load(file)
with open(os.path.join(ROOT, "data", "final_evaluation_thresholds.json"), encoding="utf-8") as file:
    FINAL_TARGETS = json.load(file)

MODE_A_CASES = [
    {
        "title": "data analyst",
        "expected_role": "data analyst",
        "expected_skills": {"S_sql", "S_python", "S_statistics", "S_data_analysis"},
    },
    {
        "title": "machine learning engineer",
        "expected_role": "machine learning engineer",
        "expected_skills": {"S_python", "S_machine_learning", "S_deep_learning", "S_pytorch"},
    },
    {
        "title": "devops engineer",
        "expected_role": "devops engineer",
        "expected_skills": {"S_docker", "S_kubernetes", "S_cicd", "S_linux"},
    },
    {
        "title": "frontend engineer",
        "expected_role": "frontend engineer",
        "expected_skills": {"S_javascript", "S_react", "S_html_css"},
    },
    {
        "title": "biostatisticians",
        "expected_role": "biostatisticians",
        "expected_skills": {"S_python", "S_r", "S_sql", "S_sas", "S_data_analysis"},
    },
]

# These titles are intentionally absent from Mode A so the real pipeline must
# use RAG evidence and Groq/local extraction.
MODE_B_CASES = [
    {
        "title": "biomedical data engineering specialist",
        "expected_skills": {"S_python", "S_sql", "S_data_engineering", "S_aws"},
        "evidence_terms": {"python", "sql", "data", "cloud"},
    },
    {
        "title": "cloud automation specialist",
        "expected_skills": {"S_aws", "S_docker", "S_kubernetes", "S_terraform", "S_linux", "S_cicd"},
        "evidence_terms": {"aws", "docker", "kubernetes", "terraform", "linux", "cloud"},
    },
    {
        "title": "machine intelligence specialist",
        "expected_skills": {"S_python", "S_machine_learning", "S_deep_learning", "S_pytorch", "S_tensorflow"},
        "evidence_terms": {"python", "machine learning", "deep learning", "pytorch", "tensorflow"},
    },
]

NORMALIZATION_POSITIVE_CASES = [
    ("python", "S_python"),
    ("Python 3", "S_python"),
    ("pytohn", "S_python"),
    ("aws ec2", "S_aws"),
    ("k8s", "S_kubernetes"),
    ("machine-learning", "S_machine_learning"),
    ("postgres", "S_postgresql"),
    ("power bi", "S_data_visualization"),
    ("ci/cd", "S_cicd"),
    ("pyspark", "S_spark"),
]

NORMALIZATION_NEGATIVE_CASES = [
    "communication",
    "leadership",
    "teamwork",
    "python snake",
    "java coffee",
    "docker ship",
    "sparkling water",
    "sql injection",
]


def skill_ids(result: dict) -> set[str]:
    return {
        skill["skillId"]
        for skill in result.get("requiredSkills", [])
        if isinstance(skill, dict) and skill.get("skillId")
    }


def ordered_skill_ids(result: dict) -> list[str]:
    return [
        skill["skillId"]
        for skill in result.get("requiredSkills", [])
        if isinstance(skill, dict) and skill.get("skillId")
    ]


def quality_metrics(actual: set[str], expected: set[str]) -> dict[str, float]:
    true_positive = len(actual & expected)
    precision = true_positive / len(actual) if actual else 0.0
    recall = true_positive / len(expected) if expected else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {"precision": precision, "recall": recall, "f1": f1}


def ranking_metrics(actual: list[str], expected: set[str], k: int = 5) -> dict[str, float]:
    top_k = actual[:k]
    hits = [1 if skill in expected else 0 for skill in top_k]
    precision_at_k = sum(hits) / k
    recall_at_k = sum(hits) / len(expected) if expected else 0.0
    reciprocal_rank = next((1 / (index + 1) for index, hit in enumerate(hits) if hit), 0.0)
    dcg = sum(hit / np.log2(index + 2) for index, hit in enumerate(hits))
    ideal_hits = [1] * min(k, len(expected))
    idcg = sum(hit / np.log2(index + 2) for index, hit in enumerate(ideal_hits))
    ndcg = dcg / idcg if idcg else 0.0
    return {
        "precision_at_5": precision_at_k,
        "recall_at_5": recall_at_k,
        "mrr": reciprocal_rank,
        "ndcg_at_5": ndcg,
    }


def percentile(values: list[float], value: int) -> float:
    return float(np.percentile(values, value)) if values else 0.0


def jaccard(left: set[str], right: set[str]) -> float:
    union = left | right
    return len(left & right) / len(union) if union else 1.0


def run_timed(title: str, force_mode_b: bool = False) -> tuple[dict, float]:
    start = time.perf_counter()
    if force_mode_b:
        with patch("src.pipeline._mode_a", return_value=None):
            result = run_pipeline(title)
    else:
        result = run_pipeline(title)
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    return result, elapsed_ms


def evaluate_mode_a() -> dict[str, Any]:
    print("\n=== Mode A: Local Lookup Quality ===")
    rows = []
    times = []
    correct_roles = 0
    for case in MODE_A_CASES:
        result, elapsed = run_timed(case["title"])
        match = find_best_match(case["title"])
        matched_role = match[0]["title"] if match else None
        metrics = quality_metrics(skill_ids(result), case["expected_skills"])
        correct = result.get("source") == "mode_a" and matched_role == case["expected_role"]
        correct_roles += int(correct)
        times.append(elapsed)
        rows.append({
            "title": case["title"],
            "matched_role": matched_role,
            "source": result.get("source"),
            "latency_ms": elapsed,
            **metrics,
        })
        print(
            f"{case['title']}: role={matched_role}, "
            f"P={metrics['precision']:.2f} R={metrics['recall']:.2f} "
            f"F1={metrics['f1']:.2f}, {elapsed:.1f}ms"
        )
    return {
        "role_accuracy": correct_roles / len(MODE_A_CASES),
        "precision": statistics.mean(row["precision"] for row in rows),
        "recall": statistics.mean(row["recall"] for row in rows),
        "f1": statistics.mean(row["f1"] for row in rows),
        "p50_ms": percentile(times, 50),
        "p95_ms": percentile(times, 95),
        "cases": rows,
    }


def evaluate_normalization() -> dict[str, Any]:
    print("\n=== Normalization: Precision, Recall, and Specificity ===")
    true_positive = 0
    false_negative = 0
    false_positive = 0

    positive_rows = []
    for raw, expected in NORMALIZATION_POSITIVE_CASES:
        actual = normalize_skill_name(raw)
        correct = actual == expected
        true_positive += int(correct)
        false_negative += int(not correct)
        positive_rows.append({"input": raw, "expected": expected, "actual": actual, "correct": correct})
        print(f"{raw!r}: expected={expected}, actual={actual}, {'OK' if correct else 'FAIL'}")

    negative_rows = []
    for raw in NORMALIZATION_NEGATIVE_CASES:
        actual = normalize_skill_name(raw)
        correct = actual is None
        false_positive += int(not correct)
        negative_rows.append({"input": raw, "actual": actual, "correct": correct})
        print(f"{raw!r}: expected=rejected, actual={actual}, {'OK' if correct else 'FAIL'}")

    precision = true_positive / (true_positive + false_positive) if true_positive + false_positive else 0.0
    recall = true_positive / (true_positive + false_negative) if true_positive + false_negative else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    specificity = (
        (len(NORMALIZATION_NEGATIVE_CASES) - false_positive) / len(NORMALIZATION_NEGATIVE_CASES)
    )
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "specificity": specificity,
        "positive_cases": positive_rows,
        "negative_cases": negative_rows,
    }


def evaluate_rag() -> dict[str, Any]:
    print("\n=== RAG: Evidence Retrieval Quality ===")
    rows = []
    for case in MODE_B_CASES:
        start = time.perf_counter()
        evidence, has_evidence = gather_evidence(case["title"])
        elapsed = (time.perf_counter() - start) * 1000.0
        evidence_lower = evidence.lower()
        matched_terms = sorted(term for term in case["evidence_terms"] if term in evidence_lower)
        relevance = len(matched_terms) / len(case["evidence_terms"])
        has_adzuna = "=== Live Job Postings (Adzuna) ===" in evidence
        has_chroma = "=== Similar Role Knowledge Base ===" in evidence
        rows.append({
            "title": case["title"],
            "has_evidence": has_evidence,
            "has_adzuna": has_adzuna,
            "has_chroma": has_chroma,
            "relevance": relevance,
            "matched_terms": matched_terms,
            "evidence_chars": len(evidence),
            "latency_ms": elapsed,
        })
        print(
            f"{case['title']}: evidence={has_evidence}, adzuna={has_adzuna}, "
            f"chroma={has_chroma}, relevance={relevance:.2f}, {elapsed:.1f}ms"
        )
    return {
        "availability": statistics.mean(float(row["has_evidence"]) for row in rows),
        "relevance": statistics.mean(row["relevance"] for row in rows),
        "p50_ms": percentile([row["latency_ms"] for row in rows], 50),
        "p95_ms": percentile([row["latency_ms"] for row in rows], 95),
        "cases": rows,
    }


def evaluate_mode_b() -> dict[str, Any]:
    print("\n=== Mode B: Live RAG + Extraction Quality ===")
    rows = []
    times = []
    successes = 0
    groq_successes = 0
    for case in MODE_B_CASES:
        result, elapsed = run_timed(case["title"], force_mode_b=True)
        extraction_source = get_last_extraction_source()
        ordered_actual = ordered_skill_ids(result)
        actual = set(ordered_actual)
        metrics = quality_metrics(actual, case["expected_skills"])
        ranks = ranking_metrics(ordered_actual, case["expected_skills"])
        success = result.get("source") == "mode_b" and bool(actual)
        successes += int(success)
        groq_successes += int(success and extraction_source == "groq")
        times.append(elapsed)
        rows.append({
            "title": case["title"],
            "source": result.get("source"),
            "extraction_source": extraction_source,
            "skills": sorted(actual),
            "latency_ms": elapsed,
            **metrics,
            **ranks,
        })
        print(
            f"{case['title']}: source={result.get('source')}/{extraction_source}, skills={len(actual)}, "
            f"P={metrics['precision']:.2f} R={metrics['recall']:.2f} "
            f"F1={metrics['f1']:.2f}, {elapsed:.1f}ms"
        )
    return {
        "success_rate": successes / len(MODE_B_CASES),
        "groq_availability": groq_successes / len(MODE_B_CASES),
        "precision": statistics.mean(row["precision"] for row in rows),
        "recall": statistics.mean(row["recall"] for row in rows),
        "f1": statistics.mean(row["f1"] for row in rows),
        "precision_at_5": statistics.mean(row["precision_at_5"] for row in rows),
        "recall_at_5": statistics.mean(row["recall_at_5"] for row in rows),
        "mrr": statistics.mean(row["mrr"] for row in rows),
        "ndcg_at_5": statistics.mean(row["ndcg_at_5"] for row in rows),
        "p50_ms": percentile(times, 50),
        "p95_ms": percentile(times, 95),
        "cases": rows,
    }


def evaluate_mode_b_offline() -> dict[str, Any]:
    print("\n=== Mode B: Offline Fixed-Evidence Benchmark ===")
    rows = []
    for case in OFFLINE_MODE_B_CASES:
        expected = set(case["expected_skills"])
        with patch("src.pipeline._mode_a", return_value=None), \
             patch("src.pipeline.gather_evidence", return_value=(case["evidence"], True)), \
             patch("src.llm._get_groq_client", return_value=None):
            result = run_pipeline(case["title"])
        ordered_actual = ordered_skill_ids(result)
        metrics = quality_metrics(set(ordered_actual), expected)
        ranks = ranking_metrics(ordered_actual, expected)
        rows.append({"title": case["title"], **metrics, **ranks})
        print(
            f"{case['title']}: F1={metrics['f1']:.2f}, "
            f"P@5={ranks['precision_at_5']:.2f}, nDCG@5={ranks['ndcg_at_5']:.2f}"
        )
    metric_names = ["precision", "recall", "f1", "precision_at_5", "recall_at_5", "mrr", "ndcg_at_5"]
    return {
        **{name: statistics.mean(row[name] for row in rows) for name in metric_names},
        "cases": rows,
    }


def evaluate_mode_b_stability(runs: int = 3) -> dict[str, Any]:
    print(f"\n=== Mode B: Stability Across {runs} Live Runs ===")
    rows = []
    for case in MODE_B_CASES:
        expected = case["expected_skills"]
        outputs = []
        f1_scores = []
        for _ in range(runs):
            result, _ = run_timed(case["title"], force_mode_b=True)
            current = skill_ids(result)
            outputs.append(current)
            f1_scores.append(quality_metrics(current, expected)["f1"])
        pair_scores = [
            jaccard(outputs[left], outputs[right])
            for left in range(len(outputs))
            for right in range(left + 1, len(outputs))
        ]
        row = {
            "title": case["title"],
            "mean_f1": statistics.mean(f1_scores),
            "min_f1": min(f1_scores),
            "f1_stddev": statistics.pstdev(f1_scores),
            "mean_jaccard": statistics.mean(pair_scores),
        }
        rows.append(row)
        print(
            f"{case['title']}: mean F1={row['mean_f1']:.2f}, min F1={row['min_f1']:.2f}, "
            f"stddev={row['f1_stddev']:.3f}, Jaccard={row['mean_jaccard']:.2f}"
        )
    return {
        "mean_f1": statistics.mean(row["mean_f1"] for row in rows),
        "min_f1": min(row["min_f1"] for row in rows),
        "f1_stddev": statistics.mean(row["f1_stddev"] for row in rows),
        "mean_jaccard": statistics.mean(row["mean_jaccard"] for row in rows),
        "cases": rows,
    }


def evaluate_consistency() -> dict[str, Any]:
    print("\n=== Consistency: Repeated Skill Results ===")
    mode_a_scores = []
    mode_b_scores = []

    for case in MODE_A_CASES[:3]:
        first = skill_ids(run_pipeline(case["title"]))
        second = skill_ids(run_pipeline(case["title"]))
        score = jaccard(first, second)
        mode_a_scores.append(score)
        print(f"Mode A {case['title']}: Jaccard={score:.2f}")

    for case in MODE_B_CASES:
        first, _ = run_timed(case["title"], force_mode_b=True)
        second, _ = run_timed(case["title"], force_mode_b=True)
        score = jaccard(skill_ids(first), skill_ids(second))
        mode_b_scores.append(score)
        print(f"Mode B {case['title']}: Jaccard={score:.2f}")

    return {
        "mode_a": statistics.mean(mode_a_scores),
        "mode_b": statistics.mean(mode_b_scores),
        "mode_a_cases": mode_a_scores,
        "mode_b_cases": mode_b_scores,
    }


def save_plots(results: dict[str, Any]) -> None:
    normalization = results["normalization"]
    mode_a = results["mode_a"]
    mode_b = results["mode_b"]
    offline_mode_b = results["offline_mode_b"]
    rag = results["rag"]
    consistency = results["consistency"]

    labels = ["Precision", "Recall", "F1"]
    x = np.arange(len(labels))
    width = 0.34
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.bar(x - width / 2, [mode_a["precision"], mode_a["recall"], mode_a["f1"]], width, label="Mode A")
    ax.bar(x + width / 2, [mode_b["precision"], mode_b["recall"], mode_b["f1"]], width, label="Mode B")
    ax.set_ylim(0, 1)
    ax.set_xticks(x, labels)
    ax.set_ylabel("Score")
    ax.set_title("Mode A vs Mode B Skill Quality")
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "mode_quality_comparison.png"), dpi=120)
    plt.close()

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(["Mode A p50", "Mode A p95", "Mode B p50", "Mode B p95"],
           [mode_a["p50_ms"], mode_a["p95_ms"], mode_b["p50_ms"], mode_b["p95_ms"]])
    ax.set_ylabel("Milliseconds")
    ax.set_title("Mode A vs Mode B Speed")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "mode_speed_comparison.png"), dpi=120)
    plt.close()

    fig, ax = plt.subplots(figsize=(9, 5))
    titles = [row["title"] for row in rag["cases"]]
    relevance = [row["relevance"] for row in rag["cases"]]
    ax.barh(titles, relevance)
    ax.set_xlim(0, 1)
    ax.set_xlabel("Expected evidence-term coverage")
    ax.set_title("RAG Evidence Relevance")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "rag_evidence_quality.png"), dpi=120)
    plt.close()

    fig, ax = plt.subplots(figsize=(7, 5))
    ax.bar(["Mode A", "Mode B"], [consistency["mode_a"], consistency["mode_b"]])
    ax.set_ylim(0, 1)
    ax.set_ylabel("Mean Jaccard similarity")
    ax.set_title("Repeated-Run Consistency")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "consistency_comparison.png"), dpi=120)
    plt.close()

    fig, ax = plt.subplots(figsize=(8, 5))
    metrics = ["Precision", "Recall", "F1", "Specificity"]
    values = [
        normalization["precision"],
        normalization["recall"],
        normalization["f1"],
        normalization["specificity"],
    ]
    ax.bar(metrics, values)
    ax.set_ylim(0, 1)
    ax.set_ylabel("Score")
    ax.set_title("Skill Normalization Quality")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "normalization_quality.png"), dpi=120)
    plt.close()

    fig, ax = plt.subplots(figsize=(9, 5))
    ranking_names = ["P@5", "R@5", "MRR", "nDCG@5"]
    live_values = [mode_b["precision_at_5"], mode_b["recall_at_5"], mode_b["mrr"], mode_b["ndcg_at_5"]]
    offline_values = [
        offline_mode_b["precision_at_5"], offline_mode_b["recall_at_5"],
        offline_mode_b["mrr"], offline_mode_b["ndcg_at_5"],
    ]
    x = np.arange(len(ranking_names))
    ax.bar(x - width / 2, offline_values, width, label="Offline fixed evidence")
    ax.bar(x + width / 2, live_values, width, label="Live RAG")
    ax.set_ylim(0, 1)
    ax.set_xticks(x, ranking_names)
    ax.set_title("Mode B Ranking Quality")
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "mode_b_ranking_quality.png"), dpi=120)
    plt.close()


def target_comparison_rows(results: dict[str, Any]) -> list[tuple[str, float, str, bool]]:
    """Return achieved values, target rules, and outcomes for all thresholds."""
    rows = [
        ("Normalization precision", results["normalization"]["precision"], f">= {FINAL_TARGETS['normalization_precision']:.3f}", results["thresholds"]["normalization_precision"]),
        ("Normalization recall", results["normalization"]["recall"], f">= {FINAL_TARGETS['normalization_recall']:.3f}", results["thresholds"]["normalization_recall"]),
        ("Normalization specificity", results["normalization"]["specificity"], f">= {FINAL_TARGETS['normalization_specificity']:.3f}", results["thresholds"]["normalization_specificity"]),
        ("Mode A role accuracy", results["mode_a"]["role_accuracy"], f">= {FINAL_TARGETS['mode_a_role_accuracy']:.3f}", results["thresholds"]["mode_a_role_accuracy"]),
        ("Mode A F1", results["mode_a"]["f1"], f">= {FINAL_TARGETS['mode_a_f1']:.3f}", results["thresholds"]["mode_a_f1"]),
        ("Mode A p95 speed (ms)", results["mode_a"]["p95_ms"], f"< {FINAL_TARGETS['mode_a_p95_ms_max']:.1f}", results["thresholds"]["mode_a_p95"]),
        ("RAG availability", results["rag"]["availability"], f">= {FINAL_TARGETS['rag_availability']:.3f}", results["thresholds"]["rag_availability"]),
        ("RAG relevance", results["rag"]["relevance"], f">= {FINAL_TARGETS['rag_relevance']:.3f}", results["thresholds"]["rag_relevance"]),
        ("Live Groq availability", results["mode_b"]["groq_availability"], f">= {FINAL_TARGETS['live_groq_availability']:.3f}", results["thresholds"]["live_groq_availability"]),
        ("Mode B precision", results["mode_b"]["precision"], f">= {FINAL_TARGETS['mode_b_precision']:.3f}", results["thresholds"]["mode_b_precision"]),
        ("Mode B recall", results["mode_b"]["recall"], f">= {FINAL_TARGETS['mode_b_recall']:.3f}", results["thresholds"]["mode_b_recall"]),
        ("Mode B F1", results["mode_b"]["f1"], f">= {FINAL_TARGETS['mode_b_f1']:.3f}", results["thresholds"]["mode_b_f1"]),
        ("Mode B Precision@5", results["mode_b"]["precision_at_5"], f">= {FINAL_TARGETS['mode_b_precision_at_5']:.3f}", results["thresholds"]["mode_b_precision_at_5"]),
        ("Mode B nDCG@5", results["mode_b"]["ndcg_at_5"], f">= {FINAL_TARGETS['mode_b_ndcg_at_5']:.3f}", results["thresholds"]["mode_b_ndcg_at_5"]),
        ("Offline Mode B F1", results["offline_mode_b"]["f1"], f">= {FINAL_TARGETS['offline_mode_b_f1']:.3f}", results["thresholds"]["offline_mode_b_f1"]),
        ("Offline Mode B nDCG@5", results["offline_mode_b"]["ndcg_at_5"], f">= {FINAL_TARGETS['offline_mode_b_ndcg_at_5']:.3f}", results["thresholds"]["offline_mode_b_ndcg_at_5"]),
        ("Mode B p95 speed (ms)", results["mode_b"]["p95_ms"], f"< {FINAL_TARGETS['mode_b_p95_ms_max']:.1f}", results["thresholds"]["mode_b_p95"]),
        ("Mode A consistency", results["consistency"]["mode_a"], f">= {FINAL_TARGETS['mode_a_consistency']:.3f}", results["thresholds"]["mode_a_consistency"]),
        ("Mode B consistency", results["consistency"]["mode_b"], f">= {FINAL_TARGETS['mode_b_consistency']:.3f}", results["thresholds"]["mode_b_consistency"]),
        ("Mode B stability", results["mode_b_stability"]["mean_jaccard"], f">= {FINAL_TARGETS['mode_b_stability']:.3f}", results["thresholds"]["mode_b_stability"]),
    ]
    return rows


def save_text_report(results: dict[str, Any]) -> str:
    """Save a readable summary of the complete evaluation."""
    thresholds = results["thresholds"]
    mode_a = results["mode_a"]
    mode_b = results["mode_b"]
    offline_mode_b = results["offline_mode_b"]
    rag = results["rag"]
    consistency = results["consistency"]
    stability = results["mode_b_stability"]
    normalization = results["normalization"]
    passed = sum(thresholds.values())

    lines = [
        "GradRAG Final Evaluation Report",
        "=" * 31,
        "",
        f"Overall: {passed}/{len(thresholds)} thresholds passed",
        "",
        "Core Metrics",
        "------------",
        f"Normalization precision: {normalization['precision']:.3f}",
        f"Normalization recall: {normalization['recall']:.3f}",
        f"Normalization specificity: {normalization['specificity']:.3f}",
        f"Mode A role accuracy: {mode_a['role_accuracy']:.3f}",
        f"Mode A precision: {mode_a['precision']:.3f}",
        f"Mode A recall: {mode_a['recall']:.3f}",
        f"Mode A F1: {mode_a['f1']:.3f}",
        f"Mode B live Groq availability: {mode_b['groq_availability']:.3f}",
        f"Mode B precision: {mode_b['precision']:.3f}",
        f"Mode B recall: {mode_b['recall']:.3f}",
        f"Mode B F1: {mode_b['f1']:.3f}",
        f"Mode B Precision@5: {mode_b['precision_at_5']:.3f}",
        f"Mode B Recall@5: {mode_b['recall_at_5']:.3f}",
        f"Mode B MRR: {mode_b['mrr']:.3f}",
        f"Mode B nDCG@5: {mode_b['ndcg_at_5']:.3f}",
        f"Offline Mode B F1: {offline_mode_b['f1']:.3f}",
        f"Offline Mode B nDCG@5: {offline_mode_b['ndcg_at_5']:.3f}",
        f"RAG availability: {rag['availability']:.3f}",
        f"RAG relevance: {rag['relevance']:.3f}",
        f"Mode A consistency: {consistency['mode_a']:.3f}",
        f"Mode B consistency: {consistency['mode_b']:.3f}",
        f"Mode B stability: {stability['mean_jaccard']:.3f}",
        f"Mode A p95 speed: {mode_a['p95_ms']:.1f} ms",
        f"Mode B p95 speed: {mode_b['p95_ms']:.1f} ms",
        "",
        "Achieved Results Compared With Targets",
        "--------------------------------------",
        f"{'Metric':<32} {'Achieved':>10} {'Target':>12} {'Result':>8}",
        f"{'-' * 32} {'-' * 10} {'-' * 12} {'-' * 8}",
    ]
    lines.extend(
        f"{name:<32} {achieved:>10.3f} {target:>12} {'PASS' if passed_target else 'FAIL':>8}"
        for name, achieved, target, passed_target in target_comparison_rows(results)
    )
    lines.extend([
        "",
        "Generated Images",
        "----------------",
        "mode_quality_comparison.png",
        "mode_speed_comparison.png",
        "rag_evidence_quality.png",
        "consistency_comparison.png",
        "normalization_quality.png",
        "mode_b_ranking_quality.png",
        "",
        "Detailed machine-readable results: evaluation_results.json",
    ])

    output_path = os.path.join(REPORTS_DIR, "final_evaluation_report.txt")
    with open(output_path, "w", encoding="utf-8") as file:
        file.write("\n".join(lines) + "\n")
    return output_path


def regenerate_reports_from_saved_results() -> tuple[str, str]:
    """Regenerate text and image reports without rerunning live evaluation."""
    output_path = os.path.join(REPORTS_DIR, "evaluation_results.json")
    with open(output_path, encoding="utf-8") as file:
        results = json.load(file)
    save_plots(results)
    return output_path, save_text_report(results)


def main() -> None:
    print("Running focused Mode A, Mode B, and RAG evaluation...")
    results = {
        "normalization": evaluate_normalization(),
        "mode_a": evaluate_mode_a(),
        "rag": evaluate_rag(),
        "offline_mode_b": evaluate_mode_b_offline(),
        "mode_b": evaluate_mode_b(),
        "consistency": evaluate_consistency(),
        "mode_b_stability": evaluate_mode_b_stability(),
    }

    thresholds = {
        "normalization_precision": results["normalization"]["precision"] >= FINAL_TARGETS["normalization_precision"],
        "normalization_recall": results["normalization"]["recall"] >= FINAL_TARGETS["normalization_recall"],
        "normalization_specificity": results["normalization"]["specificity"] >= FINAL_TARGETS["normalization_specificity"],
        "mode_a_role_accuracy": results["mode_a"]["role_accuracy"] >= FINAL_TARGETS["mode_a_role_accuracy"],
        "mode_a_f1": results["mode_a"]["f1"] >= FINAL_TARGETS["mode_a_f1"],
        "mode_a_p95": results["mode_a"]["p95_ms"] < FINAL_TARGETS["mode_a_p95_ms_max"],
        "rag_availability": results["rag"]["availability"] >= FINAL_TARGETS["rag_availability"],
        "rag_relevance": results["rag"]["relevance"] >= FINAL_TARGETS["rag_relevance"],
        "live_groq_availability": results["mode_b"]["groq_availability"] >= FINAL_TARGETS["live_groq_availability"],
        "mode_b_precision": results["mode_b"]["precision"] >= FINAL_TARGETS["mode_b_precision"],
        "mode_b_recall": results["mode_b"]["recall"] >= FINAL_TARGETS["mode_b_recall"],
        "mode_b_f1": results["mode_b"]["f1"] >= FINAL_TARGETS["mode_b_f1"],
        "mode_b_precision_at_5": results["mode_b"]["precision_at_5"] >= FINAL_TARGETS["mode_b_precision_at_5"],
        "mode_b_ndcg_at_5": results["mode_b"]["ndcg_at_5"] >= FINAL_TARGETS["mode_b_ndcg_at_5"],
        "offline_mode_b_f1": results["offline_mode_b"]["f1"] >= FINAL_TARGETS["offline_mode_b_f1"],
        "offline_mode_b_ndcg_at_5": results["offline_mode_b"]["ndcg_at_5"] >= FINAL_TARGETS["offline_mode_b_ndcg_at_5"],
        "mode_b_p95": results["mode_b"]["p95_ms"] < FINAL_TARGETS["mode_b_p95_ms_max"],
        "mode_a_consistency": results["consistency"]["mode_a"] >= FINAL_TARGETS["mode_a_consistency"],
        "mode_b_consistency": results["consistency"]["mode_b"] >= FINAL_TARGETS["mode_b_consistency"],
        "mode_b_stability": results["mode_b_stability"]["mean_jaccard"] >= FINAL_TARGETS["mode_b_stability"],
    }
    thresholds = {name: bool(value) for name, value in thresholds.items()}
    results["thresholds"] = thresholds

    output_path = os.path.join(REPORTS_DIR, "evaluation_results.json")
    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=2)
    save_plots(results)
    text_report_path = save_text_report(results)

    passed = sum(thresholds.values())
    print("\n=== Evaluation Summary ===")
    for name, ok in thresholds.items():
        print(f"{name:24} {'PASS' if ok else 'FAIL'}")
    print(f"\nOverall: {passed}/{len(thresholds)} thresholds passed")
    print(f"Detailed results: {output_path}")
    print(f"Text report: {text_report_path}")

    if passed != len(thresholds):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
