import os
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Skill(BaseModel):
    skill_id: str
    skill_name: str

class UserConstraints(BaseModel):
    level: Optional[str] = "all"  # beginner, intermediate, advanced, all
    language: Optional[str] = "en"
    hours_per_week: Optional[float] = None
    max_duration_hours: Optional[float] = None

class CourseRecommendationRequest(BaseModel):
    user_id: str
    missing_skills: List[Skill]
    user_constraints: Optional[UserConstraints] = Field(default_factory=UserConstraints)

class CourseResult(BaseModel):
    course_id: str
    title: str
    url: Optional[str] = None
    score: float
    duration: float
    provider: str
    level: str
    language: str

class SkillRecommendations(BaseModel):
    skill_id: str
    skill_name: str
    courses: List[CourseResult]

class RecommendationData(BaseModel):
    recommendations: List[SkillRecommendations]

class ResponseMeta(BaseModel):
    processing_time_ms: int
    user_id: str

class CourseRecommendationResponse(BaseModel):
    success: bool
    data: RecommendationData
    meta: ResponseMeta

class ErrorDetails(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetails
