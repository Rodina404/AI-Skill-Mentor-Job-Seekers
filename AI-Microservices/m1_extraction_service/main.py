import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.extract import router as extract_router
from dotenv import load_dotenv
load_dotenv()

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="Resume Extraction API", version="1.0.0")

_ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]
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

# Mount the new router with the single POST /run endpoint
app.include_router(extract_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
