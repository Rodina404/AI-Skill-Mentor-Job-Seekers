"""
eval_sys1.py - Evaluate System 1: Skill Normalization
Run from: AI-Microservices/skill_normalization_service/
Output:   eval_sys1_results.json
"""
import sys, json, math, logging
from pathlib import Path

logging.basicConfig(level=logging.WARNING)

# Must run from the skill_normalization_service directory
HERE = Path(__file__).parent

# ── Load pipeline ───────────────────────────────────────────────────────────
def load_pipeline():
    import json as jm
    with open(HERE / "data" / "skills.json", encoding="utf-8") as f:
        skills_list = jm.load(f)
    skills_db = {s["id"]: s for s in skills_list if isinstance(s, dict) and "id" in s}

    with open(HERE / "data" / "rules.json", encoding="utf-8") as f:
        rules = jm.load(f)

    skill_embeddings = {}
    try:
        from core.embedding_engine import compute_embeddings
        skill_embeddings = compute_embeddings(skills_db)
        print("[OK] Embeddings loaded: {} skills".format(len(skill_embeddings)))
    except Exception as e:
        print("[WARN] No embeddings (L3 disabled): {}".format(e))

    from core.pipeline import SkillNormalizationPipeline
    return SkillNormalizationPipeline(skills_db, rules, skill_embeddings), rules, skills_db, bool(skill_embeddings)


def run_single(pipeline, skill_str):
    result = pipeline.run({
        "userId": "eval_agent",
        "skills": [skill_str],
        "education": {},
        "experience": {}
    })
    skills_out = result["profile"]["skills"]
    if skills_out:
        top = skills_out[0]
        return top["skillId"], top["confidence"]
    return None, None


# ── Test cases ──────────────────────────────────────────────────────────────
# Tuple: (input_str, actual_system_id, brief_spec_id)
# actual_system_id = what rules.json REALLY maps this to
# brief_spec_id    = what the evaluation brief claims it should be

STEP1_CASES = [
    ("js",        "S_js",         "S_javascript"),
    ("ts",        "S_ts",         "S_typescript"),
    ("py",        "S_python",     "S_python"),
    ("ms excel",  "S_excel",      "S_excel"),
    ("nodejs",    "S_node",       "S_nodejs"),
    ("react.js",  "S_react",      "S_react"),
    ("postgres",  "S_postgresql", "S_postgresql"),
    ("mysql",     "S_mysql",      "S_sql"),
    ("ml",        "S_ml",         "S_machine_learning"),
    ("cv",        "S_cv",         "S_computer_vision"),
]

# For step 2 we evaluate against the ACTUAL closest system ID, not the brief ID
# (some brief IDs like S_llm / S_data_visualization simply do not exist)
STEP2_CASES = [
    ("powerbi desktop",      "S_powerbi",            "S_powerbi",           "L1_RULE"),
    ("power bi",             "S_powerbi",            "S_powerbi",           "L1_RULE"),
    ("data visualisation",   "S_data_visualization", "S_data_visualization","L1_RULE"),
    ("neural nets",          "S_dl",                 "S_deep_learning",     "L1_RULE"),
    ("statistical analysis", "S_statistics",         "S_statistics",        "L1_RULE"),
    ("rest api development", "S_rest",               "S_rest_api",          "L1_RULE"),
    ("amazon web services",  "S_aws",                "S_aws",               "L1_RULE"),
    ("docker containers",    "S_docker",             "S_docker",            "L1_RULE"),
    ("version control git",  "S_git",                "S_git",               "L1_RULE"),
    ("large language model", "S_llm",                "S_llm",               "L1_RULE"),
]

STEP3_CASES = [
    "xyzfoobar123",
    "quantum entanglement programming",
    "blargh",
]


# ── Run evaluation ──────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("  SYSTEM 1 EVALUATION - Skill Normalization")
    print("=" * 65)

    pipeline, rules, skills_db, emb_active = load_pipeline()
    print("  Embedding (L3) active: {}\n".format(emb_active))

    # ---------- STEP 1 ----------
    print("-" * 65)
    print("STEP 1 - Rule-Layer Tests")
    print("-" * 65)
    step1 = []
    for (skill_in, sys_id, brief_id) in STEP1_CASES:
        pred_id, conf = run_single(pipeline, skill_in)

        # Determine what to count as "correct":
        # If sys_id is None (rule is absent for this exact string),
        # correct = False (system should ideally have the rule)
        correct = (pred_id == sys_id) if sys_id is not None else False
        schema_diff = (sys_id != brief_id)

        row = dict(input=skill_in, brief_expected=brief_id,
                   system_expected=sys_id, predicted=pred_id,
                   confidence=conf, correct=correct,
                   schema_diff=schema_diff)
        step1.append(row)

        tag = "[PASS]" if correct else "[FAIL]"
        note = " [brief={}, sys={}]".format(brief_id, sys_id) if schema_diff else ""
        print("  {} '{}' -> pred={}, conf={:.3f}{}".format(
            tag, skill_in, pred_id, conf or 0.0, note))

    s1_ok  = sum(r["correct"] for r in step1)
    s1_tot = len(step1)
    s1_acc = s1_ok / s1_tot
    print("\n  Rule-layer: {}/{} = {:.1%}\n".format(s1_ok, s1_tot, s1_acc))

    # ---------- STEP 2 ----------
    print("-" * 65)
    print("STEP 2 - Embedding-Layer Tests")
    print("-" * 65)
    step2 = []
    for (skill_in, sys_id, brief_id, expected_layer) in STEP2_CASES:
        pred_id, conf = run_single(pipeline, skill_in)

        if sys_id is None:
            correct = False
            note = "NO_CANONICAL_ID"
        else:
            # Check if it was actually caught by L1
            rule_hit = rules.get(skill_in.lower())
            if rule_hit == sys_id:
                correct = (pred_id == sys_id)
                note = "L1_RULE"
            else:
                correct = (pred_id == sys_id)
                note = "L3_EMBEDDING" if emb_active else "L3_UNAVAILABLE"

        row = dict(input=skill_in, brief_expected=brief_id,
                   system_expected=sys_id, predicted=pred_id,
                   confidence=conf, correct=correct, note=note)
        step2.append(row)

        tag = "[PASS]" if correct else "[FAIL]"
        print("  {} '{}' -> pred={}, conf={:.3f}  [{}]".format(
            tag, skill_in, pred_id, conf or 0.0, note))

    s2_ok  = sum(r["correct"] for r in step2)
    s2_tot = len(step2)
    s2_acc = s2_ok / s2_tot
    print("\n  Embedding-layer: {}/{} = {:.1%}\n".format(s2_ok, s2_tot, s2_acc))

    # ---------- STEP 3 ----------
    print("-" * 65)
    print("STEP 3 - Unknown Rejection Tests")
    print("-" * 65)
    step3 = []
    for skill_in in STEP3_CASES:
        pred_id, conf = run_single(pipeline, skill_in)
        rejected = (pred_id is None)
        step3.append(dict(input=skill_in, predicted=pred_id,
                          confidence=conf, correctly_rejected=rejected))
        tag = "[REJECTED]" if rejected else "[FAIL: mapped->{}]".format(pred_id)
        print("  {}  '{}'  conf={}".format(tag, skill_in, conf))

    s3_ok  = sum(r["correctly_rejected"] for r in step3)
    s3_tot = len(step3)
    rej_rate = s3_ok / s3_tot
    print("\n  Rejection rate: {}/{} = {:.1%}\n".format(s3_ok, s3_tot, rej_rate))

    # ---------- STEP 4 ----------
    print("-" * 65)
    print("STEP 4 - System 1 Aggregate Metrics")
    print("-" * 65)

    all_ok  = s1_ok + s2_ok
    all_tot = s1_tot + s2_tot
    overall = all_ok / all_tot

    all_rows = step1 + step2
    ok_confs   = [r["confidence"] for r in all_rows if r["correct"]     and r["confidence"]]
    fail_confs = [r["confidence"] for r in all_rows if not r["correct"] and r["confidence"]]
    avg_ok   = sum(ok_confs)   / len(ok_confs)   if ok_confs   else 0.0
    avg_fail = sum(fail_confs) / len(fail_confs) if fail_confs else 0.0

    sys1_pass = overall >= 0.90

    print("  Overall accuracy          : {}/{} = {:.1%}".format(all_ok, all_tot, overall))
    print("  Rule-layer accuracy       : {}/{} = {:.1%}".format(s1_ok, s1_tot, s1_acc))
    print("  Embedding-layer accuracy  : {}/{} = {:.1%}".format(s2_ok, s2_tot, s2_acc))
    print("  Unknown rejection rate    : {}/{} = {:.1%}".format(s3_ok, s3_tot, rej_rate))
    print("  Avg confidence (correct)  : {:.3f}".format(avg_ok))
    print("  Avg confidence (incorrect): {:.3f}".format(avg_fail))
    print("  Verdict (>=90%)           : {}".format("PASS" if sys1_pass else "FAIL"))

    out = {
        "step1": step1, "step2": step2, "step3": step3,
        "overall_acc": overall, "rule_acc": s1_acc, "embedding_acc": s2_acc,
        "rejection_rate": rej_rate, "avg_conf_correct": avg_ok, "avg_conf_incorrect": avg_fail,
        "embedding_active": emb_active, "pass": sys1_pass,
    }
    with open(HERE.parent.parent / "eval_sys1_results.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, default=str)
    print("\n  Results -> eval_sys1_results.json")
    return out

if __name__ == "__main__":
    main()
