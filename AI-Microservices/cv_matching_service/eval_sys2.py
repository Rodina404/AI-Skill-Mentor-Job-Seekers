"""
eval_sys2.py - Evaluate System 2: CV Matching
Run from: AI-Microservices/cv_matching_service/
Output:   eval_sys2_results.json
"""
import sys, json, math, logging
from pathlib import Path

logging.basicConfig(level=logging.WARNING)

HERE = Path(__file__).parent


# ── Metric helpers ──────────────────────────────────────────────────────────
def dcg(rels, k):
    return sum(r / math.log2(i + 2) for i, r in enumerate(rels[:k]))

def ndcg(rels, k):
    d = dcg(rels, k)
    ideal = dcg(sorted(rels, reverse=True), k)
    return d / ideal if ideal else 0.0

def mrr(rels):
    for i, r in enumerate(rels):
        if r >= 1:
            return 1.0 / (i + 1)
    return 0.0

def prec_at_k(rels, k):
    return sum(1 for r in rels[:k] if r >= 1) / k

def spearman(ids, gt):
    n = len(ids)
    if n < 2:
        return 0.0
    sys_r = {c: i+1 for i, c in enumerate(ids)}
    gt_r  = {c: i+1 for i, c in enumerate(sorted(ids, key=lambda x: gt.get(x,0), reverse=True))}
    d2 = sum((sys_r[c] - gt_r[c])**2 for c in ids)
    return 1 - 6*d2 / (n*(n**2-1))


# ── Candidate pools ─────────────────────────────────────────────────────────
QUERY1_JD = (
    "Senior Data Analyst. Required: Python, SQL, Power BI or Tableau, "
    "statistical analysis, data wrangling. Nice to have: machine learning, AWS or GCP."
)
QUERY1_GT = {
    "CV_A01":2,"CV_A02":2,"CV_A08":2,
    "CV_A07":1,"CV_A03":1,"CV_A04":1,"CV_A10":1,
    "CV_A05":0,"CV_A06":0,"CV_A09":0,
}
QUERY1_CANDS = [
    {"candidateId":"CV_A01","name":"CV_A01","experience":5,
     "skills":["Python","SQL","Power BI","Statistical Analysis","Data Wrangling"],
     "tools":["Power BI","Pandas","SQL Server"],"education":"MS Data Analytics"},
    {"candidateId":"CV_A02","name":"CV_A02","experience":6,
     "skills":["Python","SQL","Tableau","Statistics","Machine Learning"],
     "tools":["Tableau","Scikit-learn","AWS"],"education":"MS Statistics"},
    {"candidateId":"CV_A03","name":"CV_A03","experience":3,
     "skills":["Python","SQL","Data Analysis"],
     "tools":["Pandas","Matplotlib"],"education":"BS Computer Science"},
    {"candidateId":"CV_A04","name":"CV_A04","experience":2,
     "skills":["SQL","Excel","Data Wrangling"],
     "tools":["SQL Server","Excel"],"education":"BS Statistics"},
    {"candidateId":"CV_A05","name":"CV_A05","experience":2,
     "skills":["React","JavaScript","CSS","HTML"],
     "tools":["Webpack","Node.js"],"education":"BS Computer Science"},
    {"candidateId":"CV_A06","name":"CV_A06","experience":4,
     "skills":["Docker","Kubernetes","Terraform","CI/CD"],
     "tools":["Jenkins","Docker"],"education":"BS Systems Engineering"},
    {"candidateId":"CV_A07","name":"CV_A07","experience":3,
     "skills":["Python","Machine Learning","Deep Learning"],
     "tools":["TensorFlow","PyTorch"],"education":"MS AI"},
    {"candidateId":"CV_A08","name":"CV_A08","experience":7,
     "skills":["Python","SQL","Power BI","Statistics","AWS"],
     "tools":["Power BI","AWS","Pandas"],"education":"MS Data Science"},
    {"candidateId":"CV_A09","name":"CV_A09","experience":3,
     "skills":["C++","Embedded Systems","RTOS","Assembly"],
     "tools":["GDB","CMake"],"education":"BS Electrical Engineering"},
    {"candidateId":"CV_A10","name":"CV_A10","experience":1,
     "skills":["SQL","Tableau","Excel","Data Analysis"],
     "tools":["Tableau","Excel"],"education":"BS Business Analytics"},
]

QUERY2_JD = (
    "Full-stack developer. Required: React, Node.js, REST APIs, PostgreSQL. "
    "Nice to have: Docker, AWS."
)
QUERY2_GT = {
    "CV_B01":2,"CV_B02":2,"CV_B08":2,
    "CV_B03":1,"CV_B04":1,"CV_B07":1,"CV_B10":1,
    "CV_B05":0,"CV_B06":0,"CV_B09":0,
}
QUERY2_CANDS = [
    {"candidateId":"CV_B01","name":"CV_B01","experience":5,
     "skills":["React","Node.js","REST API","PostgreSQL","Docker"],
     "tools":["React","Node.js","PostgreSQL"],"education":"BS Computer Science"},
    {"candidateId":"CV_B02","name":"CV_B02","experience":6,
     "skills":["React","Node.js","REST APIs","PostgreSQL","AWS"],
     "tools":["Docker","AWS","Express.js"],"education":"MS Software Engineering"},
    {"candidateId":"CV_B03","name":"CV_B03","experience":3,
     "skills":["React","Node.js","JavaScript","MongoDB"],
     "tools":["Express.js","MongoDB"],"education":"BS Computer Science"},
    {"candidateId":"CV_B04","name":"CV_B04","experience":3,
     "skills":["Django","REST APIs","PostgreSQL","Python"],
     "tools":["Django","PostgreSQL"],"education":"BS Software Engineering"},
    {"candidateId":"CV_B05","name":"CV_B05","experience":4,
     "skills":["Python","Machine Learning","SQL","Statistics"],
     "tools":["TensorFlow","Pandas"],"education":"MS Data Science"},
    {"candidateId":"CV_B06","name":"CV_B06","experience":2,
     "skills":["Swift","iOS","Objective-C","Xcode"],
     "tools":["Xcode","CocoaPods"],"education":"BS Computer Science"},
    {"candidateId":"CV_B07","name":"CV_B07","experience":2,
     "skills":["React","JavaScript","CSS","MySQL"],
     "tools":["React","MySQL"],"education":"BS Web Development"},
    {"candidateId":"CV_B08","name":"CV_B08","experience":7,
     "skills":["React","Node.js","REST APIs","PostgreSQL","Docker","AWS"],
     "tools":["Docker","AWS","PostgreSQL","Express.js"],"education":"MS Computer Science"},
    {"candidateId":"CV_B09","name":"CV_B09","experience":3,
     "skills":["Python","NLP","Deep Learning","BERT"],
     "tools":["Hugging Face","PyTorch"],"education":"MS NLP"},
    {"candidateId":"CV_B10","name":"CV_B10","experience":2,
     "skills":["Node.js","PostgreSQL","Express.js","REST API"],
     "tools":["PostgreSQL","Express.js"],"education":"BS Information Systems"},
]


# ── Run matching ─────────────────────────────────────────────────────────────
def do_match(jd, cands):
    from core.matcher import match_candidates
    return match_candidates(jd, cands)


def evaluate_query(jd, cands, gt, label):
    ranked = do_match(jd, cands)
    ids    = [r["name"] for r in ranked]
    scores = [r["score"] for r in ranked]
    rels   = [gt.get(c, 0) for c in ids]

    nd = ndcg(rels, 5)
    mr = mrr(rels)
    p3 = prec_at_k(rels, 3)
    p5 = prec_at_k(rels, 5)
    sp = spearman(ids, gt)

    print("\n  {} Ranking:".format(label))
    print("  {:6} {:12} {:>8}  {:>12}".format("Rank","Candidate","Score","GT-Relevance"))
    print("  " + "-"*44)
    for rank, (c, s) in enumerate(zip(ids, scores), 1):
        print("  {:<6} {:<12} {:>8.2f}  {:>12}".format(rank, c, s, gt.get(c,0)))

    print("\n  NDCG@5={:.4f}  MRR={:.4f}  P@3={:.4f}  P@5={:.4f}  Spearman={:.4f}".format(
        nd, mr, p3, p5, sp))

    return dict(ids=ids, scores=scores, rels=rels,
                ndcg5=nd, mrr=mr, p3=p3, p5=p5, spearman=sp)


def main():
    print("=" * 65)
    print("  SYSTEM 2 EVALUATION - CV Matching")
    print("=" * 65)

    print("\n--- STEP 5: Ranking Quality Tests ---")
    q1 = evaluate_query(QUERY1_JD, QUERY1_CANDS, QUERY1_GT, "Query 1 (Data Analyst)")
    q2 = evaluate_query(QUERY2_JD, QUERY2_CANDS, QUERY2_GT, "Query 2 (Full-Stack Dev)")

    print("\n--- STEP 6: System 2 Aggregate Metrics ---")
    mean_ndcg  = (q1["ndcg5"]   + q2["ndcg5"])   / 2
    mean_mrr   = (q1["mrr"]     + q2["mrr"])     / 2
    mean_p5    = (q1["p5"]      + q2["p5"])      / 2
    mean_spear = (q1["spearman"]+ q2["spearman"]) / 2

    ndcg_pass  = mean_ndcg  >= 0.75
    mrr_pass   = mean_mrr   >= 0.60
    spear_pass = mean_spear >= 0.50

    print("\n  Mean NDCG@5   : {:.4f}  target>=0.75 -> {}".format(mean_ndcg,  "PASS" if ndcg_pass  else "FAIL"))
    print("  Mean MRR      : {:.4f}  target>=0.60 -> {}".format(mean_mrr,   "PASS" if mrr_pass   else "FAIL"))
    print("  Mean P@5      : {:.4f}".format(mean_p5))
    print("  Mean Spearman : {:.4f}  target>=0.50 -> {}".format(mean_spear, "PASS" if spear_pass else "FAIL"))
    print("\n  System 2 overall (NDCG@5>=0.75): {}".format("PASS" if ndcg_pass else "FAIL"))

    out = {
        "q1": q1, "q2": q2,
        "mean_ndcg": mean_ndcg, "mean_mrr": mean_mrr,
        "mean_p5": mean_p5, "mean_spearman": mean_spear,
        "ndcg_pass": ndcg_pass, "mrr_pass": mrr_pass, "spear_pass": spear_pass,
        "pass": ndcg_pass,
    }
    out_path = HERE.parent.parent / "eval_sys2_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, default=str)
    print("\n  Results -> eval_sys2_results.json")
    return out

if __name__ == "__main__":
    main()
