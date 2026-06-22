"""
AI Skill Mentor - Configuration Module
======================================

Centralized configuration for all pipeline parameters, paths, and constants.
All magic numbers from the original notebook are extracted here for easy tuning.

Usage:
    from skill_mentor_config import Config, SkillHours, OuladThresholds
    
    config = Config()
    config.output_dir = Path("./my_outputs")
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional
import os


@dataclass
class PathConfig:
    """File system paths configuration."""
    
    # Base directories (auto-detect Colab vs local)
    base_dir: Path = field(default_factory=lambda: Path.cwd())
    data_dir: Path = field(default_factory=lambda: Path.cwd() / "skill_mentor_data")
    output_dir: Path = field(default_factory=lambda: Path.cwd() / "output")
    
    def __post_init__(self):
        """Create directories if they don't exist."""
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    @property
    def onet_cache(self) -> Path:
        return self.data_dir / "onet_tech_skills.txt"
    
    @property
    def course_cache(self) -> Path:
        return self.data_dir / "coursera" / "coursera_courses.csv"


@dataclass
class NetworkConfig:
    """Network and API configuration."""
    
    # Timeouts (seconds)
    download_timeout: int = 30
    api_timeout: int = 60
    
    # Retry settings
    max_retries: int = 3
    retry_backoff_factor: float = 2.0
    retry_delay_base: float = 1.0
    
    # API endpoints
    onet_tech_skills_url: str = "https://www.onetcenter.org/dl_files/database/db_28_3_text/Technology%20Skills.txt"
    
    # Kaggle datasets (in order of preference)
    kaggle_datasets: List[str] = field(default_factory=lambda: [
        "andrewmvd/udemy-courses",           # Has content_duration
        "siddharthm1698/coursera-course-dataset",
        "elvinrustam/coursera-dataset",
    ])
    
    # API keys (read from environment)
    @property
    def anthropic_api_key(self) -> Optional[str]:
        return os.environ.get("ANTHROPIC_API_KEY", "").strip() or None


@dataclass
class SkillHoursConfig:
    """Calibrated learning hours per skill (from O*NET Job Zone documentation)."""
    
    # Primary skills with verified hours
    calibrated_hours: Dict[str, float] = field(default_factory=lambda: {
        # BI & Visualization
        "Power BI":             25.0,   # Coursera IBM DA cert module
        "Tableau":              30.0,   # Tableau eLearning official
        "DAX":                  18.0,   # Power BI subset
        "data visualization":   20.0,
        
        # Programming & Data
        "Python":               60.0,   # O*NET Job Zone 3
        "R":                    50.0,
        "SQL":                  40.0,   # O*NET Job Zone 2
        "Excel":                20.0,
        "Pandas":               20.0,
        "Git":                  10.0,
        
        # Data Engineering
        "ETL":                  35.0,
        "Spark":                45.0,
        "data warehousing":     40.0,
        "data cleaning":        15.0,
        
        # Machine Learning
        "machine learning":     80.0,   # O*NET Job Zone 4
        "deep learning":        100.0,
        "NLP":                  70.0,
        "scikit-learn":         30.0,
        "TensorFlow":           50.0,
        "PyTorch":              50.0,
        
        # Statistics & Testing
        "statistics":           50.0,
        "A/B testing":          20.0,
        
        # Soft Skills
        "communication":        10.0,
        "stakeholder communication": 8.0,
        "leadership":           15.0,
        "project management":   30.0,
        
        # Cloud & DevOps
        "AWS":                  50.0,
        "Docker":               25.0,
        "Kubernetes":           40.0,
    })
    
    # Default hours for unknown skills
    default_hours: float = 20.0
    
    # O*NET Hot Technology bonus
    hot_technology_bonus: float = 10.0
    
    def get_hours(self, skill: str) -> float:
        """Get learning hours for a skill (case-insensitive)."""
        skill_lower = skill.lower()
        for key, hours in self.calibrated_hours.items():
            if key.lower() == skill_lower:
                return hours
        return self.default_hours


@dataclass
class OuladThresholds:
    """OULAD dropout thresholds (Kuzilek et al., 2017)."""
    
    # Published statistics
    withdrawal_rate: float = 0.317      # 31.7%
    pass_rate: float = 0.376            # 37.6%
    distinction_rate: float = 0.217     # 21.7%
    fail_rate: float = 0.090            # 9.0%
    total_students: int = 32593
    
    # Notification thresholds (days inactive)
    stall_warning_days: int = 7         # 40% withdrawal risk
    stall_critical_days: int = 14       # 68% withdrawal risk
    
    # Milestone thresholds
    completion_reminder_pct: float = 0.25
    milestone_celebrate_pct: float = 0.50
    
    # DOI reference
    doi: str = "10.1038/sdata.2017.171"


@dataclass
class SkillPrerequisites:
    """Skill dependency graph for proper learning order."""
    
    # Prerequisites: skill -> list of skills that should be learned first
    dependencies: Dict[str, List[str]] = field(default_factory=lambda: {
        # ML requires fundamentals
        "machine learning": ["Python", "statistics", "Pandas"],
        "deep learning": ["machine learning", "Python"],
        "NLP": ["machine learning", "Python"],
        "TensorFlow": ["deep learning", "Python"],
        "PyTorch": ["deep learning", "Python"],
        "scikit-learn": ["Python", "Pandas", "statistics"],
        
        # Data engineering
        "Spark": ["Python", "SQL"],
        "data warehousing": ["SQL", "ETL"],
        "ETL": ["SQL", "Python"],
        
        # BI tools
        "DAX": ["Power BI"],
        "Power BI": ["Excel", "data visualization"],
        "Tableau": ["data visualization"],
        
        # Statistics & Testing
        "A/B testing": ["statistics"],
        
        # Advanced Python
        "Pandas": ["Python"],
        
        # Cloud
        "Kubernetes": ["Docker"],
    })
    
    def get_prerequisites(self, skill: str) -> List[str]:
        """Get prerequisites for a skill (case-insensitive)."""
        skill_lower = skill.lower()
        for key, prereqs in self.dependencies.items():
            if key.lower() == skill_lower:
                return prereqs
        return []
    
    def get_learning_order(self, skills: List[str]) -> List[str]:
        """Sort skills by dependency order (prerequisites first)."""
        # Build adjacency list
        all_skills = set(skills)
        for skill in skills:
            for prereq in self.get_prerequisites(skill):
                all_skills.add(prereq)
        
        # Topological sort
        visited = set()
        order = []
        
        def visit(skill: str):
            if skill in visited:
                return
            visited.add(skill)
            for prereq in self.get_prerequisites(skill):
                if prereq in all_skills:
                    visit(prereq)
            if skill in skills:  # Only include requested skills
                order.append(skill)
        
        for skill in skills:
            visit(skill)
        
        return order


@dataclass
class RoadmapConfig:
    """Roadmap generation parameters."""
    
    # Scheduling weights
    priority_weights: Dict[str, float] = field(default_factory=lambda: {
        "high": 3.0,
        "medium": 2.0,
        "low": 1.0,
    })
    
    # Buffer weeks
    buffer_week_interval: int = 4       # Insert buffer every N weeks
    buffer_week_ratio: float = 0.5      # Buffer week uses 50% of normal hours
    
    # Task allocation
    max_hours_per_task_ratio: float = 0.6  # Max 60% of weekly hours per task
    min_task_hours: float = 0.5            # Don't create tasks under 0.5h
    mini_project_hours: float = 2.0        # Hours for mini-projects
    
    # Milestones
    milestone_thresholds: List[float] = field(default_factory=lambda: [0.25, 0.50, 0.75, 1.0])
    
    # Default constraints
    default_hours_per_week: float = 10.0
    default_deadline_weeks: int = 12
    min_hours_per_week: float = 2.0
    max_hours_per_week: float = 40.0
    min_deadline_weeks: int = 1
    max_deadline_weeks: int = 52


@dataclass 
class ProgressConfig:
    """Progress engine parameters."""
    
    # Readiness score weights (must sum to 1.0)
    skill_alignment_weight: float = 0.50
    experience_weight: float = 0.30
    education_weight: float = 0.20
    
    # Forgetting curve (optional)
    enable_forgetting_curve: bool = False
    forgetting_half_life_days: int = 30  # Skills decay to 50% after this many days
    
    # Progress thresholds
    complete_threshold: float = 100.0
    in_progress_threshold: float = 5.0


@dataclass
class NotificationConfig:
    """Notification system parameters."""
    
    # Rate limiting
    max_notifications_per_day: int = 5
    min_hours_between_same_type: int = 24
    
    # Channels
    available_channels: List[str] = field(default_factory=lambda: [
        "in_app", "email", "push", "sms"
    ])
    
    # Priority to channels mapping
    priority_channels: Dict[str, List[str]] = field(default_factory=lambda: {
        "urgent": ["in_app", "email", "push"],
        "high": ["in_app", "email"],
        "medium": ["in_app", "email"],
        "low": ["in_app"],
    })


@dataclass
class ExplainabilityConfig:
    """L5 Explainability LLM parameters."""
    
    # Model settings
    model_name: str = "claude-3-5-sonnet-20241022"
    max_tokens_per_explanation: int = 400
    max_tokens_roadmap_explanation: int = 300
    
    # Caching
    enable_caching: bool = True
    cache_ttl_hours: int = 24
    
    # Rate limiting
    max_api_calls_per_minute: int = 10
    
    # System prompt
    system_prompt: str = """You are the Explainability module of an AI-Powered Skill Mentor.
Your ONLY job is to write SHORT, CLEAR explanations (2-4 sentences each) for:
1. WHY a specific skill gap was detected
2. WHY a specific course was recommended

STRICT RULES:
- Use ONLY the data provided in the user message. Do not invent new facts.
- Do not mention any course, platform, or skill not explicitly listed in the input.
- Keep each explanation to 2-4 sentences maximum.
- Write in plain, encouraging language for a job seeker.
- Base your reasoning on: gap_score, market_frequency, course_rating, skills_taught.
- Format: return a JSON object with keys "skill_explanation" and "course_explanation".
- Do NOT include markdown fences in your response, only raw JSON."""


@dataclass
class SemanticMatchingConfig:
    """Semantic skill matching parameters."""
    
    # Model for embeddings
    embedding_model: str = "all-MiniLM-L6-v2"
    
    # Matching thresholds
    min_similarity_threshold: float = 0.3
    exact_match_boost: float = 0.3
    
    # Skill synonyms for improved matching
    skill_synonyms: Dict[str, List[str]] = field(default_factory=lambda: {
        "Power BI": ["power bi", "powerbi", "microsoft power bi"],
        "Tableau": ["tableau", "tableau desktop", "tableau public"],
        "SQL": ["sql", "mysql", "postgresql", "database", "sqlite", "tsql"],
        "Python": ["python", "python3", "python programming"],
        "R": ["r programming", "r for data", "r studio", "rstudio", "r language"],
        "Excel": ["excel", "spreadsheet", "microsoft excel", "google sheets"],
        "machine learning": ["machine learning", "ml", "deep learning", "ai", "artificial intelligence"],
        "statistics": ["statistics", "statistical analysis", "stats", "probability"],
        "DAX": ["dax", "power bi dax", "data analysis expressions"],
        "data visualization": ["visualization", "visualisation", "dashboard", "charts", "graphs"],
        "ETL": ["etl", "data pipeline", "data engineering", "data integration"],
        "AWS": ["aws", "amazon web services", "amazon cloud", "ec2", "s3"],
        "Pandas": ["pandas", "numpy", "data manipulation"],
        "NLP": ["nlp", "natural language processing", "text analytics"],
        "A/B testing": ["a/b test", "ab test", "experiment design", "hypothesis testing"],
        "data warehousing": ["warehouse", "snowflake", "bigquery", "redshift", "data lake"],
        "communication": ["communication", "presentation skills", "storytelling", "public speaking"],
        "scikit-learn": ["scikit", "sklearn", "machine learning python"],
        "TensorFlow": ["tensorflow", "keras", "tf"],
        "data cleaning": ["data cleaning", "data wrangling", "data preprocessing", "data preparation"],
        "Git": ["git", "version control", "github", "gitlab"],
        "project management": ["project management", "pmp", "agile", "scrum"],
    })


@dataclass
class SVGConfig:
    """SVG generation parameters."""
    
    # Colors (background, text)
    colors: Dict[str, tuple] = field(default_factory=lambda: {
        "course_section": ("#E6F1FB", "#185FA5"),
        "mini_project":   ("#EAF3DE", "#3B6D11"),
        "review":         ("#FAEEDA", "#854F0B"),
        "project":        ("#FAEEDA", "#854F0B"),
        "milestone":      ("#EEEDFE", "#3C3489"),
        "buffer":         ("#F1EFE8", "#5F5E5A"),
        "high":           ("#FAECE7", "#993C1D"),
        "medium":         ("#E6F1FB", "#185FA5"),
        "low":            ("#EAF3DE", "#3B6D11"),
    })
    
    # Timeline dimensions
    timeline_cell_width_min: int = 48
    timeline_cell_width_max: int = 72
    timeline_cell_height: int = 36
    timeline_label_width: int = 180
    timeline_header_height: int = 50
    
    # Card dimensions
    card_width: int = 700
    card_height: int = 160
    card_gap: int = 16
    card_padding: int = 40


@dataclass
class Config:
    """Master configuration combining all config sections."""
    
    paths: PathConfig = field(default_factory=PathConfig)
    network: NetworkConfig = field(default_factory=NetworkConfig)
    skill_hours: SkillHoursConfig = field(default_factory=SkillHoursConfig)
    oulad: OuladThresholds = field(default_factory=OuladThresholds)
    prerequisites: SkillPrerequisites = field(default_factory=SkillPrerequisites)
    roadmap: RoadmapConfig = field(default_factory=RoadmapConfig)
    progress: ProgressConfig = field(default_factory=ProgressConfig)
    notifications: NotificationConfig = field(default_factory=NotificationConfig)
    explainability: ExplainabilityConfig = field(default_factory=ExplainabilityConfig)
    semantic: SemanticMatchingConfig = field(default_factory=SemanticMatchingConfig)
    svg: SVGConfig = field(default_factory=SVGConfig)
    
    # Logging
    log_level: str = "INFO"
    verbose: bool = True
    
    @classmethod
    def from_dict(cls, data: Dict) -> "Config":
        """Create config from dictionary (e.g., loaded from JSON/YAML)."""
        config = cls()
        # Override defaults with provided values
        for section_name, section_data in data.items():
            if hasattr(config, section_name) and isinstance(section_data, dict):
                section = getattr(config, section_name)
                for key, value in section_data.items():
                    if hasattr(section, key):
                        setattr(section, key, value)
        return config
    
    def validate(self) -> List[str]:
        """Validate configuration and return list of errors."""
        errors = []
        
        # Validate roadmap constraints
        if self.roadmap.min_hours_per_week >= self.roadmap.max_hours_per_week:
            errors.append("min_hours_per_week must be less than max_hours_per_week")
        
        # Validate progress weights
        weight_sum = (
            self.progress.skill_alignment_weight +
            self.progress.experience_weight +
            self.progress.education_weight
        )
        if abs(weight_sum - 1.0) > 0.01:
            errors.append(f"Progress weights must sum to 1.0, got {weight_sum}")
        
        return errors


# Default global config instance
default_config = Config()
