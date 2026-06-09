import os
import sys
import json
import time
import numpy as np

# Reconfigure stdout to use UTF-8 to prevent UnicodeEncodeError on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8')

# Set python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.lc_extractor import extract_resume_data
from schemas import ResumeData

# Load ground truth
gt_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "data for evaluation", "m1_test_ground_truth.json")
with open(gt_path, "r", encoding="utf-8") as f:
    gt_data = json.load(f)

print("Starting live M1 evaluation on 10 CVs using Groq API...")

predictions = {}
for c in gt_data:
    cv_id = c["id"]
    text = c["raw_text"]
    print(f"Extracting {cv_id} ({c['difficulty']})...")
    start = time.time()
    
    # Retry up to 3 times for robust API calling
    for attempt in range(3):
        try:
            res = extract_resume_data(text)
            predictions[cv_id] = res.model_dump()
            print(f"  Success in {time.time() - start:.2f}s")
            break
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt == 2:
                print(f"  Failed to extract {cv_id} after 3 attempts.")
                # Fallback to empty representation to avoid crashing
                predictions[cv_id] = {
                    "name": None, "email": None, "phone": None, "location": None,
                    "education": [], "experience": [], "courses": [], "projects": [],
                    "skills": [], "soft_skills": []
                }
            else:
                # Wait 5 seconds before retrying on failure
                time.sleep(5)
    
    # Sleep 12 seconds between successful extractions to respect 6,000 TPM limit
    print("  Pausing 12s for TPM rate limits...")
    time.sleep(12)

# Helper to normalize strings for comparison
def norm(s):
    if s is None:
        return ""
    return str(s).strip().lower()

# Aliases matching rule
def matches_alias(a, b):
    a_norm = norm(a)
    b_norm = norm(b)
    if a_norm == b_norm:
        return True
    react_aliases = {"react", "react.js", "reactjs"}
    if a_norm in react_aliases and b_norm in react_aliases:
        return True
    if len(a_norm) > 4 and len(b_norm) > 4:
        if a_norm in b_norm or b_norm in a_norm:
            return True
    return False

# Degree level normalizer
def get_degree_level(d):
    d_norm = norm(d)
    if "master" in d_norm or "m.sc" in d_norm:
        return "master"
    if "bachelor" in d_norm or "b.sc" in d_norm or "b.b.a" in d_norm or "b.f.a" in d_norm or "undergraduate" in d_norm:
        return "bachelor"
    if "thanaweya" in d_norm:
        return "school"
    return d_norm

# Metric computation per field per CV
fields = ["name", "email", "phone", "location", "skills", "soft_skills", "education", "experience", "courses", "projects"]
results = {f: [] for f in fields}
cv_results = {c["id"]: {} for c in gt_data}

for c in gt_data:
    cv_id = c["id"]
    gt = c["ground_truth"]
    pred = predictions[cv_id]
    
    # 1. Scalar fields
    for field in ["name", "email", "phone", "location"]:
        gt_val = gt[field]
        pred_val = pred[field]
        
        if gt_val is None and pred_val is None:
            acc = 1.0
        elif gt_val is not None and pred_val is not None and (norm(gt_val) in norm(pred_val) or norm(pred_val) in norm(gt_val)):
            acc = 1.0
        else:
            acc = 0.0
        
        results[field].append({"p": acc, "r": acc, "f1": acc})
        cv_results[cv_id][field] = acc

    # 2. List fields (skills, soft_skills, courses, projects)
    for field in ["skills", "soft_skills", "courses", "projects"]:
        gt_list = gt[field] or []
        pred_list = pred[field] or []
        
        if len(gt_list) == 0 and len(pred_list) == 0:
            p, r, f1 = 1.0, 1.0, 1.0
        elif len(gt_list) == 0 or len(pred_list) == 0:
            p, r, f1 = 0.0, 0.0, 0.0
        else:
            tp = 0
            matched_pred = set()
            for g_item in gt_list:
                for idx, p_item in enumerate(pred_list):
                    if idx not in matched_pred and matches_alias(g_item, p_item):
                        tp += 1
                        matched_pred.add(idx)
                        break
            
            p = tp / len(pred_list)
            r = tp / len(gt_list)
            f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0.0
            
        results[field].append({"p": p, "r": r, "f1": f1})
        cv_results[cv_id][field] = f1

    # 3. Structured list fields: education
    gt_edu = gt["education"] or []
    pred_edu = pred["education"] or []
    
    if len(gt_edu) == 0 and len(pred_edu) == 0:
        p, r, f1 = 1.0, 1.0, 1.0
    elif len(gt_edu) == 0 or len(pred_edu) == 0:
        p, r, f1 = 0.0, 0.0, 0.0
    else:
        tp_credit = 0.0
        matched_pred = set()
        for g_item in gt_edu:
            g_inst = norm(g_item["institution"])
            g_deg = get_degree_level(g_item["degree"])
            g_end_year = None
            for y in g_item["end"].split():
                if y.isdigit():
                    g_end_year = int(y)
                    break
            
            for idx, p_item in enumerate(pred_edu):
                if idx in matched_pred:
                    continue
                p_inst = norm(p_item["institution"])
                p_deg = get_degree_level(p_item["degree"])
                
                inst_match = g_inst in p_inst or p_inst in g_inst or matches_alias(g_inst, p_inst)
                deg_match = g_deg == p_deg
                
                if inst_match and deg_match:
                    p_end_year = None
                    # pred has start and end
                    p_end_str = p_item.get("end") or p_item.get("year") or ""
                    for y in str(p_end_str).split():
                        if y.isdigit():
                            p_end_year = int(y)
                            break
                    
                    credit = 1.0
                    if g_end_year and p_end_year:
                        diff = abs(g_end_year - p_end_year)
                        if diff == 1:
                            credit = 0.5
                        elif diff > 1:
                            credit = 0.0
                    
                    tp_credit += credit
                    matched_pred.add(idx)
                    break
                    
        p = tp_credit / len(pred_edu) if len(pred_edu) > 0 else 0.0
        r = tp_credit / len(gt_edu) if len(gt_edu) > 0 else 0.0
        f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0.0

    results["education"].append({"p": p, "r": r, "f1": f1})
    cv_results[cv_id]["education"] = f1

    # 4. Structured list fields: experience
    gt_exp = gt["experience"] or []
    pred_exp = pred["experience"] or []
    
    if len(gt_exp) == 0 and len(pred_exp) == 0:
        p, r, f1 = 1.0, 1.0, 1.0
    elif len(gt_exp) == 0 or len(pred_exp) == 0:
        p, r, f1 = 0.0, 0.0, 0.0
    else:
        tp = 0
        matched_pred = set()
        for g_item in gt_exp:
            g_title = norm(g_item["title"])
            g_comp = norm(g_item["company"])
            
            for idx, p_item in enumerate(pred_exp):
                if idx in matched_pred:
                    continue
                p_title = norm(p_item["title"])
                p_comp = norm(p_item["company"])
                
                title_match = g_title in p_title or p_title in g_title or matches_alias(g_title, p_title)
                comp_match = g_comp in p_comp or p_comp in g_comp or matches_alias(g_comp, p_comp) or (g_comp == "self-employed" and p_comp == "freelance")
                
                if title_match and comp_match:
                    tp += 1
                    matched_pred.add(idx)
                    break
                    
        p = tp / len(pred_exp) if len(pred_exp) > 0 else 0.0
        r = tp / len(gt_exp) if len(gt_exp) > 0 else 0.0
        f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0.0

    results["experience"].append({"p": p, "r": r, "f1": f1})
    cv_results[cv_id]["experience"] = f1

# Compute Macro metrics
macro_metrics = {}
for field in fields:
    ps = [x["p"] for x in results[field]]
    rs = [x["r"] for x in results[field]]
    f1s = [x["f1"] for x in results[field]]
    macro_metrics[field] = {
        "precision": np.mean(ps),
        "recall": np.mean(rs),
        "f1": np.mean(f1s)
    }

overall_f1 = np.mean([macro_metrics[f]["f1"] for f in fields])

# Group by difficulty
difficulty_map = {c["id"]: c["difficulty"] for c in gt_data}
diff_groups = {"clean": ["cv_001", "cv_002"], "medium": ["cv_003", "cv_004", "cv_005"], "hard": ["cv_006", "cv_007", "cv_008", "cv_009", "cv_010"]}

diff_field_f1 = {}
for g_name, cvs in diff_groups.items():
    diff_field_f1[g_name] = {}
    for f in fields:
        f_scores = [cv_results[c_id][f] for c_id in cvs]
        diff_field_f1[g_name][f] = np.mean(f_scores)

# Identify which field degrades most
degradation = {}
for f in fields:
    degradation[f] = diff_field_f1["clean"][f] - diff_field_f1["hard"][f]
most_degraded = max(degradation, key=degradation.get)

# Null handling score
correct_null = 0
hallucination = 0

# check phone (cv_007)
if gt_data[6]["ground_truth"]["phone"] is None:
    if predictions["cv_007"]["phone"] is None:
        correct_null += 1
    else:
        hallucination += 1

# check email (cv_009)
if gt_data[8]["ground_truth"]["email"] is None:
    if predictions["cv_009"]["email"] is None:
        correct_null += 1
    else:
        hallucination += 1

# check education (cv_009)
if len(gt_data[8]["ground_truth"]["education"]) == 0:
    if len(predictions["cv_009"]["education"]) == 0:
        correct_null += 1
    else:
        hallucination += 1

null_score = correct_null / (correct_null + hallucination) if (correct_null + hallucination) > 0 else 1.0

# Schema consistency
schema_keys = ["name", "email", "phone", "location", "education", "experience", "courses", "projects", "skills", "soft_skills"]
consistent_count = 0
inconsistent_cvs = {}
for c_id, pred in predictions.items():
    missing = [k for k in schema_keys if k not in pred]
    if not missing:
        consistent_count += 1
    else:
        inconsistent_cvs[c_id] = missing

# Print out evaluation details
print("\n============ M1 EVALUATION SUMMARY ============")
print(f"Overall System F1:     {overall_f1:.4f}")
best_field = max(macro_metrics, key=lambda k: macro_metrics[k]["f1"])
worst_field = min(macro_metrics, key=lambda k: macro_metrics[k]["f1"])
print(f"Best Field:            {best_field} (F1={macro_metrics[best_field]['f1']:.2f})")
print(f"Worst Field:           {worst_field} (F1={macro_metrics[worst_field]['f1']:.2f})")
print(f"Null Hallucination Rate: {hallucination/3:.2f}")
print(f"Schema Consistency:    {consistent_count}/10 CVs fully consistent")
verdict = "READY" if overall_f1 >= 0.85 and consistent_count == 10 else "NEEDS FIXES"
print(f"Verdict:               {verdict}")
print("===============================================")

# Generate final verdict table format
print("\nFinal Verdict Table:")
print("| Field | Precision | Recall | F1 | Status |")
print("|---|---|---|---|---|")
for f in fields:
    m = macro_metrics[f]
    status = "✅" if m["f1"] >= 0.85 else "⚠️" if m["f1"] >= 0.65 else "❌"
    print(f"| {f} | {m['precision']:.2f} | {m['recall']:.2f} | {m['f1']:.2f} | {status} |")
overall_status = "✅" if overall_f1 >= 0.85 else "⚠️" if overall_f1 >= 0.65 else "❌"
print(f"| **OVERALL** | {np.mean([macro_metrics[f]['precision'] for f in fields]):.2f} | {np.mean([macro_metrics[f]['recall'] for f in fields]):.2f} | {overall_f1:.2f} | {overall_status} |")

# Output raw results so we can dump them to eval_plots.py
out_data = {
    "fields": fields,
    "precisions": [float(macro_metrics[f]["precision"]) for f in fields],
    "recalls": [float(macro_metrics[f]["recall"]) for f in fields],
    "f1_scores": [float(macro_metrics[f]["f1"]) for f in fields],
    "cv_results": {c_id: [float(cv_results[c_id][f]) for f in fields] for c_id in cv_results},
    "degradation_data": {f: [float(diff_field_f1["clean"][f]), float(diff_field_f1["medium"][f]), float(diff_field_f1["hard"][f])] for f in fields},
    "correct_null": correct_null,
    "hallucinations": hallucination,
    "consistent_count": consistent_count,
    "overall_f1": overall_f1,
    "best_field": best_field,
    "worst_field": worst_field
}

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "live_results.json"), "w") as f:
    json.dump(out_data, f, indent=2)

print("\nSaved live_results.json successfully.")
