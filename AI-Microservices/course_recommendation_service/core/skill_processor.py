import re
import json
import os
from typing import List, Dict, Set, Optional
import numpy as np
from sentence_transformers import SentenceTransformer

class SkillProcessor:
    """Handles semantic skill extraction and readiness scoring."""
    
    def __init__(self, taxonomy: List[str] = None, model: Optional[SentenceTransformer] = None, model_name: str = "all-mpnet-base-v2", device: str = "cpu"):
        if taxonomy:
            self.taxonomy = taxonomy
        else:
            # Try to load from local dataset
            taxonomy_path = os.path.join(os.path.dirname(__file__), "datasets", "professional_taxonomy.json")
            if os.path.exists(taxonomy_path):
                with open(taxonomy_path, "r") as f:
                    data = json.load(f)
                    self.taxonomy = []
                    for cat in data.get("categories", {}).values():
                        self.taxonomy.extend(cat)
            else:
                # Fallback to default
                self.taxonomy = [
                    "Python", "Data Science", "Machine Learning", "Deep Learning",
                    "Computer Science", "Software Engineering", "Machine Learning Engineering",
                    "Data Engineering", "Artificial Intelligence", "Statistics",
                    "Business Intelligence", "Information Systems", "Engineering",
                    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "SQL", "NoSQL",
                    "JavaScript", "React", "Node.js", "TypeScript", "FastAPI", "Flask",
                    "Java", "Spring Boot", "C++", "Rust", "Go", "TensorFlow", "PyTorch",
                    "Pandas", "NumPy", "Scikit-Learn", "Natural Language Processing",
                    "Computer Vision", "CI/CD", "Git", "Agile", "Scrum", "REST API"
                ]

        self.normalized_taxonomy = {s.lower(): s for s in self.taxonomy}

        if model is not None:
            self.model = model
        else:
            self.model = SentenceTransformer(model_name, device=device)

        # Precompute taxonomy embeddings for semantic matching
        self.taxonomy_embeddings = self.model.encode(self.taxonomy, convert_to_numpy=True, normalize_embeddings=True)

    def _embed_texts(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.taxonomy_embeddings.shape[1]), dtype=np.float32)
        embeddings = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        if embeddings.ndim == 1:
            embeddings = np.expand_dims(embeddings, axis=0)
        return embeddings

    def extract_skills(self, text: str, threshold: float = 0.52) -> List[str]:
        """Extracts skills intelligently using semantic similarity and context awareness."""
        if not text:
            return []

        normalized_text = text.strip()
        extracted: Set[str] = set()
        lower_text = normalized_text.lower()

        # Phase 1: Exact keyword matching for high-confidence skills
        for skill_lower, skill_original in self.normalized_taxonomy.items():
            pattern = rf'\b{re.escape(skill_lower)}\b'
            if re.search(pattern, lower_text):
                extracted.add(skill_original)

        # Phase 2: Resume-specific domain recognition
        domain_patterns = {
            r'\b(bachelor|master|phd|degree|bs|ms|phd)\s+(in|of)?\s*(computer science|cse|cs|computer engineering|aie?|artificial intelligence|machine learning|data science|software engineering)\b': 
                ["Computer Science", "Artificial Intelligence", "Software Engineering"],
            r'\b(ml|machine learning|deep learning|neural network|ai|artificial intelligence)\b': 
                ["Machine Learning", "Deep Learning", "Artificial Intelligence"],
            r'\b(pytorch|tensorflow|keras|scikit.?learn|numpy|pandas)\b': 
                ["PyTorch", "TensorFlow", "Machine Learning", "Data Science"],
            r'\b(aws|azure|gcp|google cloud|kubernetes|docker|devops)\b': 
                ["AWS", "Azure", "GCP", "Kubernetes", "Docker", "CI/CD"],
            r'\b(javascript|typescript|react|node|express|vue|angular)\b': 
                ["JavaScript", "TypeScript", "React", "Node.js", "Frontend Development"],
            r'\b(python|java|c\+\+|rust|go|c#)\b': 
                ["Python", "Java", "C++", "Rust", "Go"],
            r'\b(sql|nosql|mongodb|postgresql|mysql|database)\b': 
                ["SQL", "NoSQL", "Data Engineering"],
            r'\b(rest api|graphql|microservice|api design)\b': 
                ["REST API", "API Design", "Microservices"],
        }
        
        for pattern, skills in domain_patterns.items():
            if re.search(pattern, lower_text, re.IGNORECASE):
                extracted.update(skills)

        # Phase 3: Context-aware semantic extraction
        sentences = re.split(r'[.\n!?]+', normalized_text)
        for sentence in sentences:
            if len(sentence.strip()) > 10:
                sent_embeddings = self._embed_texts([sentence.strip()])
                similarity_matrix = np.matmul(self.taxonomy_embeddings, sent_embeddings.T)
                best_similarities = similarity_matrix.flatten()
                
                for idx, score in enumerate(best_similarities):
                    if score >= threshold:
                        extracted.add(self.taxonomy[idx])

        # Phase 4: Add top semantic matches even with lower scores
        all_text_embeddings = self._embed_texts([normalized_text])
        similarity_matrix = np.matmul(self.taxonomy_embeddings, all_text_embeddings.T)
        best_similarities = similarity_matrix.flatten()
        top_indices = np.argsort(-best_similarities)[:12]
        
        for idx in top_indices:
            if best_similarities[idx] >= threshold - 0.10:
                extracted.add(self.taxonomy[idx])

        # Keep results ordered by taxonomy priority
        ordered = [skill for skill in self.taxonomy if skill in extracted]
        return ordered if ordered else []

    def calculate_readiness_score(self, user_skills: List[str], required_skills: List[str], threshold: float = 0.55) -> Dict:
        """Calculates readiness using exact and semantic skill matching."""
        if not required_skills:
            return {"score": 1.0, "missing": [], "matched": user_skills}

        user_skills_clean = [s.strip() for s in user_skills if s and s.strip()]
        required_skills_clean = [s.strip() for s in required_skills if s and s.strip()]

        matched: Set[str] = set()
        user_lower = {s.lower() for s in user_skills_clean}

        for required in required_skills_clean:
            if required.lower() in user_lower:
                matched.add(required)

        if user_skills_clean and len(matched) < len(required_skills_clean):
            unmatched_required = [req for req in required_skills_clean if req not in matched]
            if unmatched_required:
                required_embeddings = self._embed_texts(unmatched_required)
                user_embeddings = self._embed_texts(user_skills_clean)
                if required_embeddings.size and user_embeddings.size:
                    similarity_matrix = np.matmul(required_embeddings, user_embeddings.T)
                    best_scores = np.max(similarity_matrix, axis=1)
                    for idx, score in enumerate(best_scores):
                        if score >= threshold:
                            matched.add(unmatched_required[idx])

        missing = [req for req in required_skills_clean if req not in matched]
        score = len(matched) / len(required_skills_clean) if required_skills_clean else 0

        return {
            "score": round(score, 2),
            "matched": sorted(list(matched)),
            "missing": sorted(missing)
        }

if __name__ == "__main__":
    # Quick test
    processor = SkillProcessor()
    sample_text = "I am a Python developer with experience in Docker and Machine Learning."
    skills = processor.extract_skills(sample_text)
    print(f"Extracted: {skills}")
    
    job_skills = ["Python", "Docker", "AWS", "Kubernetes"]
    readiness = processor.calculate_readiness_score(skills, job_skills)
    print(f"Readiness: {readiness}")
