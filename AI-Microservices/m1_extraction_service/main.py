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

# CORS — allow React dev server and any configured production origin
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
