"""
Job Recommendation Service — Standalone FastAPI application
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.job_routes import router, recommender

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize recommender on startup, release on shutdown."""
    logger.info("Starting Job Recommendation Service...")
    if not recommender.initialize():
        logger.error("Failed to initialize job recommender — check DATA_PATH")
    else:
        logger.info("Job recommender ready.")
    yield
    logger.info("Job Recommendation Service shutting down.")


app = FastAPI(
    title="Job Recommendation Service",
    description="AI-powered TF-IDF job recommender based on skills and role matching",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/jobs", tags=["Job Recommendations"])


@app.get("/health")
async def root_health():
    return {"status": "ok", "service": "job-recommendation"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8007")),
        reload=os.getenv("ENV", "production") == "development"
    )
