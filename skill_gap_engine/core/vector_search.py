import numpy as np
import faiss
import pickle
from pathlib import Path
from typing import List, Dict
from sentence_transformers import SentenceTransformer

_sbert_model = None
_index = None
_courses_df = None

def _load_artifacts():
    global _sbert_model, _index, _courses_df
    if _sbert_model is None:
        _sbert_model = SentenceTransformer('all-mpnet-base-v2')
        artifacts_dir = Path(__file__).parent.parent.parent / "artifacts"
        
        index_path = artifacts_dir / "courses.index"
        pkl_path = artifacts_dir / "courses.pkl"
        
        if not index_path.exists() or not pkl_path.exists():
            raise FileNotFoundError(f"Missing brain artifacts in {artifacts_dir}. Please run builder.py first.")

        _index = faiss.read_index(str(index_path))
        with open(pkl_path, 'rb') as f:
            _courses_df = pickle.load(f)

def search_courses(queries: List[str], top_k: int = 50) -> List[Dict]:
    """
    L1-3: Course Vector DB Search (Top-K)
    Input: list of query strings (e.g. expanded skills)
    Output: list of candidate courses with semanticScore
    """
    _load_artifacts()
    
    candidates = []
    seen_ids = set()
    
    for query in queries:
        try:
            # --- 1. KEYWORD ENRICHMENT (FULL SCAN) ---
            # Search the full 98k dataframe for literal matches in title/headline
            # This ensures we find the "real" courses even if they were sampled out of the index
            q_lower = query.lower()
            # Simple heuristic: if the keyword is short, match as whole word; if long, match substring
            mask = (_courses_df['title'].str.contains(q_lower, case=False, na=False)) | \
                   (_courses_df['headline'].str.contains(q_lower, case=False, na=False))
            
            keyword_matches = _courses_df[mask].sort_values('num_subscribers', ascending=False).head(10)
            
            for _, row in keyword_matches.iterrows():
                course_id = str(row.get('id', ''))
                if not course_id or course_id in seen_ids:
                    continue
                
                seen_ids.add(course_id)
                url = str(row.get('url', ''))
                if not url or url == 'nan':
                    # Fallback to a search URL if exact URL is missing
                    url = f"https://www.udemy.com/courses/search/?q={str(row.get('title', ''))}"
                
                candidates.append({
                    "courseId": course_id,
                    "title": str(row.get('title', '')),
                    "url": url,
                    "provider": str(row.get('instructor_names', 'Unknown')),
                    "duration": float(row.get('duration_hours', 5.0)),
                    "level": str(row.get('instructional_level', 'All Levels')),
                    "language": str(row.get('language', 'English')),
                    "rating": float(row.get('rating', 0.0)),
                    "popularity": int(row.get('num_subscribers', 0) if not np.isnan(row.get('num_subscribers', 0)) else 0),
                    "category": str(row.get('category', 'Technology')),
                    "semanticScore": 0.95 # Artificial boost for exact keyword matches
                })

            # --- 2. VECTOR SEARCH (SMART MATCHES) ---
            query_embedding = _sbert_model.encode([query], convert_to_numpy=True)[0].astype('float32')
            # MUST normalize the query vector — the index uses IndexFlatIP (cosine similarity)
            query_embedding = query_embedding.reshape(1, -1)
            faiss.normalize_L2(query_embedding)
            distances, indices = _index.search(query_embedding, top_k)
            
            for rank, idx in enumerate(indices[0]):
                if idx == -1: continue
                if idx < len(_courses_df):
                    row = _courses_df.iloc[idx]
                    course_id = str(row.get('id', f'unknown_{idx}'))
                    
                    if course_id in seen_ids:
                        continue
                        
                    seen_ids.add(course_id)
                    # After L2 normalization, IndexFlatIP returns cosine similarity in [-1, 1]
                    # Since we only care about positive matches, we clip to [0, 1]
                    semantic_score = max(0.0, float(distances[0][rank]))
                    
                    url = str(row.get('url', ''))
                    if not url or url == 'nan':
                        url = f"https://www.udemy.com/courses/search/?q={str(row.get('title', ''))}"
                        
                    candidate = {
                        "courseId": course_id,
                        "title": str(row.get('title', '')),
                        "url": url,
                        "provider": str(row.get('instructor_names', 'Unknown')),
                        "duration": float(row.get('duration_hours', 5.0)),
                        "level": str(row.get('instructional_level', 'All Levels')),
                        "language": str(row.get('language', 'English')),
                        "rating": float(row.get('rating', 0.0)),
                        "popularity": int(row.get('num_subscribers', 0) if not np.isnan(row.get('num_subscribers', 0)) else 0),
                        "category": str(row.get('category', 'Technology')),
                        "semanticScore": semantic_score
                    }
                    candidates.append(candidate)
        except Exception:
            pass
            
    return candidates
