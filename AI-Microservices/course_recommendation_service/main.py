import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.run import router as run_router
from routes.run import recommender
from routes.health import router as health_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Course Recommendation AI modules...")
    if not recommender.initialize():
        logger.error("Failed to initialize course recommender - missing data/model files")
    else:
        logger.info("Course recommender fully initialized.")
    yield
    logger.info("Shutting down Course Recommendation Service.")

app = FastAPI(
    title="Course Recommendation Service",
    description="Microservice providing FAISS vector search course recommendations for Node backend",
    version="1.0.0",
    lifespan=lifespan
)

allowed_origins = [
    "http://localhost:3000",
]
if os.getenv("ALLOWED_ORIGIN"):
    allowed_origins.append(os.getenv("ALLOWED_ORIGIN"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(run_router)
app.include_router(health_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8006"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
