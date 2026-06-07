"""
course_recommendation_service — port 8006
Recommends courses based on a user's missing skills from gap analysis.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

# Import router
from routes.course_routes import router as course_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize recommender on startup, clean up on shutdown."""
    from routes.course_routes import init_recommender
    await init_recommender()
    print("✅ Course Recommendation Service ready on port 8006")
    yield
    print("Course Recommendation Service shutting down.")

app = FastAPI(
    title="Course Recommendation Service",
    description="Recommends courses based on missing skills identified by the gap engine.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(course_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "course-recommendation", "port": 8006}
