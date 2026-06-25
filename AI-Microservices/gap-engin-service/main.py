"""
main.py - FastAPI application for the Gap Engine (GradRAG).

Combines fast local lookup (Mode A) with RAG-powered fallback (Mode B)
to identify required skills and readiness score for any job title.

Access:
  Docs:   http://localhost:8004/docs
  Health: http://localhost:8004/health
"""

import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(override=True)

from routes import health, role_gap

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="Gap Engine Service",
    description="Role-skill enrichment pipeline for technical job titles. "
                "Combines fast local lookup with RAG-powered fallback.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# --- CORS ---
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8001",   # Extraction service
    "http://localhost:8002",   # Normalization service
    "http://localhost:8004",   # This service (alt port)
    "http://localhost:5500",   # VS Code Live Server
    "http://127.0.0.1:5500",  # VS Code Live Server (alt)
    "http://localhost:8080",   # Generic dev server
    "null",                    # file:// opened directly in browser
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
    """Simple root status endpoint."""
    return {"status": "running", "service": "gap-engine", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8004"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
