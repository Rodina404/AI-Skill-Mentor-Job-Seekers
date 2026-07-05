"""
main.py - FastAPI application for GradRAG.

Creates FastAPI app with auto-documentation, configures CORS,
registers endpoint routers, handles request/response validation.

Configuration:
  Host: 0.0.0.0 (all interfaces)
  Port: 8003 (default)
  Reload: True in dev mode
  CORS: http://localhost:3000 + ALLOWED_ORIGIN env var

Access:
  Interactive Docs: http://localhost:8003/docs  (Swagger UI)
  Alternative Docs: http://localhost:8003/redoc (ReDoc)
  Root Endpoint:    http://localhost:8003/
"""

import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(override=True)

from api.routes import health, role_gap
from contextlib import asynccontextmanager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load resources on startup
    try:
        from src.loaders import pre_load_resources
        pre_load_resources()
    except Exception as e:
        logger.error(f"Failed to pre-load resources on startup: {e}")
    yield

app = FastAPI(
    title="GradRAG API",
    description="Role-skill enrichment pipeline for technical job titles. "
                "Combines fast local lookup with RAG-powered fallback.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# --- CORS ---
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
extra_origin = os.getenv("ALLOWED_ORIGIN")
if extra_origin:
    allowed_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(health.router)
app.include_router(role_gap.router)


@app.get("/", tags=["Root"])
async def root():
    """Simple root status endpoint required by the user."""
    return {"status": "running", "project": "GradRAG"}
