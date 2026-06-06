import os
import random
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

def set_style():
    sns.set_theme(style="whitegrid")
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica', 'DejaVu Sans']

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

    def avg(lst, key):
        return sum(x[key] for x in lst) / len(lst) if lst else 0

    metrics = {
        'Recency-Only Sort': {'Readiness (%)': avg(recency_sorted, 'readiness') * 100, 'Freshness (Days)': avg(recency_sorted, 'recent_days')},
        'Readiness-Only Sort': {'Readiness (%)': avg(readiness_sorted, 'readiness') * 100, 'Freshness (Days)': avg(readiness_sorted, 'recent_days')},
        'Hybrid Sort (AI Mentor)': {'Readiness (%)': avg(hybrid_sorted, 'readiness') * 100, 'Freshness (Days)': avg(hybrid_sorted, 'recent_days')}
    }

    labels = list(metrics.keys())
    readiness_vals = [metrics[l]['Readiness (%)'] for l in labels]
    # Invert freshness so higher is better for plotting (60 - days)
    freshness_vals = [(60 - metrics[l]['Freshness (Days)']) / 60 * 100 for l in labels] 

    x = np.arange(len(labels))
    width = 0.35

    fig, ax = plt.subplots(figsize=(10, 6))
    rects1 = ax.bar(x - width/2, readiness_vals, width, label='Avg Readiness (%)', color='#667eea')
    rects2 = ax.bar(x + width/2, freshness_vals, width, label='Avg Freshness Score', color='#764ba2')

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
    print("Saved eval_job_ranking.png")

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
    faiss_sorted = sorted(courses, key=lambda x: x['semantic'], reverse=True)[:5]
    
    # Approach 2: AI Mentor Hybrid Reranking
    hybrid_sorted = sorted(courses, key=lambda x: x['hybrid'], reverse=True)[:5]

    def avg(lst, key): return sum(x[key] for x in lst) / len(lst) if lst else 0

    metrics = {
        'Baseline FAISS Search': {
            'Relevance (%)': avg(faiss_sorted, 'semantic') * 100,
            'Avg Rating (/5)': avg(faiss_sorted, 'rating'),
            'Level Match (%)': avg(faiss_sorted, 'level_match') * 100
        },
        'Hybrid Rerank Engine': {
            'Relevance (%)': avg(hybrid_sorted, 'semantic') * 100,
            'Avg Rating (/5)': avg(hybrid_sorted, 'rating'),
            'Level Match (%)': avg(hybrid_sorted, 'level_match') * 100
        }
    }

    labels = list(metrics.keys())
    rel_vals = [metrics[l]['Relevance (%)'] for l in labels]
    rat_vals = [metrics[l]['Avg Rating (/5)'] / 5 * 100 for l in labels] # Normalize to 100 for plot
    lvl_vals = [metrics[l]['Level Match (%)'] for l in labels]

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
    ax.legend()
    ax.set_ylim(0, 120)

    for p in ax.patches:
        ax.annotate(f"{p.get_height():.0f}%", (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 5), textcoords='offset points', fontweight='bold', fontsize=9)

    plt.tight_layout()
    plt.savefig('eval_course_ranking.png', dpi=300)
    plt.close()
    print("Saved eval_course_ranking.png")

if __name__ == "__main__":
    set_style()
    simulate_job_ranking_evaluation()
    simulate_course_ranking_evaluation()
    print("Evaluation complete.")
