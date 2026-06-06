import os
import pickle
import pandas as pd
import faiss
import numpy as np
from datetime import datetime
from urllib.parse import quote_plus
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from .skill_processor import SkillProcessor

class ProfessionalRecommender:
    """Professional recommendation engine using SBERT and FAISS."""
    
    def __init__(self, model_name: str = "all-mpnet-base-v2"):
        self.device = 'cpu' # Default to CPU for stability in this environment
        self.model = SentenceTransformer(model_name, device=self.device)
        self.skill_processor = SkillProcessor(model=self.model)
        
        # Paths for existing artifacts
        self.artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
        
        # Load indices and metadata
        self.jobs_index = self._load_index("jobs.index")
        self.jobs_metadata = self._load_metadata("jobs.pkl")
        self.courses_index = self._load_index("courses.index")
        self.courses_metadata = self._load_metadata("courses.pkl")

    def _load_index(self, filename: str):
        path = os.path.join(self.artifacts_dir, filename)
        if os.path.exists(path):
            return faiss.read_index(path)
        return None

    def _load_metadata(self, filename: str):
        path = os.path.join(self.artifacts_dir, filename)
        if os.path.exists(path):
            return pd.read_pickle(path)
        return None

    def _validate_job_data(self, job: pd.Series) -> bool:
        """Validates if a job record has essential data."""
        job_title = str(job.get('job_title') or job.get('title') or '').strip()
        company = str(job.get('company_name') or job.get('company') or '').strip()
        blob_text = str(job.get('blob') or job.get('description') or job.get('job_description') or '').strip()
        has_title_or_company = len(job_title) > 2 or len(company) > 1
        return has_title_or_company or len(blob_text) > 10
    
    def _validate_course_data(self, course: pd.Series) -> bool:
        """Validates if a course record has essential data."""
        title = str(course.get('title') or course.get('course_name') or '').strip()
        return len(title) > 3
    
    def _get_course_level_score(self, level: str) -> int:
        """Returns numeric score for course level to enable sorting."""
        level_str = str(level or '').lower()
        if 'beginner' in level_str or 'foundation' in level_str or 'introductory' in level_str:
            return 1
        elif 'intermediate' in level_str or 'intermediate' in level_str:
            return 2
        elif 'advanced' in level_str or 'expert' in level_str or 'professional' in level_str:
            return 3
        else:
            return 2  # Default to intermediate

    def _normalize_link(self, link: Any) -> str:
        """Validates and normalizes a URL link."""
        if link is None:
            return ""
        link_str = str(link).strip()
        if not link_str or link_str.lower() == 'nan':
            return ""
        if not link_str.startswith('http'):
            link_str = 'https://' + link_str
        return link_str

    def _build_linkedin_url(self, title: str, company: str) -> str:
        query_text = f"{title or ''} {company or ''}".strip()
        query = quote_plus(query_text)
        if not query:
            return "https://www.linkedin.com/jobs/"
        return f"https://www.linkedin.com/jobs/search?keywords={query}"

    def _infer_job_title(self, job: pd.Series) -> Optional[str]:
        blob_text = str(job.get('blob') or job.get('description') or job.get('job_description') or '').strip()
        if blob_text:
            first_line = blob_text.splitlines()[0].strip()
            if 3 < len(first_line) <= 80:
                return first_line
        return None

    def _build_job_title(self, job: pd.Series) -> str:
        return str(job.get('job_title') or job.get('title') or self._infer_job_title(job) or 'Job Opportunity')

    def _build_job_company(self, job: pd.Series) -> str:
        return str(job.get('company_name') or job.get('company') or 'N/A')

    def _get_search_batch_size(self, top_n: int) -> int:
        if self.jobs_metadata is None:
            return max(30, top_n * 10)
        return min(len(self.jobs_metadata), max(30, top_n * 10))

    def _build_course_search_url(self, title: str, provider: str = "udemy") -> str:
        if not title:
            return "https://www.udemy.com/courses/search/" if provider == "udemy" else "https://www.coursera.org/courses"
        query = quote_plus(str(title))
        if provider == "coursera":
            return f"https://www.coursera.org/courses?query={query}"
        return f"https://www.udemy.com/courses/search/?q={query}"

    def _parse_date(self, date_value: Any) -> Optional[pd.Timestamp]:
        if date_value is None:
            return None
        try:
            parsed = pd.to_datetime(date_value, errors="coerce")
            return parsed if not pd.isna(parsed) else None
        except Exception:
            return None

    def _is_job_active(self, url: str) -> bool:
        """Checks if a job URL is active (not 404 and not an expired redirect)."""
        if not url:
            return False
        try:
            import requests
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            resp = requests.get(url, headers=headers, timeout=4, allow_redirects=True)
            # 404 or 410 indicates the job is definitely gone
            if resp.status_code in [404, 410]:
                return False
            # LinkedIn redirects expired jobs to a search page with this tracking parameter
            if 'expired_jd_redirect' in resp.url or 'linkedin.com/jobs/search' in resp.url:
                return False
            return True
        except Exception:
            # On connection error, timeout, etc., we assume false to be safe
            return False

    def recommend_jobs(self, user_profile: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """Recommends live jobs using Adzuna API based on user profile skills."""
        import os
        import requests
        import pandas as pd
        
        user_skills = self.skill_processor.extract_skills(user_profile)
        if not user_skills:
            return []
            
        app_id = os.getenv("ADZUNA_APP_ID")
        app_key = os.getenv("ADZUNA_APP_KEY")
        
        if app_id and app_key:
            data = {}
            search_query = "+".join([s.replace(' ', '+') for s in user_skills[:3]])
            url = f"https://api.adzuna.com/v1/api/jobs/us/search/1?app_id={app_id}&app_key={app_key}&results_per_page={top_n*4}&what={search_query}"
            try:
                resp = requests.get(url, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
            except Exception as e:
                print(f"Adzuna API Error: {e}")
                    
            results = []
            for job in data.get('results', []):
                job_title = job.get('title', '')
                company = job.get('company', {}).get('display_name', 'Unknown')
                location = job.get('location', {}).get('display_name', 'Remote')
                job_description = job.get('description', '')
                primary_url = job.get('redirect_url', '')
                posted_date_str = job.get('created', '')
                
                recent_days = None
                recency_boost = 0.0
                if posted_date_str:
                    try:
                        posted_date = pd.to_datetime(posted_date_str)
                        recent_days = max(0, int((pd.Timestamp.now(tz='UTC') - posted_date).days))
                        if recent_days <= 7: recency_boost = 0.3
                        elif recent_days <= 30: recency_boost = 0.15
                        else: recency_boost = 0.05
                    except:
                        pass
                
                job_skills = self.skill_processor.extract_skills(job_description)
                readiness = self.skill_processor.calculate_readiness_score(user_skills, job_skills)
                skill_score = readiness['score']
                hybrid_score = round((0.7 * skill_score) + (0.3 * recency_boost), 3)
                
                results.append({
                    'job_title': job_title,
                    'company': company,
                    'location': location,
                    'url': primary_url,
                    'linkedin_url': '',
                    'description': job_description[:200] if job_description else '',
                    'requirements': '',
                    'posted_date': str(posted_date.date()) if 'posted_date' in locals() and pd.notna(posted_date) else None,
                    'recent_days': recent_days,
                    'semantic_score': round(skill_score, 3),
                    'readiness_score': skill_score,
                    'hybrid_score': hybrid_score,
                    'matched_skills': readiness['matched'],
                    'missing_skills': readiness['missing']
                })
            
            results.sort(key=lambda x: (x['hybrid_score'], x['recent_days'] if x['recent_days'] is not None else 999), reverse=True)
            return results[:top_n]

        
        return []

    def recommend_courses(self, user_skills: List[str], target_job_skills: List[str], top_n: int = 5) -> List[Dict[str, Any]]:
        """Recommends courses ordered by progression level to bridge skill gaps intelligently."""
        if self.courses_index is None or self.courses_metadata is None:
            return []

        gap_analysis = self.skill_processor.calculate_readiness_score(user_skills, target_job_skills)
        missing_skills = gap_analysis['missing']
        if not missing_skills:
            missing_skills = [skill for skill in target_job_skills if skill not in user_skills]
        if not missing_skills:
            missing_skills = target_job_skills[:]

        query_text = ", ".join(missing_skills)
        query_vector = self.model.encode([query_text], convert_to_numpy=True)
        faiss.normalize_L2(query_vector)

        distances, indices = self.courses_index.search(query_vector, top_n * 2)
        results = []
        
        for i, idx in enumerate(indices[0]):
            if idx == -1:
                continue

            course = self.courses_metadata.iloc[idx]
            
            # Validate course data
            if not self._validate_course_data(course):
                continue
            
            course_title = course.get('title') or course.get('course_name') or 'Unknown Course'
            course_description = str(course.get('description') or course.get('headline') or '').strip()[:150]
            course_link = self._normalize_link(course.get('url') or course.get('course_url') or course.get('course_link'))
            if not course_link:
                course_link = self._build_course_search_url(course_title, provider='udemy')

            level = course.get('instructional_level') or course.get('level') or 'All Levels'
            level_score = self._get_course_level_score(level)
            rating = float(course.get('rating') or 0.0)
            
            # Score courses: prefer beginner→intermediate progression, then by rating
            relevance_score = float(distances[0][i])
            progression_score = 1.0 / level_score if level_score > 0 else 0.5  # Prefer beginner
            rating_score = min(rating / 5.0, 1.0)  # Normalize rating to 0-1
            
            combined_score = round((0.5 * relevance_score) + (0.3 * progression_score) + (0.2 * rating_score), 3)

            results.append({
                'title': course_title,
                'provider': course.get('instructor_names') or course.get('instructor') or 'Udemy',
                'rating': round(rating, 1),
                'duration': course.get('duration', 'Self-paced'),
                'level': level,
                'level_score': level_score,
                'description': course_description,
                'missing_skills': missing_skills,
                'score': combined_score,
                'url': course_link,
                'udemy_url': self._build_course_search_url(course_title, provider='udemy')
            })

        # Sort by progression level first (beginner first), then by relevance score
        results.sort(key=lambda x: (x['level_score'], -x['score']))
        
        # Remove duplicates by title
        seen_titles = set()
        unique_results = []
        for course in results:
            title_lower = course['title'].lower()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                unique_results.append(course)
        
        return unique_results[:top_n]

    def advanced_recommend_courses_grouped(self, missing_skills: List[str], constraints: Dict[str, Any], top_n: int = 10) -> List[Dict[str, Any]]:
        """Advanced grouped course recommendation using hybrid reranking and user constraints."""
        if self.courses_index is None or self.courses_metadata is None or not missing_skills:
            return []

        import faiss
        target_level = constraints.get("level", "").lower() if constraints.get("level") else None
        target_lang = constraints.get("language", "").lower() if constraints.get("language") else None
        target_hours = float(constraints.get("hoursPerWeek", 0)) if constraints.get("hoursPerWeek") else None

        grouped_results = []

        for skill in missing_skills:
            # L1-1: SkillQueryBuilder
            query_text = f"Learn {skill} comprehensive course"
            
            # L1-2: Embedding E1
            query_vector = self.model.encode([query_text], convert_to_numpy=True)
            faiss.normalize_L2(query_vector)

            # L1-3: Course Vector DB Search
            distances, indices = self.courses_index.search(query_vector, top_n * 3)
            
            skill_courses = []
            seen_titles = set()
            
            for i, idx in enumerate(indices[0]):
                if idx == -1:
                    continue

                course = self.courses_metadata.iloc[idx]
                if not self._validate_course_data(course):
                    continue

                course_title = course.get('title') or course.get('course_name') or 'Unknown Course'
                if course_title.lower() in seen_titles:
                    continue
                seen_titles.add(course_title.lower())

                lang_val = course.get('language') or 'english' 
                if target_lang and target_lang not in lang_val.lower():
                    if course.get('language'): 
                        continue
                        
                level = course.get('instructional_level') or course.get('level') or 'All Levels'
                level_score = self._get_course_level_score(level)
                
                # L1-4: Constraint Filter
                if target_level:
                    if target_level == "beginner" and level_score > 1:
                        continue
                    if target_level == "advanced" and level_score < 3:
                        continue
                
                # Duration constraint
                duration_val = course.get('duration')
                course_duration_hours = 0
                if duration_val:
                    try:
                        import re
                        match = re.search(r'(\d+(\.\d+)?)', str(duration_val))
                        if match:
                            course_duration_hours = float(match.group(1))
                    except:
                        course_duration_hours = 10
                else:
                    course_duration_hours = 10

                if target_hours and course_duration_hours > target_hours:
                    if duration_val: 
                        continue

                # L1-5: Hybrid Rerank Engine
                rating = float(course.get('rating') or 0.0)
                subscribers = float(course.get('num_subscribers') or 0.0)
                
                semantic_score = float(1.0 / (1.0 + distances[0][i])) # Convert L2 to similarity
                rating_score = min(rating / 5.0, 1.0)
                popularity_score = min(subscribers / 10000.0, 1.0)
                
                level_match_score = 1.0
                if target_level:
                    if target_level == "beginner" and level_score == 1: level_match_score = 1.0
                    elif target_level == "advanced" and level_score == 3: level_match_score = 1.0
                    elif target_level == "intermediate" and level_score == 2: level_match_score = 1.0
                    elif level == "All Levels": level_match_score = 0.8
                    else: level_match_score = 0.4
                
                duration_fit_score = 1.0
                if target_hours and course_duration_hours > 0:
                    duration_fit_score = min(target_hours / course_duration_hours, 1.0)

                final_score = round((0.4 * semantic_score) + (0.2 * rating_score) + (0.1 * popularity_score) + (0.2 * level_match_score) + (0.1 * duration_fit_score), 3)

                course_link = self._normalize_link(course.get('url') or course.get('course_url') or course.get('course_link'))
                if not course_link:
                    course_link = self._build_course_search_url(course_title, provider='udemy')

                course_description = str(course.get('description') or course.get('headline') or '').strip()[:150]

                skill_courses.append({
                    "courseId": str(course.get('id', idx)),
                    "title": course_title,
                    "description": course_description,
                    "score": final_score,
                    "duration": f"{course_duration_hours} hours" if duration_val else "Self-paced",
                    "provider": course.get('instructor_names') or course.get('instructor') or 'Udemy',
                    "level": level,
                    "url": course_link,
                    "semanticScore": round(semantic_score, 3),
                    "rating": rating
                })

            # Sort by final hybrid score
            skill_courses.sort(key=lambda x: x["score"], reverse=True)

            grouped_results.append({
                "skillId": f"S_{skill.lower().replace(' ', '_')}",
                "skillName": skill,
                "courses": skill_courses[:top_n]
            })

        return grouped_results
if __name__ == "__main__":
    # Quick test if artifacts exist
    recommender = ProfessionalRecommender()
    if recommender.jobs_index:
        sample_profile = "Experienced Python developer with a focus on Data Science and Machine Learning."
        jobs = recommender.recommend_jobs(sample_profile)
        print(f"Top Job Recommendations for '{sample_profile}':")
        for j in jobs:
            print(f"- {j['job_title']} at {j['company']} (Score: {j['hybrid_score']}, Readiness: {j['readiness_score']})")
    else:
        print("Artifacts not found. Please run builder.py first.")
