"""Top-level ASGI entry exposing `app` for `uvicorn main:app`.

This forwards to `api.main:app` so users can run `uvicorn main:app` from project root.
"""
from api.main import app  # re-export FastAPI app
