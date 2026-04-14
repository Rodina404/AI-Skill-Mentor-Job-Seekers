"""
Embedding Engine - Computes skill embeddings using sentence-transformers.

Pure Python module (no FastAPI imports).
"""

from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

try:
    from sentence_transformers import SentenceTransformer
    EMBEDDING_AVAILABLE = True
except ImportError:
    EMBEDDING_AVAILABLE = False
    logger.warning("sentence-transformers not available - L3 embedding matching disabled")


def compute_embeddings(skills_db: Dict[str, Any]) -> Dict[str, Any]:
    """
    Pre-compute embeddings for all canonical skills.
    
    Used by L3 (embedding matching layer) to find semantic similarities.
    
    Args:
        skills_db: Dictionary of canonical skills {skillId: {..., "name": str}}
    
    Returns:
        Dictionary mapping skillId → embedding vector (numpy array)
    """
    if not EMBEDDING_AVAILABLE:
        logger.warning("Embeddings disabled - sentence-transformers not available")
        return {}
    
    try:
        # Load pre-trained sentence transformer model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Extract skill names and compute embeddings
        skill_embeddings = {}
        skill_names = []
        skill_ids = []
        
        # Handle both dict and list formats
        if isinstance(skills_db, dict):
            for skill_id, skill_data in skills_db.items():
                skill_name = skill_data.get('name', '')
                if skill_name:
                    skill_names.append(skill_name)
                    skill_ids.append(skill_id)
        else:
            # Fallback for list format
            for skill in skills_db:
                if isinstance(skill, dict):
                    skill_id = skill.get('id', '')
                    skill_name = skill.get('name', '')
                    if skill_name and skill_id:
                        skill_names.append(skill_name)
                        skill_ids.append(skill_id)
        
        if not skill_names:
            return {}
        
        # Compute embeddings (returns numpy arrays)
        embeddings = model.encode(skill_names, convert_to_numpy=True)
        
        # Map skill IDs to embeddings
        for skill_id, embedding in zip(skill_ids, embeddings):
            skill_embeddings[skill_id] = embedding
        
        return skill_embeddings
    
    except Exception as e:
        raise RuntimeError(f"Failed to compute embeddings: {str(e)}")
