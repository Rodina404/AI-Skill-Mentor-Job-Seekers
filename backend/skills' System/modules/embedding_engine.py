from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

def compute_embeddings(skills_db):
    names = [s["name"] for s in skills_db]
    embeddings = model.encode(names)
    return embeddings


def match_with_embeddings(unknown_skills, skills_db, skill_embeddings):
    results = []

    for skill in unknown_skills:
        emb = model.encode([skill])
        sims = cosine_similarity(emb, skill_embeddings)[0]

        best_idx = sims.argmax()
        confidence = sims[best_idx]

        if confidence > 0.7:
            matched = skills_db[best_idx]
            results.append({
                "skillId": matched["id"],
                "name": matched["name"],
                "confidence": float(confidence)
            })
        else:
            results.append({
                "skillId": None,
                "name": skill,
                "confidence": float(confidence)
            })

    return results