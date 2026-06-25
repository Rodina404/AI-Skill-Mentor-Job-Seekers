import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.extract import router as extract_router
from routes.health import router as health_router

load_dotenv()

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="CV Extraction Service",
    description="Extracts structured resume data (skills, experience, education) from PDF/DOCX/TXT files using LLM.",
    version="1.0.0",
)

_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080",
    "http://localhost:8000",
    "http://localhost:9000",
]
_PROD_ORIGIN = os.getenv("ALLOWED_ORIGIN", "")
if _PROD_ORIGIN:
    _ALLOWED_ORIGINS.append(_PROD_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(extract_router)

# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
