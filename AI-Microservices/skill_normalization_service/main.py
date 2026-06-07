"""
Main FastAPI Application - Skill Normalization & User Profile Building Service.

Startup: Loads data files, initializes pipeline, validates config.
Routes: Registered from routes/ module.
Exception handling: All errors converted to standard JSON responses.
CORS: Allows localhost:3000 (Node.js frontend).
"""

import logging
import json
import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from schemas import ErrorResponse, HealthResponse
from core.pipeline import SkillNormalizationPipeline
from core.embedding_engine import compute_embeddings
from routes import health, run

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# STARTUP & SHUTDOWN
# ============================================================================

async def startup_event():
    """
    Initialize service on startup.
    
    - Load skills.json and rules.json
    - Compute embeddings for L3 layer (optional, not required for L1 operation)
    - Initialize pipeline
    - Register in routes
    """
    try:
        logger.info("Starting Skill Normalization Service...")
        
        # Get data directory (adjacent to this file)
        data_dir = Path(__file__).parent / 'data'
        
        # Load canonical skills database
        skills_file = data_dir / 'skills.json'
        if not skills_file.exists():
            raise FileNotFoundError(f"skills.json not found at {skills_file}")
        
        with open(skills_file) as f:
            skills_list = json.load(f)
        
        # Convert to dictionary for efficient lookup {skillId: {name, ...}}
        skills_db = {}
        for skill in skills_list:
            if isinstance(skill, dict) and 'id' in skill:
                skills_db[skill['id']] = skill
        
        logger.info(f"✓ Loaded {len(skills_db)} canonical skills")
        
        # Load L1 rule mappings
        rules_file = data_dir / 'rules.json'
        if not rules_file.exists():
            raise FileNotFoundError(f"rules.json not found at {rules_file}")
        
        with open(rules_file) as f:
            rules = json.load(f)
        logger.info(f"✓ Loaded {len(rules)} L1 rule mappings")
        
        # Compute embeddings for L3 (optional - service works without them)
        logger.info("Computing skill embeddings for L3 layer...")
        try:
            skill_embeddings = compute_embeddings(skills_db)
            if skill_embeddings:
                logger.info(f"✓ Computed embeddings for {len(skill_embeddings)} skills")
            else:
                logger.warning("⚠ No embeddings computed - using L1 rules only")
                skill_embeddings = {}
        except Exception as e:
            logger.warning(f"⚠ Could not compute embeddings: {str(e)} - using L1 rules only")
            skill_embeddings = {}
        
        # Initialize pipeline
        pipeline = SkillNormalizationPipeline(skills_db, rules, skill_embeddings)
        run.set_pipeline(pipeline)
        logger.info("✓ Pipeline initialized and ready")
        
        logger.info("✓ Service startup complete")
        
    except Exception as e:
        logger.error(f"✗ Startup failed: {str(e)}", exc_info=True)
        raise


async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Service shutdown")


# ============================================================================
# FastAPI Application
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    await startup_event()
    yield
    await shutdown_event()


app = FastAPI(
    title="Skill Normalization & User Profile Building",
    description="Normalizes raw skill data through a 4-layer intelligent pipeline",
    version="1.0.0",
    lifespan=lifespan
)

# ============================================================================
# MIDDLEWARE - CORS
# ============================================================================

allowed_origins = [
    "http://localhost:3000",  # Node.js frontend
    "http://localhost:8003",  # This service
]

# Add custom allowed origin from .env
custom_origin = os.getenv("ALLOWED_ORIGIN", "").strip()
if custom_origin and custom_origin not in allowed_origins:
    allowed_origins.append(custom_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"CORS enabled for origins: {allowed_origins}")

# ============================================================================
# EXCEPTION HANDLERS
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Catch-all exception handler.
    
    Converts all exceptions to standard error JSON response (never raw traceback).
    """
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    error_response = ErrorResponse(
        success=False,
        error={
            'code': 'INTERNAL_SERVER_ERROR',
            'message': 'An unexpected error occurred'
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.dict()
    )


# ============================================================================
# ROUTES
# ============================================================================

# Health check
app.include_router(health.router, tags=["Health"])

# Skill normalization
app.include_router(run.router, tags=["Normalization"])

# ============================================================================
# STARTUP
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv('SERVICE_PORT', 8003))
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=os.getenv('ENV', 'development') == 'development'
    )
