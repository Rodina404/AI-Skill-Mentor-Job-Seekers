from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UserProfile(BaseModel):
    skills: List[str] = Field(default_factory=list, description="List of user skills")
    experience_years: Optional[int] = Field(0, description="Years of experience")
    education: Optional[str] = Field("", description="Education level")
    location: Optional[str] = Field("", description="Preferred location")

class SkillGapContext(BaseModel):
    matched_skills: List[str] = Field(default_factory=list, description="Skills already matched by the skill-gap service")
    missing_skills: List[str] = Field(default_factory=list, description="Missing skills reported by the skill-gap service")
    required_skills: List[str] = Field(default_factory=list, description="Role skills reported by the skill-gap service")
    readiness_score: Optional[float] = Field(None, description="Existing readiness score from the skill-gap service")

class JobRecommendationRequest(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    user_profile: UserProfile = Field(..., description="User profile containing skills and details")
    job_title: str = Field(..., description="Desired job or target role")
    top_n: Optional[int] = Field(10, description="Number of recommendations to return")
    skill_gap: Optional[SkillGapContext] = Field(None, description="Existing skill-gap output; this service does not recalculate it")

class ErrorDetails(BaseModel):
    code: str
    message: str

class StandardErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetails

class ResponseData(BaseModel):
    recommendations: List[Dict[str, Any]] = Field(..., description="List of recommended jobs")
    total_count: int = Field(..., description="Total number of recommendations returned")

class ResponseMeta(BaseModel):
    processing_time_ms: int
    user_id: str
    recommendation_source: str
    warning: Optional[str] = None

class StandardSuccessResponse(BaseModel):
    success: bool = True
    data: ResponseData
    meta: ResponseMeta
