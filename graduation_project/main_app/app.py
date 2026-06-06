"""
Graduation Project: AI Skill Mentor
A comprehensive recommendation system with Job and Course recommendations
"""

import sys
from pathlib import Path

# Add parent directory to path to enable imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
import uvicorn
import logging

# Import recommendation systems
from job_recommendation.routes.job_routes import router as job_router
from course_recommendation.routes.course_routes import router as course_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting AI Skill Mentor Graduation Project")
    yield
    logger.info("Shutting down AI Skill Mentor Graduation Project")

# Create FastAPI application
app = FastAPI(
    title="AI Skill Mentor - Graduation Project",
    description="A comprehensive recommendation system for jobs and courses using advanced ML techniques",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(job_router, prefix="/api/v1", tags=["Job Recommendations"])
app.include_router(course_router, prefix="/api/v1", tags=["Course Recommendations"])

# Serve a lightweight static UI for manual testing
static_dir = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/ui", response_class=HTMLResponse)
async def ui():
    html_path = static_dir / "index.html"
    return html_path.read_text(encoding="utf-8")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Skill Mentor Graduation Project API",
        "version": "2.0.0",
        "endpoints": {
            "job_recommendations": "/api/v1/recommend-job",
            "course_recommendations": "/api/v1/recommend-course",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Skill Mentor"}

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )