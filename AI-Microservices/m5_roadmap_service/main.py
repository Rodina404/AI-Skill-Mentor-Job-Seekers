from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from routes import roadmap, progress, notify, explain
from schemas import StandardResponse

# Load env variables (API keys)
load_dotenv()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load embedding model on startup
    try:
        from core.skill_mentor_semantic import SemanticMatcher
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Pre-loading roadmap SentenceTransformer model...")
        matcher = SemanticMatcher()
        _ = matcher.model
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to pre-load roadmap embedding model: {e}")
    yield

app = FastAPI(title="M5 Roadmap Service", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    response = StandardResponse(
        success=False,
        data={},
        error=str(exc)
    )
    return JSONResponse(
        status_code=500,
        content=response.model_dump()
    )

app.include_router(roadmap.router, prefix="/run", tags=["Roadmap"])
app.include_router(progress.router, prefix="/run", tags=["Progress"])
app.include_router(notify.router, prefix="/run", tags=["Notifications"])
app.include_router(explain.router, prefix="/run", tags=["Explainability"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "m5_roadmap", "version": "1.0.0"}
