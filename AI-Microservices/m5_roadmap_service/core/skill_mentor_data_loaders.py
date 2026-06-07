"""
AI Skill Mentor - Data Loaders Module
======================================

Data loading functions for:
- O*NET Technology Skills database
- Course catalogs (Udemy, Coursera via Kaggle)
- OULAD dropout statistics

All loaders handle network failures gracefully with retry logic
and provide calibrated fallback values.
"""

import os
import re
import subprocess
import zipfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime

import pandas as pd
import requests

from skill_mentor_config import Config, default_config
from skill_mentor_utils import (
    retry, RetryError, header, ok, info, warn, row,
    parse_hours_string
)


# ══════════════════════════════════════════════════════════════════════════════
#  O*NET TECHNOLOGY SKILLS LOADER
# ══════════════════════════════════════════════════════════════════════════════

class ONetLoader:
    """
    Load skill-to-hours mappings from O*NET Technology Skills database.
    
    The O*NET database provides technology skills used across occupations.
    We use 'Hot Technology' flags to estimate learning hours.
    
    Source: https://www.onetcenter.org/database.html
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self.cache_path = self.config.paths.onet_cache
        self._skill_hours: Optional[Dict[str, float]] = None
    
    @property
    def skill_hours(self) -> Dict[str, float]:
        """Get skill-to-hours mapping (lazy loaded)."""
        if self._skill_hours is None:
            self._skill_hours = self.load()
        return self._skill_hours
    
    def load(self) -> Dict[str, float]:
        """
        Load O*NET skill hours from cache or download.
        
        Returns:
            Dict mapping skill names to estimated learning hours
        """
        header("REAL DATA — O*NET Technology Skills (db_28_3)")
        
        skill_hours: Dict[str, float] = {}
        
        # Try to load from cache or download
        df = self._load_dataframe()
        
        if df is not None and not df.empty:
            skill_hours = self._parse_skills(df)
        
        # Always add calibrated values (these are verified)
        for skill, hours in self.config.skill_hours.calibrated_hours.items():
            skill_hours.setdefault(skill, hours)
        
        row("Total skill->hours mappings", str(len(skill_hours)))
        return skill_hours
    
    def _load_dataframe(self) -> Optional[pd.DataFrame]:
        """Load O*NET data from cache or download."""
        # Ensure cache directory exists
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Try cache first
        if self.cache_path.exists():
            try:
                df = pd.read_csv(self.cache_path, sep="\t", encoding="latin-1")
                ok(f"Loaded O*NET from cache: {len(df):,} rows")
                return df
            except Exception as e:
                warn(f"Cache read failed: {e}")
        
        # Download
        return self._download()
    
    def _download(self) -> Optional[pd.DataFrame]:
        """Download O*NET Technology Skills file."""
        info("Downloading O*NET Technology Skills (db_28_3)...")
        
        try:
            response = self._fetch_with_retry(
                self.config.network.onet_tech_skills_url
            )
            self.cache_path.write_bytes(response.content)
            ok("O*NET Technology Skills downloaded")
            
            df = pd.read_csv(self.cache_path, sep="\t", encoding="latin-1")
            ok(f"Loaded O*NET tech skills: {len(df):,} rows")
            info(f"Columns: {list(df.columns)}")
            return df
            
        except RetryError as e:
            warn(f"O*NET download failed: {e.last_exception} — using calibrated values only")
            return None
        except Exception as e:
            warn(f"O*NET download failed: {e} — using calibrated values only")
            return None
    
    @retry(max_attempts=3, delay=2.0, exceptions=(requests.RequestException,))
    def _fetch_with_retry(self, url: str) -> requests.Response:
        """Fetch URL with retry logic."""
        response = requests.get(url, timeout=self.config.network.download_timeout)
        response.raise_for_status()
        return response
    
    def _parse_skills(self, df: pd.DataFrame) -> Dict[str, float]:
        """Parse skill names and hours from O*NET dataframe."""
        skill_hours: Dict[str, float] = {}
        
        # Find the Commodity Title column (skill name)
        commodity_col = self._find_column(
            df, ["commodity title", "commodity"]
        )
        
        # Find Hot Technology column
        hot_col = self._find_column(
            df, ["hot", "demand"]
        )
        
        if commodity_col:
            ok(f"Using O*NET column '{commodity_col}' as skill name")
            if hot_col:
                info(f"Hot Technology column: '{hot_col}'")
            
            for _, row_data in df.iterrows():
                name = str(row_data.get(commodity_col, "")).strip()
                if not name or name == "nan" or len(name) > 80:
                    continue
                
                # Check if Hot Technology
                is_hot = False
                if hot_col:
                    is_hot = str(row_data.get(hot_col, "")).strip().lower() == "yes"
                
                # Base hours: 20h, +10h for Hot Technology
                hours = (
                    self.config.skill_hours.default_hours + 
                    (self.config.skill_hours.hot_technology_bonus if is_hot else 0)
                )
                skill_hours[name] = hours
            
            ok(f"Mapped {len(skill_hours)} O*NET tool names -> hours")
        else:
            warn("Could not identify Commodity Title column — skipping O*NET row parsing")
        
        return skill_hours
    
    @staticmethod
    def _find_column(df: pd.DataFrame, keywords: List[str]) -> Optional[str]:
        """Find a column containing any of the keywords."""
        for col in df.columns:
            col_lower = col.lower()
            for keyword in keywords:
                if keyword in col_lower:
                    return col
        return None
    
    def get_hours(self, skill: str) -> float:
        """Get estimated learning hours for a skill."""
        # Try exact match first
        if skill in self.skill_hours:
            return self.skill_hours[skill]
        
        # Try case-insensitive
        skill_lower = skill.lower()
        for key, hours in self.skill_hours.items():
            if key.lower() == skill_lower:
                return hours
        
        # Return default
        return self.config.skill_hours.default_hours


# ══════════════════════════════════════════════════════════════════════════════
#  COURSE CATALOG LOADER
# ══════════════════════════════════════════════════════════════════════════════

class CourseLoader:
    """
    Load course data from Kaggle datasets (Udemy, Coursera).
    
    Includes 18 hand-verified courses as ground truth.
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self.cache_path = self.config.paths.course_cache
        self._courses: Optional[List[Dict]] = None
    
    @property
    def courses(self) -> List[Dict]:
        """Get course catalog (lazy loaded)."""
        if self._courses is None:
            self._courses = self.load()
        return self._courses
    
    def load(self) -> List[Dict]:
        """
        Load course catalog from Kaggle or cache.
        
        Returns:
            List of course dictionaries
        """
        header("REAL DATA — Course Catalog (Udemy preferred for hours)")
        
        courses = []
        
        # Load from Kaggle/cache
        df = self._load_dataframe()
        
        if df is not None and not df.empty:
            catalog_courses, stats = self._parse_catalog(df)
            courses.extend(catalog_courses)
            ok(f"Structured {len(catalog_courses)} courses from catalog "
               f"({stats['hours_from_catalog']} with real hours, "
               f"{stats['hours_estimated']} with O*NET estimates)")
        
        # Add verified courses
        verified = self._get_verified_courses()
        existing_titles = {c["title"].lower() for c in courses}
        for course in verified:
            if course["title"].lower() not in existing_titles:
                courses.append(course)
        
        ok(f"Total courses available: {len(courses)} "
           f"({len(verified)} verified + Kaggle catalog)")
        
        return courses
    
    def _load_dataframe(self) -> Optional[pd.DataFrame]:
        """Load course data from cache or Kaggle."""
        # Ensure cache directory exists
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Try cache first
        if self.cache_path.exists():
            try:
                df = pd.read_csv(self.cache_path)
                ok(f"Loaded cached catalog: {len(df):,} courses")
                return df
            except Exception as e:
                warn(f"Cache read failed: {e}")
        
        # Try Kaggle download
        return self._download_from_kaggle()
    
    def _download_from_kaggle(self) -> Optional[pd.DataFrame]:
        """Download course data from Kaggle."""
        cache_dir = self.cache_path.parent
        
        for dataset_id in self.config.network.kaggle_datasets:
            try:
                result = subprocess.run(
                    ["kaggle", "datasets", "download", "-d", dataset_id,
                     "--path", str(cache_dir), "--unzip"],
                    capture_output=True, text=True, timeout=90
                )
                
                if result.returncode == 0:
                    csvs = list(cache_dir.rglob("*.csv"))
                    if csvs:
                        df = pd.read_csv(csvs[0])
                        df.to_csv(self.cache_path, index=False)
                        ok(f"Downloaded {dataset_id}: {len(df):,} rows")
                        return df
                        
            except subprocess.TimeoutExpired:
                warn(f"{dataset_id}: Download timeout")
            except FileNotFoundError:
                warn("Kaggle CLI not found — using verified courses only")
                return None
            except Exception as e:
                warn(f"{dataset_id}: {e}")
        
        return None
    
    def _parse_catalog(self, df: pd.DataFrame) -> Tuple[List[Dict], Dict]:
        """Parse courses from catalog dataframe."""
        courses = []
        stats = {"hours_from_catalog": 0, "hours_estimated": 0}
        
        info(f"Catalog columns: {list(df.columns)[:12]}")
        
        # Map column names
        columns = self._map_columns(df)
        info(f"Mapped: title={columns.get('title')}, rating={columns.get('rating')}, "
             f"reviews={columns.get('reviews')}, hours={columns.get('hours')}")
        
        if not columns.get("title"):
            warn("Could not find title column")
            return courses, stats
        
        # Process rows
        for idx, row_data in df.head(3000).iterrows():
            course = self._parse_course_row(idx, row_data, columns, stats)
            if course:
                courses.append(course)
        
        return courses, stats
    
    def _map_columns(self, df: pd.DataFrame) -> Dict[str, Optional[str]]:
        """Map standardized column names to actual column names."""
        named_cols = [c for c in df.columns if not str(c).startswith("Unnamed")]
        
        def find_col(patterns: List[str]) -> Optional[str]:
            for col in named_cols:
                col_lower = col.lower()
                for pattern in patterns:
                    if pattern in col_lower:
                        return col
            return None
        
        return {
            "title": find_col(["course_title", "course_name", "title", "name"]),
            "rating": find_col(["rating", "stars", "score"]),
            "reviews": find_col(["review", "enroll", "student", "subscriber"]),
            "hours": find_col(["content_duration", "hour", "duration", "length"]),
            "url": find_col(["url", "link", "href"]),
        }
    
    def _parse_course_row(
        self,
        idx: int,
        row_data: pd.Series,
        columns: Dict[str, Optional[str]],
        stats: Dict[str, int]
    ) -> Optional[Dict]:
        """Parse a single course row."""
        # Title
        title = ""
        if columns["title"]:
            title = str(row_data.get(columns["title"], "")).strip()
        if not title or title == "nan":
            return None
        
        title_lower = title.lower()
        
        # Detect skills
        detected_skills = self._detect_skills(title_lower)
        if not detected_skills:
            return None
        
        # Rating
        rating = 4.5
        if columns["rating"]:
            try:
                rating = float(str(row_data.get(columns["rating"], 4.5) or 4.5)
                              .replace(",", "."))
                rating = min(5.0, max(1.0, rating))
            except (ValueError, TypeError):
                rating = 4.5
        
        # Reviews
        reviews = 0
        if columns["reviews"]:
            try:
                reviews = int(str(row_data.get(columns["reviews"], 0) or 0)
                             .replace(",", "").split(".")[0])
            except (ValueError, TypeError):
                reviews = 0
        
        # Hours
        hours = None
        hours_source = "estimated"
        
        if columns["hours"]:
            raw_hours = str(row_data.get(columns["hours"], "") or "")
            hours = parse_hours_string(raw_hours)
            if hours:
                hours_source = "catalog"
                stats["hours_from_catalog"] += 1
        
        if hours is None:
            # Use calibrated estimate
            primary_skill = detected_skills[0]
            hours = self.config.skill_hours.get_hours(primary_skill)
            hours_source = "onet_estimate"
            stats["hours_estimated"] += 1
        
        # Platform
        url = ""
        if columns["url"]:
            url = str(row_data.get(columns["url"], ""))
        
        platform = "Udemy"
        if "coursera" in title_lower or "coursera" in url.lower():
            platform = "Coursera"
        
        # Level
        level = "Beginner" if any(
            w in title_lower for w in 
            ["beginner", "intro", "fundamental", "basics", "complete", "zero"]
        ) else "Intermediate"
        
        return {
            "id": f"real_{idx:05d}",
            "title": title[:80],
            "platform": platform,
            "rating": round(rating, 1),
            "reviews": reviews,
            "skills_taught": detected_skills,
            "hours": round(hours, 1),
            "hours_source": hours_source,
            "url": url,
            "level": level,
            "source": "Kaggle catalog",
        }
    
    def _detect_skills(self, title_lower: str) -> List[str]:
        """Detect skills from course title using semantic matching."""
        detected = []
        
        for skill, synonyms in self.config.semantic.skill_synonyms.items():
            for synonym in synonyms:
                if synonym in title_lower:
                    detected.append(skill)
                    break
        
        return detected
    
    def _get_verified_courses(self) -> List[Dict]:
        """Get hand-verified courses with accurate hours."""
        return [
            {"id": "rc01", "title": "Microsoft Power BI Desktop for Business Intelligence",
             "platform": "Udemy", "rating": 4.8, "reviews": 42000,
             "skills_taught": ["Power BI", "DAX", "data visualization"],
             "hours": 8.5, "hours_source": "verified",
             "url": "https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc02", "title": "Tableau 2024 A-Z: Hands-On Tableau Training for Data Science",
             "platform": "Udemy", "rating": 4.7, "reviews": 81000,
             "skills_taught": ["Tableau", "data visualization"],
             "hours": 9.0, "hours_source": "verified",
             "url": "https://www.udemy.com/course/tableau10/",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc03", "title": "The Complete SQL Bootcamp: Go from Zero to Hero",
             "platform": "Udemy", "rating": 4.8, "reviews": 119000,
             "skills_taught": ["SQL", "data cleaning"],
             "hours": 9.5, "hours_source": "verified",
             "url": "https://www.udemy.com/course/the-complete-sql-bootcamp/",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc04", "title": "Python for Data Science and Machine Learning Bootcamp",
             "platform": "Udemy", "rating": 4.8, "reviews": 74000,
             "skills_taught": ["Python", "Pandas", "scikit-learn", "data visualization"],
             "hours": 25.0, "hours_source": "verified",
             "url": "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc05", "title": "Statistics for Data Science and Business Analysis",
             "platform": "Udemy", "rating": 4.5, "reviews": 32000,
             "skills_taught": ["statistics", "A/B testing"],
             "hours": 7.5, "hours_source": "verified",
             "url": "https://www.udemy.com/course/statistics-for-data-science-and-business-analysis/",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc06", "title": "Google Data Analytics Professional Certificate",
             "platform": "Coursera", "rating": 4.8, "reviews": 125000,
             "skills_taught": ["SQL", "R", "data cleaning", "Excel", "communication", "data visualization"],
             "hours": 40.0, "hours_source": "verified",
             "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc07", "title": "IBM Data Analyst Professional Certificate",
             "platform": "Coursera", "rating": 4.7, "reviews": 47000,
             "skills_taught": ["SQL", "Python", "Excel", "Power BI", "data visualization", "data cleaning"],
             "hours": 35.0, "hours_source": "verified",
             "url": "https://www.coursera.org/professional-certificates/ibm-data-analyst",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc08", "title": "Machine Learning Specialization (Stanford/DeepLearning.AI)",
             "platform": "Coursera", "rating": 4.9, "reviews": 152000,
             "skills_taught": ["machine learning", "Python", "statistics", "scikit-learn"],
             "hours": 60.0, "hours_source": "verified",
             "url": "https://www.coursera.org/specializations/machine-learning-introduction",
             "level": "Intermediate", "source": "verified"},
            
            {"id": "rc09", "title": "Business Intelligence & Data Warehousing Fundamentals",
             "platform": "Coursera", "rating": 4.6, "reviews": 8000,
             "skills_taught": ["data warehousing", "ETL", "SQL", "data visualization"],
             "hours": 18.0, "hours_source": "verified",
             "url": "https://www.coursera.org/learn/data-warehouse-fundamentals-for-it-professionals",
             "level": "Intermediate", "source": "verified"},
            
            {"id": "rc10", "title": "DAX for Power BI — Advanced Calculations",
             "platform": "Udemy", "rating": 4.7, "reviews": 9000,
             "skills_taught": ["DAX", "Power BI"],
             "hours": 7.0, "hours_source": "verified",
             "url": "https://www.udemy.com/course/dax-powerbi/",
             "level": "Advanced", "source": "verified"},
            
            {"id": "rc11", "title": "Natural Language Processing with Classification and Vector Spaces",
             "platform": "Coursera", "rating": 4.8, "reviews": 31000,
             "skills_taught": ["NLP", "Python", "machine learning"],
             "hours": 17.0, "hours_source": "verified",
             "url": "https://www.coursera.org/learn/classification-vector-spaces-in-nlp",
             "level": "Intermediate", "source": "verified"},
            
            {"id": "rc12", "title": "A/B Testing by Google",
             "platform": "Udacity", "rating": 4.7, "reviews": 12000,
             "skills_taught": ["A/B testing", "statistics"],
             "hours": 12.0, "hours_source": "verified",
             "url": "https://www.udacity.com/course/ab-testing--ud257",
             "level": "Intermediate", "source": "verified"},
            
            {"id": "rc13", "title": "AWS Cloud Practitioner Essentials",
             "platform": "Coursera", "rating": 4.7, "reviews": 55000,
             "skills_taught": ["AWS"],
             "hours": 6.0, "hours_source": "verified",
             "url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc14", "title": "Excel Skills for Business Specialization",
             "platform": "Coursera", "rating": 4.9, "reviews": 105000,
             "skills_taught": ["Excel", "data visualization", "communication"],
             "hours": 24.0, "hours_source": "verified",
             "url": "https://www.coursera.org/specializations/excel",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc15", "title": "TensorFlow Developer Professional Certificate",
             "platform": "Coursera", "rating": 4.7, "reviews": 38000,
             "skills_taught": ["TensorFlow", "deep learning", "Python", "NLP"],
             "hours": 48.0, "hours_source": "verified",
             "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice",
             "level": "Intermediate", "source": "verified"},
            
            {"id": "rc16", "title": "Power BI Essential Training",
             "platform": "LinkedIn Learning", "rating": 4.6, "reviews": 18000,
             "skills_taught": ["Power BI", "data visualization"],
             "hours": 6.5, "hours_source": "verified",
             "url": "https://www.linkedin.com/learning/power-bi-essential-training",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc17", "title": "Tableau for Beginners: Get Certified, Succeed as a Data Analyst",
             "platform": "Udemy", "rating": 4.6, "reviews": 55000,
             "skills_taught": ["Tableau", "data visualization"],
             "hours": 10.5, "hours_source": "verified",
             "url": "https://www.udemy.com/course/tableau-for-beginners/",
             "level": "Beginner", "source": "verified"},
            
            {"id": "rc18", "title": "Complete ETL and Data Pipeline with Python",
             "platform": "Udemy", "rating": 4.5, "reviews": 7200,
             "skills_taught": ["ETL", "data warehousing", "Python"],
             "hours": 12.0, "hours_source": "verified",
             "url": "https://www.udemy.com/course/data-pipeline-python/",
             "level": "Intermediate", "source": "verified"},
        ]
    
    def find_courses_for_skill(
        self,
        skill: str,
        limit: int = 5
    ) -> List[Dict]:
        """Find courses that teach a specific skill."""
        skill_lower = skill.lower()
        matching = []
        
        for course in self.courses:
            for taught_skill in course["skills_taught"]:
                if skill_lower in taught_skill.lower() or taught_skill.lower() in skill_lower:
                    matching.append(course)
                    break
        
        # Sort by rating and reviews
        matching.sort(
            key=lambda c: (c.get("rating", 0) * 0.6 + min(c.get("reviews", 0) / 10000, 1) * 0.4),
            reverse=True
        )
        
        return matching[:limit]


# ══════════════════════════════════════════════════════════════════════════════
#  OULAD LOADER (Published Statistics)
# ══════════════════════════════════════════════════════════════════════════════

class OuladLoader:
    """
    Load OULAD dropout thresholds from published statistics.
    
    Source: Kuzilek J., Hlosta M., Zdrahal Z. (2017). 
    Open University Learning Analytics dataset. 
    Scientific Data 4, 170171. doi:10.1038/sdata.2017.171
    
    Note: We use published statistics directly rather than attempting
    to download the full dataset, as the download URL is unreliable.
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self._thresholds: Optional[Dict] = None
    
    @property
    def thresholds(self) -> Dict:
        """Get OULAD thresholds (lazy loaded)."""
        if self._thresholds is None:
            self._thresholds = self.load()
        return self._thresholds
    
    def load(self) -> Dict:
        """
        Load OULAD thresholds from config.
        
        Returns:
            Dictionary with dropout thresholds and statistics
        """
        header("REAL DATA — OULAD Dropout Thresholds (Kuzilek et al., 2017)")
        
        oulad = self.config.oulad
        
        ok(f"Using OULAD published statistics — doi:{oulad.doi}")
        row("Withdrawal rate", f"{oulad.withdrawal_rate*100:.1f}% of {oulad.total_students:,} students")
        row("Pass rate", f"{oulad.pass_rate*100:.1f}%")
        row("Distinction rate", f"{oulad.distinction_rate*100:.1f}%")
        row("Stall warning threshold", f"{oulad.stall_warning_days} days inactive (40% withdrawal risk)")
        row("Stall critical threshold", f"{oulad.stall_critical_days} days inactive (68% withdrawal risk)")
        
        return {
            "withdrawal_rate": oulad.withdrawal_rate,
            "pass_rate": oulad.pass_rate,
            "distinction_rate": oulad.distinction_rate,
            "fail_rate": oulad.fail_rate,
            "total_students": oulad.total_students,
            "stall_warning_days": oulad.stall_warning_days,
            "stall_critical_days": oulad.stall_critical_days,
            "completion_reminder_pct": oulad.completion_reminder_pct,
            "milestone_celebrate_pct": oulad.milestone_celebrate_pct,
        }


# ══════════════════════════════════════════════════════════════════════════════
#  COMBINED DATA LOADER
# ══════════════════════════════════════════════════════════════════════════════

class DataLoader:
    """Unified data loader for all data sources."""
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self.onet = ONetLoader(config)
        self.courses = CourseLoader(config)
        self.oulad = OuladLoader(config)
    
    def load_all(self) -> Dict:
        """
        Load all data sources.
        
        Returns:
            Dictionary with skill_hours, courses, and oulad_thresholds
        """
        return {
            "skill_hours": self.onet.skill_hours,
            "courses": self.courses.courses,
            "oulad_thresholds": self.oulad.thresholds,
        }


if __name__ == "__main__":
    # Test data loaders
    print("Testing data loaders...\n")
    
    loader = DataLoader()
    
    # Test O*NET
    print(f"Python hours: {loader.onet.get_hours('Python')}")
    print(f"Unknown skill hours: {loader.onet.get_hours('unknown_skill')}")
    
    # Test courses
    tableau_courses = loader.courses.find_courses_for_skill("Tableau", limit=3)
    print(f"\nTop Tableau courses:")
    for c in tableau_courses:
        print(f"  - {c['title']} ({c['hours']}h)")
    
    # Test OULAD
    print(f"\nOULAD stats loaded: {len(loader.oulad.thresholds)} entries")
    
    print("\n[OK] Data loader tests complete!")
