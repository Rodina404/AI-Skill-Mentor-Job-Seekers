from pydantic import BaseModel, Field
from typing import List, Optional

class CourseRecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    missing_skills: List[str] = Field(..., description="Skills identified as missing by gap engine")
    target_role: Optional[str] = Field(None, description="Job role the user is targeting")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of courses to return")

class CourseItem(BaseModel):
    course_id: str
    title: str
    provider: Optional[str] = None
    url: Optional[str] = None
    skills_covered: Optional[List[str]] = []
    difficulty: Optional[str] = None
    duration_hours: Optional[float] = None
    relevance_score: float

class CourseRecommendationResponse(BaseModel):
    user_id: Optional[str] = None
    missing_skills: List[str]
    recommendations: List[CourseItem]
    total_found: int

class RateCourseRequest(BaseModel):
    user_id: str
    course_id: str
    rating: float = Field(..., ge=1.0, le=5.0)
