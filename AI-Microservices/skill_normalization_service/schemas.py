"""
Pydantic models for request/response validation.

All models are used by routes to validate incoming requests and structure outgoing responses.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator


class EducationInput(BaseModel):
    """Education information from request"""
    degree: Optional[str] = Field(default="", description="Degree type (e.g., BSc, MSc, PhD)")
    field: Optional[str] = Field(default="", description="Field of study (e.g., Computer Science)")
    university: Optional[str] = Field(default="", description="University/Institution name")
    year: Optional[int] = Field(default=0, description="Graduation year")

    class Config:
        schema_extra = {
            "example": {
                "degree": "BSc",
                "field": "Computer Science",
                "university": "MIT",
                "year": 2023
            }
        }


class ExperienceInput(BaseModel):
    """Experience information from request"""
    titles: Optional[List[str]] = Field(default_factory=list, description="Job titles held")
    years: Optional[float] = Field(default=0.0, description="Total years of experience")

    class Config:
        schema_extra = {
            "example": {
                "titles": ["Data Scientist", "Data Analyst"],
                "years": 3.5
            }
        }


class ProfileBuildRequest(BaseModel):
    """POST /run request body - pre-extracted user data"""
    userId: str = Field(..., description="Unique user identifier", min_length=1)
    skills: List[str] = Field(..., description="Array of skill strings (raw, may have variations)", min_items=1)
    education: Optional[EducationInput] = Field(default_factory=EducationInput, description="Education information")
    experience: Optional[ExperienceInput] = Field(default_factory=ExperienceInput, description="Experience information")

    @validator('skills')
    def validate_skills(cls, v):
        if not v or len(v) == 0:
            raise ValueError("skills array must contain at least one skill")
        return [str(s).strip() for s in v if s]

    @validator('userId')
    def validate_user_id(cls, v):
        if not v or len(v) == 0:
            raise ValueError("userId cannot be empty")
        return v.strip()

    class Config:
        schema_extra = {
            "example": {
                "userId": "USER_123",
                "skills": ["python", "sql", "machine learning"],
                "education": {
                    "degree": "BSc",
                    "field": "Computer Science",
                    "university": "Stanford",
                    "year": 2022
                },
                "experience": {
                    "titles": ["Software Engineer", "Data Analyst"],
                    "years": 2.5
                }
            }
        }


class EducationOutput(BaseModel):
    """Education in response"""
    degree: str
    field: str
    university: str
    year: int


class ExperienceOutput(BaseModel):
    """Experience in response"""
    titles: List[str]
    years: float


class SkillOutput(BaseModel):
    """Normalized skill in response"""
    skillId: str = Field(..., description="Canonical skill ID (e.g., S_python)")
    name: str = Field(..., description="Canonical skill name (e.g., Python)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Match confidence (1.0=exact, 0.7+=semantic)")

    class Config:
        schema_extra = {
            "example": {
                "skillId": "S_python",
                "name": "Python",
                "confidence": 1.0
            }
        }


class Statistics(BaseModel):
    """Processing statistics in response"""
    totalInputSkills: int = Field(..., description="Number of input skills")
    matchedSkills: int = Field(..., description="Number of successfully normalized skills")
    unknownSkills: int = Field(..., description="Number of skills that could not be matched")
    avgConfidence: float = Field(..., ge=0.0, le=1.0, description="Average confidence across all matches")


class UserProfile(BaseModel):
    """Complete normalized user profile in response"""
    userId: str = Field(..., description="User ID (echoed from request)")
    skills: List[SkillOutput] = Field(..., description="Normalized, deduplicated skills")
    education: EducationOutput = Field(..., description="Education information")
    experience: ExperienceOutput = Field(..., description="Experience information")
    statistics: Statistics = Field(..., description="Processing statistics")

    class Config:
        schema_extra = {
            "example": {
                "userId": "USER_123",
                "skills": [
                    {
                        "skillId": "S_python",
                        "name": "Python",
                        "confidence": 1.0
                    },
                    {
                        "skillId": "S_sql",
                        "name": "SQL",
                        "confidence": 1.0
                    }
                ],
                "education": {
                    "degree": "BSc",
                    "field": "Computer Science",
                    "university": "Stanford",
                    "year": 2022
                },
                "experience": {
                    "titles": ["Software Engineer", "Data Analyst"],
                    "years": 2.5
                },
                "statistics": {
                    "totalInputSkills": 2,
                    "matchedSkills": 2,
                    "unknownSkills": 0,
                    "avgConfidence": 1.0
                }
            }
        }


class ErrorDetail(BaseModel):
    """Error information in response"""
    code: str = Field(..., description="Error code (e.g., VALIDATION_ERROR, INTERNAL_SERVER_ERROR)")
    message: str = Field(..., description="Human-readable error message")


class SuccessResponse(BaseModel):
    """Successful response wrapper"""
    success: bool = Field(default=True, description="Always true for success responses")
    data: UserProfile = Field(..., description="Complete user profile with normalized skills")
    meta: Dict[str, Any] = Field(..., description="Response metadata")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "userId": "USER_123",
                    "skills": [],
                    "education": {
                        "degree": "",
                        "field": "",
                        "university": "",
                        "year": 0
                    },
                    "experience": {
                        "titles": [],
                        "years": 0.0
                    },
                    "statistics": {
                        "totalInputSkills": 0,
                        "matchedSkills": 0,
                        "unknownSkills": 0,
                        "avgConfidence": 0.0
                    }
                },
                "meta": {
                    "processingTimeMs": 150,
                    "userId": "USER_123"
                }
            }
        }


class ErrorResponse(BaseModel):
    """Error response wrapper"""
    success: bool = Field(default=False, description="Always false for error responses")
    error: ErrorDetail = Field(..., description="Error information")

    class Config:
        schema_extra = {
            "example": {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "userId cannot be empty"
                }
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status (ok/degraded)")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="API version")

    class Config:
        schema_extra = {
            "example": {
                "status": "ok",
                "service": "Skill Normalization & User Profile Building",
                "version": "1.0.0"
            }
        }
