"""
schemas.py - Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, List


class SkillInput(BaseModel):
    skillId: str = Field(..., description="Canonical skill ID (e.g. S_python) or raw name")


class UserProfile(BaseModel):
    skills: list[SkillInput] = Field(default_factory=list, description="Skills the user currently has")
    experienceLevel: str = Field(default="", description="e.g. 'junior', '3 years', 'senior'")
    educationLevel: str = Field(default="", description="e.g. 'bachelor', 'master', 'phd'")
    experienceScore: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    educationScore: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    model_config = {"extra": "forbid"}


class RoleGapRequest(BaseModel):
    jobTitle: str = Field(..., min_length=1, description="Target job title to analyze")
    userProfile: Optional[UserProfile] = Field(default=None, description="Optional user profile with skills and scores")
    seniority: Optional[str] = Field(default=None, description="Seniority level (junior/mid/senior)")
    location: Optional[str] = Field(default=None, description="Job location context")
    industry: Optional[str] = Field(default=None, description="Industry context")

    model_config = {
        "extra": "forbid",
        "json_schema_extra": {
            "example": {
                "jobTitle": "Machine Learning Engineer",
                "userProfile": {
                    "skills": [{"skillId": "S_python"}, {"skillId": "S_pytorch"}],
                    "experienceLevel": "senior",
                    "educationLevel": "master",
                },
            }
        }
    }


class AnalyzeRequest(BaseModel):
    role: str = Field(..., description="Target role/job title to analyze")
    skills: List[str] = Field(default_factory=list, description="List of user skill ids or raw names")
    experience: str = Field(default="", description="Experience level (e.g. 'junior', '3 years', 'senior')")
    education: str = Field(default="", description="Education level (e.g. 'bachelor', 'master')")

    model_config = {"extra": "forbid"}


class AnalyzeResult(BaseModel):
    source: str
    confidence: Optional[float] = None
    readiness: Optional[float] = None
    required_skills: List[Any] = Field(default_factory=list)
    matched_skills: List[Any] = Field(default_factory=list)
    missing_skills: List[Any] = Field(default_factory=list)

    model_config = {"extra": "forbid"}


class ResponseMeta(BaseModel):
    processing_time_ms: int
    service: str = "gap-engine"


class SuccessResponse(BaseModel):
    success: bool = True
    data: dict[str, Any]
    meta: ResponseMeta


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
    meta: ResponseMeta
