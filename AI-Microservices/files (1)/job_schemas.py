from pydantic import BaseModel, Field
from typing import List, Optional

class JobRecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    normalized_skills: List[str] = Field(..., description="User's current skills from normalization service")
    readiness_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Score from gap engine (0-1)")
    target_role: Optional[str] = Field(None, description="Preferred job role")
    top_k: int = Field(default=5, ge=1, le=20)

class JobItem(BaseModel):
    job_id: str
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    required_skills: Optional[List[str]] = []
    match_score: float
    readiness_fit: Optional[float] = None
    description_snippet: Optional[str] = None

class JobRecommendationResponse(BaseModel):
    user_id: Optional[str] = None
    user_skills: List[str]
    readiness_score: Optional[float]
    recommendations: List[JobItem]
    total_found: int
