import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from routes import health, run, test_ui

app = FastAPI(
    title=os.getenv("APP_NAME", "m4_course_recommender"),
    version="1.0.0"
)

# Set up CORS
origins = [
    "http://localhost:3000",
]
env_origin = os.getenv("ALLOWED_ORIGIN")
if env_origin:
    origins.append(env_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler to ensure standard response
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "SERVER_ERROR",
                "message": str(exc)
            }
        }
    )

app.include_router(health.router)
app.include_router(run.router)
app.include_router(test_ui.router)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8004))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
