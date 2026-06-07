"""
Normalizer - 4-Layer Skill Normalization Pipeline.

L1: Rule mapping (synonyms)
L2: Decision logic (matched vs unknown)
L3: Embedding matching (semantic similarity)
L4: Deduplication (highest confidence)

Pure Python module (no FastAPI imports).
"""

from typing import List, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def normalize_skills(
    skills: List[str],
    skills_db: Dict[str, Any],
    rules: Dict[str, str],
    skill_embeddings: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    4-layer intelligent skill normalization pipeline.
    
    Args:
        skills: Raw skill strings (may contain typos, variations, synonyms)
        skills_db: Database of 95 canonical skills {skillId: {name, category, ...}}
        rules: 170+ L1 rule mappings {user_input: skillId}
        skill_embeddings: Pre-computed embeddings for all canonical skills
    
    Returns:
        List[{skillId, name, confidence}] - normalized, deduplicated skills
    """
    if not skills:
        return []
    
    normalized = {}  # {skillId: {"name": str, "confidence": float}}
    unknown_skills = []
    
    for skill in skills:
        if not skill or not str(skill).strip():
            continue
        
        skill_lower = str(skill).strip().lower()
        
        # ==== L1: RULE MAPPING (exact synonym lookup) ====
        matched_skill_id = None
        
        # Try direct rule match
        if skill_lower in rules:
            matched_skill_id = rules[skill_lower]
        else:
            # Try variations (with spaces, underscores)
            for rule_key, rule_value in rules.items():
                if rule_key.replace('_', ' ').lower() == skill_lower:
                    matched_skill_id = rule_value
                    break
                if rule_key.replace(' ', '_').lower() == skill_lower.replace(' ', '_'):
                    matched_skill_id = rule_value
                    break
        
        if matched_skill_id and matched_skill_id in skills_db:
            # L1 match found - exact confidence
            skill_name = skills_db[matched_skill_id].get('name', matched_skill_id)
            if matched_skill_id not in normalized or normalized[matched_skill_id]['confidence'] < 1.0:
                normalized[matched_skill_id] = {
                    'name': skill_name,
                    'confidence': 1.0
                }
            continue
        
        # ==== L2: DECISION LOGIC ====
        # Unknown skill - route to L3
        unknown_skills.append(skill_lower)
    
    # ==== L3: EMBEDDING MATCHING ====
    if unknown_skills and skill_embeddings:
        try:
            # Load sentence transformer for user input embeddings
            try:
                from sentence_transformers import SentenceTransformer
                model = SentenceTransformer('all-MiniLM-L6-v2')
                
                # Encode unknown skills
                unknown_embeddings = model.encode(unknown_skills, convert_to_numpy=True)
                
                # Get canonical skill embeddings as matrix
                canonical_ids = list(skill_embeddings.keys())
                canonical_embeddings = np.array([skill_embeddings[cid] for cid in canonical_ids])
                
                threshold = 0.7
                
                # Find best matches for each unknown skill
                for idx, unknown_skill in enumerate(unknown_skills):
                    unknown_embedding = unknown_embeddings[idx].reshape(1, -1)
                    
                    # Compute cosine similarity
                    similarities = cosine_similarity(unknown_embedding, canonical_embeddings)[0]
                    best_idx = np.argmax(similarities)
                    best_score = float(similarities[best_idx])
                    
                    if best_score >= threshold:
                        best_skill_id = canonical_ids[best_idx]
                        skill_name = skills_db[best_skill_id].get('name', best_skill_id)
                        
                        # Keep highest confidence
                        if best_skill_id not in normalized or normalized[best_skill_id]['confidence'] < best_score:
                            normalized[best_skill_id] = {
                                'name': skill_name,
                                'confidence': best_score
                            }
            except ImportError:
                # sentence_transformers not available - skip L3 matching
                pass
        
        except Exception:
            # If embedding fails, skills remain unknown
            pass
    
    # ==== L4: DEDUPLICATION ====
    result = []
    for skill_id, skill_data in normalized.items():
        result.append({
            'skillId': skill_id,
            'name': skill_data['name'],
            'confidence': skill_data['confidence']
        })
    
    # Sort by confidence descending
    result.sort(key=lambda x: x['confidence'], reverse=True)
    
    return result
