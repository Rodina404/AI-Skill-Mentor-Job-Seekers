from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import fitz # PyMuPDF
import io
from .recommender import ProfessionalRecommender
from .skill_processor import SkillProcessor

router = APIRouter(prefix="/api/v2", tags=["Enhanced Recommendations"])

# Initialization
recommender = ProfessionalRecommender()
processor = SkillProcessor(model=recommender.model)

# Models
class JobRecommendationRequest(BaseModel):
    user_profile: str = Field(..., description="Resume text or list of skills")
    target_role: Optional[str] = Field(None, description="Specific job role the user is targeting")
    top_n: int = Field(5, ge=1, le=20)

class CourseRecommendationRequest(BaseModel):
    user_skills: List[str] = Field(..., description="List of current user skills")
    target_job_skills: List[str] = Field(..., description="Required skills for the target job")
    top_n: int = Field(5, ge=1, le=20)

class UserConstraints(BaseModel):
    level: Optional[str] = Field(None, description="Preferred course level (e.g., Beginner, Intermediate)")
    language: Optional[str] = Field(None, description="Preferred language")
    hoursPerWeek: Optional[int] = Field(None, description="Hours available per week")

class AdvancedCourseRequest(BaseModel):
    missingSkills: List[str] = Field(..., description="List of missing skills to fill")
    userConstraints: Optional[UserConstraints] = None
    top_n: int = Field(10, ge=1, le=20)

class SkillExtractionRequest(BaseModel):
    text: str = Field(..., description="Text to analyze")

# Endpoints
@router.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    """Extracts text and skills from an uploaded PDF CV."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        
        # Extract skills immediately
        skills = processor.extract_skills(text)
        
        return {
            "success": True,
            "filename": file.filename,
            "text_preview": text[:500] + "...",
            "extracted_skills": skills,
            "full_text": text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-skills")
async def extract_skills(request: SkillExtractionRequest):
    """Extracts professional skills from the provided text."""
    try:
        skills = processor.extract_skills(request.text)
        return {"success": True, "skills": skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend-jobs")
async def recommend_jobs(request: JobRecommendationRequest):
    """Provides professional job recommendations with readiness scores."""
    try:
        recommendations = recommender.recommend_jobs(request.user_profile, request.target_role, request.top_n)
        return {
            "success": True,
            "count": len(recommendations),
            "data": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend-courses")
async def recommend_courses(request: CourseRecommendationRequest):
    """Provides targeted course recommendations to bridge skill gaps."""
    try:
        recommendations = recommender.recommend_courses(
            request.user_skills, 
            request.target_job_skills, 
            request.top_n
        )
        return {
            "success": True,
            "count": len(recommendations),
            "data": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/recommend/courses")
async def advanced_recommend_courses(request: AdvancedCourseRequest):
    """Advanced grouped course recommendation using hybrid reranking and user constraints."""
    try:
        constraints = request.userConstraints.dict() if request.userConstraints else {}
        grouped_courses = recommender.advanced_recommend_courses_grouped(
            missing_skills=request.missingSkills,
            constraints=constraints,
            top_n=request.top_n
        )
        return grouped_courses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Checks the health of the enhanced recommendation engine."""
    status = {
        "engine": "active",
        "artifacts": {
            "jobs_index": recommender.jobs_index is not None,
            "courses_index": recommender.courses_index is not None
        }
    }
    return status
