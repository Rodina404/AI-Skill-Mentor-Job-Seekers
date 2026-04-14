from modules.rule_engine import rule_mapping, find_in_db
from modules.embedding_engine import match_with_embeddings

# remove low-value skills
BLACKLIST = ["c", "html", "css"]

def normalize_skills(clean_skills, skills_db, rules, skill_embeddings):
    mapped, unknown = rule_mapping(clean_skills, rules)

    normalized = []

    # mapped
    for m in mapped:
        skill = find_in_db(m, skills_db)
        if skill:
            normalized.append({
                "skillId": skill["id"],
                "name": skill["name"],
                "confidence": 1.0
            })

    # unknown → embeddings
    normalized += match_with_embeddings(unknown, skills_db, skill_embeddings)

    # remove blacklist
    normalized = [
        s for s in normalized
        if s["name"].lower() not in BLACKLIST
    ]

    return normalized