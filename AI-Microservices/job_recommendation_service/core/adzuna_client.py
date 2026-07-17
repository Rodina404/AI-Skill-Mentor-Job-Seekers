import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import pandas as pd
import requests

from core.semantic_ranker import SemanticRanker
from core.skill_ner import HuggingFaceSkillExtractor

logger = logging.getLogger(__name__)

SKILL_ALIASES = {
    "aws": ["aws", "amazon web services"],
    "ci/cd": ["ci/cd", "ci cd", "continuous integration", "continuous delivery", "continuous deployment"],
    "css3": ["css3", "css"],
    "data visualization": ["data visualization", "data visualisation", "tableau", "power bi", "looker"],
    "django": ["django"],
    "docker": ["docker", "containerization", "containers"],
    "excel": ["excel", "microsoft excel", "spreadsheets"],
    "express.js": ["express.js", "express", "node express"],
    "flask": ["flask"],
    "git": ["git", "github", "gitlab", "version control"],
    "google cloud": ["google cloud", "gcp"],
    "html5": ["html5", "html"],
    "javascript": ["javascript", "java script", "js"],
    "kubernetes": ["kubernetes", "k8s"],
    "large language models": ["large language models", "large language model", "llm", "llms", "gpt", "generative ai", "gen ai"],
    "linux": ["linux", "unix"],
    "machine learning": ["machine learning", "ml"],
    "mongodb": ["mongodb", "mongo"],
    "mysql": ["mysql"],
    "natural language processing": ["natural language processing", "nlp"],
    "next.js": ["next.js", "nextjs", "next js"],
    "node.js": ["node.js", "nodejs", "node js", "node"],
    "nosql": ["nosql", "no sql"],
    "pandas": ["pandas"],
    "postgresql": ["postgresql", "postgres", "postgre sql"],
    "power bi": ["power bi", "powerbi"],
    "prompt engineering": ["prompt engineering", "prompt design"],
    "python": ["python"],
    "pytorch": ["pytorch", "py torch"],
    "redis": ["redis"],
    "rest api": ["rest api", "restful api", "rest", "api development"],
    "retrieval augmented generation": ["retrieval augmented generation", "rag"],
    "react": ["react", "react.js", "reactjs"],
    "scikit-learn": ["scikit-learn", "scikit learn", "sklearn"],
    "spring boot": ["spring boot", "spring"],
    "sql": ["sql", "structured query language"],
    "statistics": ["statistics", "statistical analysis"],
    "tableau": ["tableau"],
    "tensorflow": ["tensorflow", "tensor flow"],
    "terraform": ["terraform", "infrastructure as code", "iac"],
    "typescript": ["typescript", "type script", "ts"],
    "vue.js": ["vue.js", "vue", "vuejs"],
}

SKILL_RELATED_TERMS = {
    "aws": ["cloud native", "cloud infrastructure", "ec2", "s3", "lambda", "amazon cloud"],
    "ci/cd": ["pipeline", "build automation", "deployment automation", "release automation"],
    "css3": ["responsive design", "styling", "layout", "web design"],
    "data visualization": ["dashboard", "reporting", "charts", "visual analytics", "analytics dashboard"],
    "django": ["python web framework", "web application", "backend web"],
    "docker": ["container", "containerization", "containerized", "image registry"],
    "excel": ["spreadsheet", "pivot table", "financial modeling"],
    "express.js": ["api server", "node backend", "rest service"],
    "flask": ["python web framework", "api service"],
    "git": ["source control", "version control", "code repository"],
    "google cloud": ["cloud platform", "cloud infrastructure"],
    "html5": ["web markup", "semantic markup", "web page"],
    "javascript": ["frontend logic", "browser scripting", "web application"],
    "kubernetes": ["container orchestration", "cluster", "helm", "orchestration"],
    "large language models": ["generative ai", "prompting", "chatbot", "foundation model"],
    "linux": ["unix", "shell scripting", "system administration"],
    "machine learning": ["predictive model", "predictive modeling", "model training", "artificial intelligence", "ai model", "data science"],
    "mongodb": ["document database", "nosql database"],
    "mysql": ["relational database", "rdbms"],
    "natural language processing": ["text analytics", "language model", "text classification"],
    "next.js": ["react framework", "server side rendering", "frontend framework"],
    "node.js": ["server side javascript", "express", "npm"],
    "nosql": ["document database", "key value store", "non relational database"],
    "pandas": ["dataframe", "data wrangling", "data manipulation", "python data"],
    "postgresql": ["relational database", "database design", "rdbms"],
    "power bi": ["business intelligence", "bi dashboard", "reporting dashboard"],
    "prompt engineering": ["llm prompting", "prompt design", "generative ai"],
    "python": ["python developer", "python programming", "scripting", "automation"],
    "pytorch": ["deep learning", "neural network", "torch"],
    "redis": ["cache", "in memory database"],
    "rest api": ["api design", "api development", "web service", "microservices"],
    "retrieval augmented generation": ["vector search", "knowledge retrieval", "llm retrieval"],
    "react": ["component based ui", "ui component", "single page application", "spa"],
    "scikit-learn": ["model training", "classification model", "regression model", "machine learning pipeline"],
    "spring boot": ["java backend", "microservices", "api service"],
    "sql": ["database query", "queries", "data warehouse", "relational data"],
    "statistics": ["statistical model", "hypothesis testing", "quantitative analysis"],
    "tableau": ["dashboard", "business intelligence", "visual analytics"],
    "tensorflow": ["deep learning", "neural network", "keras"],
    "terraform": ["infrastructure as code", "iac", "cloud provisioning"],
    "typescript": ["typed javascript", "frontend architecture"],
    "vue.js": ["frontend framework", "single page application", "ui component"],
}

ROLE_ALIASES = {
    "frontend developer": ["Frontend Developer", "Front End Developer", "React Developer", "UI Developer"],
    "machine learning engineer": ["Machine Learning Engineer", "AI Engineer", "ML Engineer", "Applied Machine Learning Engineer"],
    "software engineer": ["Software Engineer", "Software Developer", "Backend Engineer"],
    "backend engineer": ["Backend Engineer", "Backend Developer", "API Engineer", "Server-side Engineer"],
    "data scientist": ["Data Scientist", "Machine Learning Scientist", "Applied Data Scientist", "ML Scientist"],
    "data analyst": ["Data Analyst", "Business Intelligence Analyst", "BI Analyst"],
    "devops engineer": ["DevOps Engineer", "Cloud Engineer", "Platform Engineer", "Site Reliability Engineer"],
    "full stack developer": ["Full Stack Developer", "FullStack Developer", "Full-stack Developer", "Software Engineer"],
}

ROLE_EXPECTED_SKILLS = {
    "frontend developer": ["JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Node.js"],
    "react developer": ["JavaScript", "TypeScript", "React", "HTML5", "CSS3"],
    "ui developer": ["JavaScript", "React", "HTML5", "CSS3"],
    "machine learning engineer": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Docker"],
    "ai engineer": ["Python", "Machine Learning", "TensorFlow", "PyTorch"],
    "ml engineer": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Scikit-Learn"],
    "software engineer": ["Python", "JavaScript", "SQL", "Git", "Docker", "AWS"],
    "software developer": ["Python", "JavaScript", "SQL", "Git"],
    "backend engineer": ["Python", "Java", "Node.js", "SQL", "REST API", "Docker", "AWS"],
    "backend developer": ["Python", "Java", "Node.js", "SQL", "REST API"],
    "api engineer": ["REST API", "Python", "Node.js", "SQL", "Docker"],
    "server-side engineer": ["Python", "Java", "Node.js", "SQL", "REST API"],
    "data scientist": ["Python", "SQL", "Machine Learning", "Statistics", "Pandas", "Scikit-Learn", "PyTorch"],
    "machine learning scientist": ["Python", "Machine Learning", "Statistics", "PyTorch", "TensorFlow"],
    "applied data scientist": ["Python", "SQL", "Machine Learning", "Statistics", "Pandas"],
    "data analyst": ["SQL", "Excel", "Python", "Pandas", "Data Visualization", "Power BI"],
    "business intelligence analyst": ["SQL", "Excel", "Data Visualization", "Power BI"],
    "bi analyst": ["SQL", "Excel", "Data Visualization", "Power BI"],
    "devops engineer": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
    "cloud engineer": ["AWS", "Docker", "Kubernetes", "Terraform", "Linux"],
    "platform engineer": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
    "site reliability engineer": ["Linux", "Kubernetes", "CI/CD", "AWS", "Docker"],
    "full stack developer": ["JavaScript", "React", "Node.js", "SQL", "REST API", "Git"],
    "fullstack developer": ["JavaScript", "React", "Node.js", "SQL", "REST API", "Git"],
    "full-stack developer": ["JavaScript", "React", "Node.js", "SQL", "REST API", "Git"],
}


class AdzunaJobProvider:
    """Fetch and rank live job recommendations from Adzuna."""

    def __init__(self) -> None:
        self.semantic_ranker = SemanticRanker()
        self.skill_extractor = HuggingFaceSkillExtractor()
        self.last_error: Optional[str] = None
        self._load_config()

    def _load_config(self) -> None:
        self.app_id = os.getenv("ADZUNA_APP_ID")
        self.app_key = os.getenv("ADZUNA_APP_KEY")
        self.country = os.getenv("ADZUNA_COUNTRY", "us").lower()
        self.timeout_seconds = float(os.getenv("ADZUNA_TIMEOUT_SECONDS", "8"))
        self.semantic_weight = self._read_float_env("SEMANTIC_WEIGHT", 0.4)
        self.min_quality_score = self._read_float_env("MIN_JOB_QUALITY_SCORE", 0.28)

    @property
    def is_configured(self) -> bool:
        return bool(self.app_id and self.app_key)

    def recommend_jobs(
        self,
        user_skills: List[str],
        desired_role: str = "",
        location: str = "",
        top_n: int = 10,
        readiness_score: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        self._load_config()
        self.last_error = None

        if not self.is_configured:
            self.last_error = "Adzuna is not configured; ADZUNA_APP_ID and ADZUNA_APP_KEY are required"
            return []

        queries = self._build_queries(user_skills, desired_role)
        if not queries:
            self.last_error = "Adzuna search needs a target role or at least one matched skill"
            return []

        recommendations: List[Dict[str, Any]] = []
        user_text = self.semantic_ranker.build_user_text(user_skills, desired_role)
        for query in queries:
            payload = self._search(query, location)
            query_recommendations = [
                self._build_recommendation(job, user_skills, desired_role, user_text, readiness_score)
                for job in payload.get("results", [])
            ]
            query_recommendations = [job for job in query_recommendations if job is not None]
            recommendations = self._dedupe(recommendations + query_recommendations)
            if len(recommendations) >= top_n * 3:
                break

        if not recommendations and self.last_error is None:
            self.last_error = "Adzuna returned no jobs for the supplied role, skills, and location"

        recommendations = self._dedupe(recommendations)
        recommendations.sort(
            key=lambda job: (
                job.get("finalScore", 0),
                -(job.get("recent_days") or 9999),
            ),
            reverse=True,
        )
        return recommendations[:top_n]

    def _build_queries(self, user_skills: List[str], desired_role: str) -> List[str]:
        role = desired_role.strip()
        role_options = ROLE_ALIASES.get(role.lower(), [role]) if role else []
        skill_text = " ".join(skill.strip() for skill in user_skills[:4] if skill and skill.strip())
        alternate_skill_text = " ".join(skill.strip() for skill in user_skills[4:8] if skill and skill.strip())
        queries = []
        for role_option in role_options[:2]:
            if role_option and skill_text:
                queries.append(f"{role_option} {skill_text}")
        for role_option in role_options[:2]:
            if role_option and alternate_skill_text:
                queries.append(f"{role_option} {alternate_skill_text}")
        queries.extend(role_options)
        if skill_text:
            queries.append(skill_text)
        return list(dict.fromkeys(query for query in queries if query.strip()))

    def _search(self, query: str, location: str) -> Dict[str, Any]:
        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "results_per_page": 50,
            "what": query,
            "content-type": "application/json",
        }
        normalized_location = location.strip()
        if normalized_location.lower() not in {"", "remote", "any", "all"}:
            params["where"] = normalized_location

        url = f"https://api.adzuna.com/v1/api/jobs/{self.country}/search/1"

        try:
            response = requests.get(url, params=params, timeout=self.timeout_seconds)
            response.raise_for_status()
            return response.json()
        except requests.Timeout:
            self.last_error = "Adzuna request timed out"
            logger.warning("Adzuna request timed out for query '%s'", query)
            return {}
        except requests.HTTPError as exc:
            status = exc.response.status_code if exc.response is not None else "unknown"
            self.last_error = f"Adzuna returned HTTP {status}"
            logger.warning("Adzuna returned HTTP %s for query '%s'", status, query)
            return {}
        except ValueError:
            self.last_error = "Adzuna returned an invalid JSON response"
            logger.warning("Adzuna returned invalid JSON for query '%s'", query)
            return {}
        except requests.RequestException as exc:
            self.last_error = "Adzuna could not be reached"
            logger.warning("Adzuna connection failed for query '%s' (%s)", query, type(exc).__name__)
            return {}

    def _build_recommendation(
        self,
        job: Dict[str, Any],
        user_skills: List[str],
        desired_role: str,
        user_text: str,
        profile_readiness_score: Optional[float] = None,
    ) -> Optional[Dict[str, Any]]:
        title = str(job.get("title") or "").strip()
        company = str((job.get("company") or {}).get("display_name") or "Unknown")
        location = str((job.get("location") or {}).get("display_name") or "Remote")
        description = str(job.get("description") or "")
        redirect_url = str(job.get("redirect_url") or "")
        created = job.get("created")

        if not title and not description:
            return None

        job_text = f"{title} {description}"
        matched_skills, inferred_skills, missing_skills, skill_evidence_score = self._score_skills(
            user_skills,
            job_text,
        )
        extracted_job_skills = self.skill_extractor.extract(description)
        matched_extracted_skills, unmatched_extracted_skills = self._compare_extracted_skills(extracted_job_skills, user_skills)
        role_expected_skills = self._expected_skills_for_role(desired_role, title)
        role_matched_skills, role_inferred_skills, _, role_skill_score = self._score_skills(
            role_expected_skills,
            job_text,
        )

        title_score = self._score_title(title, desired_role)
        recent_days = self._days_since_posted(created)
        recency_boost = self._recency_boost(recent_days)
        authoritative_readiness = self._normalize_readiness(profile_readiness_score)
        final_score = round((0.70 * authoritative_readiness) + (0.30 * recency_boost), 3)
        semantic_score = self.semantic_ranker.score(
            user_text,
            f"{title}. Company: {company}. Location: {location}. Description: {description}",
        )
        hybrid_score = self._hybrid_score(
            readiness_score=skill_evidence_score,
            role_skill_score=role_skill_score,
            title_score=title_score,
            recency_boost=recency_boost,
            semantic_score=semantic_score,
            has_skill_evidence=bool(matched_skills or inferred_skills or role_matched_skills or role_inferred_skills),
        )
        quality_score = self._quality_score(
            readiness_score=skill_evidence_score,
            role_skill_score=role_skill_score,
            title_score=title_score,
            semantic_score=semantic_score,
        )

        return {
            "id": str(job.get("id") or redirect_url or f"{title}:{company}"),
            "external_id": str(job.get("id") or ""),
            "title": title,
            "company": company,
            "location": location,
            "description": description[:500],
            "requirements": "",
            "url": redirect_url,
            "source": "adzuna",
            "posted_date": created,
            "recent_days": recent_days,
            "similarity_score": final_score,
            "semantic_score": semantic_score,
            "readiness_score": authoritative_readiness,
            "role_skill_score": role_skill_score,
            "title_score": title_score,
            "quality_score": quality_score,
            "hybrid_score": final_score,
            "readinessScore": authoritative_readiness,
            "recencyScore": recency_boost,
            "finalScore": final_score,
            "skillEvidenceScore": skill_evidence_score,
            "extractedJobSkills": extracted_job_skills,
            "matchedExtractedSkills": matched_extracted_skills,
            "unmatchedExtractedSkills": unmatched_extracted_skills,
            "nerModel": self.skill_extractor.model_name,
            "nerError": self.skill_extractor.load_error,
            "matched_skills": matched_skills,
            "inferred_skills": inferred_skills,
            "role_expected_skills": role_expected_skills,
            "role_matched_skills": role_matched_skills,
            "role_inferred_skills": role_inferred_skills,
            "missing_skills": missing_skills,
            "ranking_reason": self._ranking_reason(
                matched_skills=matched_skills,
                inferred_skills=inferred_skills,
                role_matched_skills=role_matched_skills,
                role_inferred_skills=role_inferred_skills,
                semantic_score=semantic_score,
                title_score=title_score,
            ),
            "relevance_explanation": self._explain(matched_skills, inferred_skills, missing_skills),
        }

    def _normalize_readiness(self, readiness_score: Optional[float]) -> float:
        if readiness_score is None:
            return 0.0
        try:
            score = float(readiness_score)
        except (TypeError, ValueError):
            return 0.0
        if score > 1.0:
            score /= 100.0
        return round(max(0.0, min(score, 1.0)), 3)

    def _compare_extracted_skills(self, extracted_skills: List[str], user_skills: List[str]) -> tuple[List[str], List[str]]:
        normalized_user_skills = [self._normalize_text(skill) for skill in user_skills if skill]
        matched, unmatched = [], []
        for extracted_skill in extracted_skills:
            normalized = self._normalize_text(extracted_skill)
            is_match = any(normalized == skill or normalized in skill or skill in normalized for skill in normalized_user_skills if normalized and skill)
            (matched if is_match else unmatched).append(extracted_skill)
        return matched, unmatched

    def _score_skills(self, user_skills: List[str], job_text: str) -> tuple[List[str], List[str], List[str], float]:
        cleaned_skills = [skill.strip() for skill in user_skills if skill and skill.strip()]
        if not cleaned_skills:
            return [], [], [], 0.0

        normalized_job_text = self._normalize_text(job_text)
        matched = []
        inferred = []

        for skill in cleaned_skills:
            match_type = self._skill_match_type(skill, normalized_job_text)
            if match_type == "exact":
                matched.append(skill)
            elif match_type == "inferred":
                inferred.append(skill)

        covered = set(matched + inferred)
        missing = [skill for skill in cleaned_skills if skill not in covered]
        score = round((len(matched) + (0.6 * len(inferred))) / len(cleaned_skills), 2)
        return matched, inferred, missing, score

    def _skill_match_type(self, skill: str, normalized_job_text: str) -> str:
        aliases = SKILL_ALIASES.get(skill.strip().lower(), [skill])
        for alias in aliases:
            normalized_alias = self._normalize_text(alias)
            if not normalized_alias:
                continue
            pattern = rf"(^|\s){re.escape(normalized_alias)}(\s|$)"
            if re.search(pattern, normalized_job_text):
                return "exact"

        related_terms = SKILL_RELATED_TERMS.get(skill.strip().lower(), [])
        for term in related_terms:
            normalized_term = self._normalize_text(term)
            if not normalized_term:
                continue
            pattern = rf"(^|\s){re.escape(normalized_term)}(\s|$)"
            if re.search(pattern, normalized_job_text):
                return "inferred"

        return ""

    def _normalize_text(self, text: str) -> str:
        normalized = text.lower()
        normalized = re.sub(r"\bfront[\s-]?end\b", "frontend", normalized)
        normalized = re.sub(r"\bback[\s-]?end\b", "backend", normalized)
        normalized = re.sub(r"\bfull[\s-]?stack\b", "fullstack", normalized)
        normalized = re.sub(r"[^a-z0-9+#./-]+", " ", normalized)
        normalized = normalized.replace(".", " ")
        normalized = re.sub(r"\s+", " ", normalized)
        return normalized.strip()

    def _score_title(self, title: str, desired_role: str) -> float:
        if not desired_role:
            return 0.0

        normalized_title = self._normalize_text(title)
        normalized_role = self._normalize_text(desired_role)
        if not normalized_title or not normalized_role:
            return 0.0

        if normalized_role in normalized_title:
            return 1.0

        role_words = {word for word in normalized_role.split() if len(word) > 2}
        title_words = set(normalized_title.split())
        if not role_words:
            return 0.0

        return round(len(role_words & title_words) / len(role_words), 2)

    def _expected_skills_for_role(self, desired_role: str, title: str) -> List[str]:
        candidates = [desired_role, title]
        expected: List[str] = []

        for candidate in candidates:
            normalized_candidate = self._normalize_text(candidate)
            for role_name, skills in ROLE_EXPECTED_SKILLS.items():
                normalized_role = self._normalize_text(role_name)
                if normalized_role and normalized_role in normalized_candidate:
                    expected.extend(skills)

        unique_expected = []
        seen = set()
        for skill in expected:
            key = skill.lower()
            if key in seen:
                continue
            seen.add(key)
            unique_expected.append(skill)
        return unique_expected

    def _hybrid_score(
        self,
        readiness_score: float,
        role_skill_score: float,
        title_score: float,
        recency_boost: float,
        semantic_score: Optional[float],
        has_skill_evidence: bool,
    ) -> float:
        if semantic_score is None:
            return round(
                (0.45 * readiness_score)
                + (0.2 * role_skill_score)
                + (0.25 * title_score)
                + (0.1 * recency_boost),
                3,
            )

        semantic_weight = max(0.0, min(self.semantic_weight, 0.8))
        if not has_skill_evidence:
            semantic_weight = min(semantic_weight, 0.15)

        remaining_weight = 1.0 - semantic_weight
        score = (
            (semantic_weight * semantic_score)
            + (remaining_weight * 0.4 * readiness_score)
            + (remaining_weight * 0.2 * role_skill_score)
            + (remaining_weight * 0.3 * title_score)
            + (remaining_weight * 0.1 * recency_boost)
        )

        if not has_skill_evidence and title_score < 0.75:
            score = min(score, 0.24)

        return round(score, 3)

    def _quality_score(
        self,
        readiness_score: float,
        role_skill_score: float,
        title_score: float,
        semantic_score: Optional[float],
    ) -> float:
        semantic = semantic_score if semantic_score is not None else 0.0
        return round(
            (0.35 * readiness_score)
            + (0.25 * role_skill_score)
            + (0.25 * title_score)
            + (0.15 * semantic),
            3,
        )

    def _read_float_env(self, name: str, default: float) -> float:
        try:
            return float(os.getenv(name, str(default)))
        except ValueError:
            return default

    def _days_since_posted(self, created: Any) -> Optional[int]:
        if not created:
            return None
        try:
            posted = pd.to_datetime(created, utc=True)
            return max(0, int((datetime.now(timezone.utc) - posted.to_pydatetime()).days))
        except Exception:
            return None

    def _recency_boost(self, recent_days: Optional[int]) -> float:
        if recent_days is None:
            return 0.0
        if recent_days <= 7:
            return 1.0
        if recent_days <= 30:
            return 0.6
        if recent_days <= 90:
            return 0.3
        return 0.1

    def _explain(self, matched_skills: List[str], inferred_skills: List[str], missing_skills: List[str]) -> str:
        if matched_skills:
            return f"Matches your skills in: {', '.join(matched_skills[:3])}"
        if inferred_skills:
            return f"Likely related to your skills in: {', '.join(inferred_skills[:3])}"
        if missing_skills:
            return "Related to your target role, but the listed skills need review"
        return "Related to your target role"

    def _ranking_reason(
        self,
        matched_skills: List[str],
        inferred_skills: List[str],
        role_matched_skills: List[str],
        role_inferred_skills: List[str],
        semantic_score: Optional[float],
        title_score: float,
    ) -> str:
        reasons = []
        if matched_skills:
            reasons.append(f"matches user skills: {', '.join(matched_skills[:3])}")
        if inferred_skills:
            reasons.append(f"infers user skills: {', '.join(inferred_skills[:3])}")
        if role_matched_skills:
            reasons.append(f"matches expected role skills: {', '.join(role_matched_skills[:3])}")
        if role_inferred_skills:
            reasons.append(f"infers expected role skills: {', '.join(role_inferred_skills[:3])}")
        if title_score >= 0.75:
            reasons.append("strong title match")
        if semantic_score is not None and semantic_score >= 0.35:
            reasons.append("strong semantic match")
        if not reasons:
            return "Weak match kept only because stronger alternatives were limited"
        return "; ".join(reasons)

    def _dedupe(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen = set()
        unique = []
        for job in recommendations:
            key = (
                str(job.get("title", "")).lower(),
                str(job.get("company", "")).lower(),
                str(job.get("location", "")).lower(),
            )
            url = str(job.get("url") or "")
            if url:
                key = (url.split("?")[0].lower(),)
            if key in seen:
                continue
            seen.add(key)
            unique.append(job)
        return unique

    def _filter_quality_jobs(
        self,
        recommendations: List[Dict[str, Any]],
        top_n: int,
    ) -> List[Dict[str, Any]]:
        quality_jobs = [
            job for job in recommendations
            if job.get("quality_score", 0) >= self.min_quality_score
        ]
        if len(quality_jobs) >= top_n:
            return quality_jobs

        skill_evidence_jobs = [
            job for job in recommendations
            if job.get("readiness_score", 0) > 0 or job.get("role_skill_score", 0) > 0
        ]
        if len(skill_evidence_jobs) >= top_n:
            return skill_evidence_jobs

        return recommendations
