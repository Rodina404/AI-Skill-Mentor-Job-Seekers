"""
Evaluation module for CV Matching System.
Computes metrics to validate matching accuracy.
"""

import logging
from typing import List, Dict, Set
import config

logger = logging.getLogger(__name__)


def evaluate_matching(results: List[Dict], expected_candidates: Set[int], top_k=5) -> Dict:
    """
    Evaluate matching results against expected candidates.
    
    Args:
        results: List of matched candidate results (with IDs)
        expected_candidates: Set of expected candidate IDs
        top_k: Consider only top K results
        
    Returns:
        Dictionary with evaluation metrics
    """
    # Get top K candidate IDs
    matched_ids = set([r.get('id') for r in results[:top_k]])
    
    # Calculate metrics
    true_positives = len(matched_ids & expected_candidates)
    false_positives = len(matched_ids - expected_candidates)
    false_negatives = len(expected_candidates - matched_ids)
    
    precision = true_positives / len(matched_ids) if matched_ids else 0
    recall = true_positives / len(expected_candidates) if expected_candidates else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    return {
        "precision": round(precision, 3),
        "recall": round(recall, 3),
        "f1": round(f1, 3),
        "true_positives": true_positives,
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "top_k": top_k
    }


def run_evaluation(match_candidates_fn, candidates: List[Dict]) -> Dict:
    """
    Run full evaluation suite on matching system.
    
    Args:
        match_candidates_fn: Function that takes job_text and returns results
        candidates: List of all available candidates with IDs
        
    Returns:
        Dictionary with evaluation results
    """
    test_jobs = config.EVALUATION_TEST_JOBS
    
    if not test_jobs:
        logger.warning("No test jobs configured for evaluation")
        return {}
    
    logger.info(f"Running evaluation with {len(test_jobs)} test jobs")
    
    all_metrics = []
    
    for i, test_job in enumerate(test_jobs, 1):
        job_desc = test_job.get("description", "")
        expected_ids = set(test_job.get("expected_candidates", []))
        
        logger.info(f"Test {i}: {job_desc[:50]}...")
        
        # Run matching
        results = match_candidates_fn(job_desc, candidates)
        
        # Add IDs to results if not present
        for result in results:
            if 'id' not in result:
                # Try to find ID by name
                for candidate in candidates:
                    if candidate.get('name') == result.get('name'):
                        result['id'] = candidate.get('id')
                        break
        
        # Evaluate
        metrics = evaluate_matching(results, expected_ids, top_k=min(5, len(results)))
        metrics['job_description'] = job_desc
        metrics['expected_candidates'] = list(expected_ids)
        metrics['matched_candidates'] = [r.get('name') for r in results[:5]]
        
        all_metrics.append(metrics)
        
        logger.info(f"  Precision: {metrics['precision']}, Recall: {metrics['recall']}, F1: {metrics['f1']}")
    
    # Aggregate metrics
    avg_precision = sum(m['precision'] for m in all_metrics) / len(all_metrics)
    avg_recall = sum(m['recall'] for m in all_metrics) / len(all_metrics)
    avg_f1 = sum(m['f1'] for m in all_metrics) / len(all_metrics)
    
    return {
        "test_jobs_count": len(all_metrics),
        "avg_precision": round(avg_precision, 3),
        "avg_recall": round(avg_recall, 3),
        "avg_f1": round(avg_f1, 3),
        "per_job_metrics": all_metrics
    }


def print_evaluation_report(eval_results: Dict):
    """Print formatted evaluation report."""
    if not eval_results:
        print("No evaluation results to report")
        return
    
    print("\n" + "=" * 70)
    print("EVALUATION REPORT")
    print("=" * 70)
    
    print(f"\nSummary:")
    print(f"  Test Jobs: {eval_results.get('test_jobs_count', 0)}")
    print(f"  Avg Precision: {eval_results.get('avg_precision', 0):.1%}")
    print(f"  Avg Recall: {eval_results.get('avg_recall', 0):.1%}")
    print(f"  Avg F1 Score: {eval_results.get('avg_f1', 0):.1%}")
    
    print(f"\nPer-Job Metrics:")
    for i, metrics in enumerate(eval_results.get('per_job_metrics', []), 1):
        print(f"\n  Test {i}: {metrics['job_description'][:50]}...")
        print(f"    Precision: {metrics['precision']:.1%}")
        print(f"    Recall: {metrics['recall']:.1%}")
        print(f"    F1: {metrics['f1']:.1%}")
        print(f"    True Positives: {metrics['true_positives']}")
        print(f"    False Positives: {metrics['false_positives']}")
        print(f"    False Negatives: {metrics['false_negatives']}")
        print(f"    Matched: {', '.join(metrics['matched_candidates'][:3])}")
    
    print("\n" + "=" * 70)
