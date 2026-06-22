from pydantic import BaseModel
from typing import List, Optional

class RoadmapRequest(BaseModel):
    user_id: str
    missing_skills: List[str]
    hours_per_week: int = 10
    deadline_weeks: int = 8
    job_title: str
    resume_id: Optional[str] = None
    job_id: Optional[str] = None

class ProgressRequest(BaseModel):
    user_id: str
    roadmap_id: str
    completed_items: List[str]
    last_active_iso: str

class NotifyRequest(BaseModel):
    user_id: str
    last_active_iso: str
    progress_pct: float = 0.0
    roadmap_id: Optional[str] = None

class ExplainRequest(BaseModel):
    user_id: str
    skill: str
    course_title: str
    match_score: float = 0.85
    market_freq: float = 1.0
    job_title: Optional[str] = None
