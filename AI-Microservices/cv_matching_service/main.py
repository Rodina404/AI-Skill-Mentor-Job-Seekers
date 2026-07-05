from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import match, health
import os
from dotenv import load_dotenv

load_dotenv()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load CV matcher model
    try:
        from core.vector_store import pre_load_model
        pre_load_model()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to pre-load CV matcher model: {e}")
    yield

app = FastAPI(title="CV Matching & Job Scoring Service", version="1.0.0", lifespan=lifespan)

allowed_origin = os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(match.router)
