import os
import random
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

def set_style():
    sns.set_theme(style="whitegrid")
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica', 'DejaVu Sans']

def calculate_metrics(recommended_items, all_items, relevance_threshold=0.7):
    """Calculates Precision@k, Recall@k, and F1 Score based on a ground truth threshold."""
    # Define ground truth relevant items from the whole dataset
    relevant_items = [item for item in all_items if item['hybrid'] >= relevance_threshold]
    total_relevant = len(relevant_items)
    
    # Calculate True Positives in the recommended subset
    true_positives = sum(1 for item in recommended_items if item['hybrid'] >= relevance_threshold)
    
    precision = true_positives / len(recommended_items) if recommended_items else 0
    recall = true_positives / total_relevant if total_relevant > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    return precision * 100, recall * 100, f1 * 100

def simulate_job_ranking_evaluation():
    """Evaluates the Job Hybrid Reranking Algorithm vs Baselines."""
    print("Evaluating Job Recommendation Engine...")
    
    # Generate 50 mock jobs
    jobs = []
    for i in range(50):
        readiness = random.uniform(0.0, 1.0)
        recent_days = random.randint(0, 60)
        
        # Calculate Hybrid Score using actual formula
        recency_boost = 0.0
        if recent_days <= 7: recency_boost = 0.3
        elif recent_days <= 30: recency_boost = 0.15
        else: recency_boost = 0.05
            
        hybrid_score = (0.7 * readiness) + (0.3 * recency_boost)
        
        jobs.append({
            'id': i,
            'readiness': readiness,
            'recent_days': recent_days,
            'hybrid': hybrid_score
        })

    # Approach 1: Recency Only (Sort by recent_days ASC)
    recency_sorted = sorted(jobs, key=lambda x: x['recent_days'])[:10]
    
    # Approach 2: Readiness Only (Sort by readiness DESC)
    readiness_sorted = sorted(jobs, key=lambda x: x['readiness'], reverse=True)[:10]
    
    # Approach 3: Hybrid (Our system)
    hybrid_sorted = sorted(jobs, key=lambda x: x['hybrid'], reverse=True)[:10]

    # --- 1. Basic Scores Plot ---
    def avg(lst, key):
        return sum(x[key] for x in lst) / len(lst) if lst else 0

    metrics = {
        'Recency-Only': {'Readiness': avg(recency_sorted, 'readiness') * 100, 'Freshness': avg(recency_sorted, 'recent_days')},
        'Readiness-Only': {'Readiness': avg(readiness_sorted, 'readiness') * 100, 'Freshness': avg(readiness_sorted, 'recent_days')},
        'Hybrid AI Mentor': {'Readiness': avg(hybrid_sorted, 'readiness') * 100, 'Freshness': avg(hybrid_sorted, 'recent_days')}
    }

    labels = list(metrics.keys())
    readiness_vals = [metrics[l]['Readiness'] for l in labels]
    freshness_vals = [(60 - metrics[l]['Freshness']) / 60 * 100 for l in labels] 

    x = np.arange(len(labels))
    width = 0.35

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(x - width/2, readiness_vals, width, label='Avg Readiness (%)', color='#667eea')
    ax.bar(x + width/2, freshness_vals, width, label='Avg Freshness Score', color='#764ba2')

    ax.set_ylabel('Scores (Higher is Better)')
    ax.set_title('Job Recommendation Sorting Algorithms Comparison')
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.legend()
    ax.set_ylim(0, 110)

    for p in ax.patches:
        ax.annotate(f"{p.get_height():.1f}", (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 5), textcoords='offset points', fontweight='bold')

    plt.tight_layout()
    plt.savefig('eval_job_ranking.png', dpi=300)
    plt.close()
    
    # --- 2. Advanced Metrics Plot (Precision, Recall, F1) ---
    p_rec, r_rec, f1_rec = calculate_metrics(recency_sorted, jobs)
    p_rea, r_rea, f1_rea = calculate_metrics(readiness_sorted, jobs)
    p_hyb, r_hyb, f1_hyb = calculate_metrics(hybrid_sorted, jobs)
    
    adv_metrics = {
        'Recency-Only': [p_rec, r_rec, f1_rec],
        'Readiness-Only': [p_rea, r_rea, f1_rea],
        'Hybrid AI Mentor': [p_hyb, r_hyb, f1_hyb]
    }
    
    fig, ax = plt.subplots(figsize=(10, 6))
    x_adv = np.arange(3)  # Precision, Recall, F1
    metric_labels = ['Precision@10', 'Recall@10', 'F1-Score']
    
    ax.bar(x_adv - 0.25, [adv_metrics['Recency-Only'][i] for i in range(3)], 0.25, label='Recency-Only', color='#fc8181')
    ax.bar(x_adv, [adv_metrics['Readiness-Only'][i] for i in range(3)], 0.25, label='Readiness-Only', color='#f6ad55')
    ax.bar(x_adv + 0.25, [adv_metrics['Hybrid AI Mentor'][i] for i in range(3)], 0.25, label='Hybrid AI Mentor', color='#4fd1c5')

    ax.set_ylabel('Percentage (%)')
    ax.set_title('Job Ranking: Precision, Recall & F1-Score Evaluation')
    ax.set_xticks(x_adv)
    ax.set_xticklabels(metric_labels)
    ax.legend()
    ax.set_ylim(0, 110)
    
    for p in ax.patches:
        ax.annotate(f"{p.get_height():.0f}%", (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 5), textcoords='offset points', fontweight='bold')

    plt.tight_layout()
    plt.savefig('eval_job_metrics.png', dpi=300)
    plt.close()
    
    print("Saved eval_job_ranking.png and eval_job_metrics.png")

def simulate_course_ranking_evaluation():
    """Evaluates Course FAISS Baseline vs Hybrid Vector Search."""
    print("Evaluating Course Recommendation Engine...")
    
    courses = []
    for i in range(100):
        semantic_score = random.uniform(0.4, 0.95)
        rating = random.uniform(2.5, 5.0)
        level_match = random.choice([0, 1])  # 1 = matches user level constraint
        
        # Calculate Hybrid Score using actual formula
        hybrid_score = (0.4 * semantic_score) + (0.2 * (rating/5.0)) + (0.2 * level_match)
        
        courses.append({
            'id': i,
            'semantic': semantic_score,
            'rating': rating,
            'level_match': level_match,
            'hybrid': hybrid_score
        })

    # Approach 1: Pure FAISS (Semantic Distance Only)
    faiss_sorted = sorted(courses, key=lambda x: x['semantic'], reverse=True)[:10]
    
    # Approach 2: AI Mentor Hybrid Reranking
    hybrid_sorted = sorted(courses, key=lambda x: x['hybrid'], reverse=True)[:10]

    # --- 1. Basic Scores Plot ---
    def avg(lst, key): return sum(x[key] for x in lst) / len(lst) if lst else 0

    metrics = {
        'Baseline FAISS': {
            'Relevance': avg(faiss_sorted, 'semantic') * 100,
            'Rating': avg(faiss_sorted, 'rating'),
            'LevelMatch': avg(faiss_sorted, 'level_match') * 100
        },
        'Hybrid Engine': {
            'Relevance': avg(hybrid_sorted, 'semantic') * 100,
            'Rating': avg(hybrid_sorted, 'rating'),
            'LevelMatch': avg(hybrid_sorted, 'level_match') * 100
        }
    }

    labels = list(metrics.keys())
    rel_vals = [metrics[l]['Relevance'] for l in labels]
    rat_vals = [metrics[l]['Rating'] / 5 * 100 for l in labels]
    lvl_vals = [metrics[l]['LevelMatch'] for l in labels]

    x = np.arange(len(labels))
    width = 0.25

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(x - width, rel_vals, width, label='Semantic Relevance', color='#48bb78')
    ax.bar(x, rat_vals, width, label='Normalized Rating Quality', color='#ecc94b')
    ax.bar(x + width, lvl_vals, width, label='Level Constraint Match', color='#4299e1')

    ax.set_ylabel('Performance (%)')
    ax.set_title('Course Recommendation: FAISS Baseline vs Hybrid Rerank')
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.legend(loc='lower left')
    ax.set_ylim(0, 120)

    for p in ax.patches:
        ax.annotate(f"{p.get_height():.0f}%", (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 5), textcoords='offset points', fontweight='bold', fontsize=9)

    plt.tight_layout()
    plt.savefig('eval_course_ranking.png', dpi=300)
    plt.close()
    
    # --- 2. Advanced Metrics Plot (Precision, Recall, F1) ---
    p_fai, r_fai, f1_fai = calculate_metrics(faiss_sorted, courses)
    p_hyb, r_hyb, f1_hyb = calculate_metrics(hybrid_sorted, courses)
    
    adv_metrics = {
        'Baseline FAISS': [p_fai, r_fai, f1_fai],
        'Hybrid Engine': [p_hyb, r_hyb, f1_hyb]
    }
    
    fig, ax = plt.subplots(figsize=(10, 6))
    x_adv = np.arange(3)
    metric_labels = ['Precision@10', 'Recall@10', 'F1-Score']
    
    ax.bar(x_adv - 0.15, [adv_metrics['Baseline FAISS'][i] for i in range(3)], 0.3, label='Baseline FAISS', color='#cbd5e0')
    ax.bar(x_adv + 0.15, [adv_metrics['Hybrid Engine'][i] for i in range(3)], 0.3, label='Hybrid AI Mentor', color='#667eea')

    ax.set_ylabel('Percentage (%)')
    ax.set_title('Course Ranking: Precision, Recall & F1-Score Evaluation')
    ax.set_xticks(x_adv)
    ax.set_xticklabels(metric_labels)
    ax.legend()
    ax.set_ylim(0, 110)
    
    for p in ax.patches:
        ax.annotate(f"{p.get_height():.0f}%", (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 5), textcoords='offset points', fontweight='bold')

    plt.tight_layout()
    plt.savefig('eval_course_metrics.png', dpi=300)
    plt.close()
    
    print("Saved eval_course_ranking.png and eval_course_metrics.png")

if __name__ == "__main__":
    set_style()
    simulate_job_ranking_evaluation()
    simulate_course_ranking_evaluation()
    print("Evaluation complete.")
