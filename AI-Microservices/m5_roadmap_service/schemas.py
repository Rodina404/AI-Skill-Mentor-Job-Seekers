from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class RoadmapRequest(BaseModel):
    user_id: str
    missing_skills: List[str]
    hours_per_week: int
    deadline_weeks: int
    job_title: str

class ProgressRequest(BaseModel):
    user_id: str
    roadmap_id: str
    completed_items: List[str]
    last_active_iso: str

class NotifyRequest(BaseModel):
    user_id: str
    last_active_iso: str
    progress_pct: float

class ExplainRequest(BaseModel):
    user_id: str
    skill: str
    course_title: str
    match_score: float
    market_freq: float

class StandardResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None
