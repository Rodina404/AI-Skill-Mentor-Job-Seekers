from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UserProfile(BaseModel):
    skills: List[str] = Field(default_factory=list, description="List of user skills")
    experience_years: Optional[int] = Field(0, description="Years of experience")
    education: Optional[str] = Field("", description="Education level")
    location: Optional[str] = Field("", description="Preferred location")

class CourseRecommendationRequest(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    user_profile: UserProfile = Field(..., description="User profile containing skills and details")
    job_title: str = Field(..., description="Desired job or target role")
    top_n: Optional[int] = Field(10, description="Number of recommendations to return")

class ErrorDetails(BaseModel):
    code: str
    message: str

class StandardErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetails

class ResponseData(BaseModel):
    recommendations: List[Dict[str, Any]] = Field(..., description="List of recommended courses")
    total_count: int = Field(..., description="Total number of recommendations returned")
    recommendation_type: str = Field(..., description="Type of recommendation algorithm used")

class ResponseMeta(BaseModel):
    processing_time_ms: int
    user_id: str

class StandardSuccessResponse(BaseModel):
    success: bool = True
    data: ResponseData
    meta: ResponseMeta
