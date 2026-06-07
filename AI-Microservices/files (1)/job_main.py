"""
job_recommendation_service — port 8007
Recommends jobs based on user's skill readiness score and normalized skills.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routes.job_routes import router as job_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize recommender on startup, clean up on shutdown."""
    from routes.job_routes import init_recommender
    await init_recommender()
    print("✅ Job Recommendation Service ready on port 8007")
    yield
    print("Job Recommendation Service shutting down.")

app = FastAPI(
    title="Job Recommendation Service",
    description="Recommends jobs based on user skill readiness score from gap analysis.",
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

app.include_router(job_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "job-recommendation", "port": 8007}
