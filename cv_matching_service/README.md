# CV Matching & Job Scoring Service

Matches pre-processed CVs against job descriptions using LangChain, semantic search (FAISS Vector Store), and hybrid scoring logic to return a ranked list of best-fit candidates.

## Installation
pip install -r requirements.txt

## Run
uvicorn main:app --host 0.0.0.0 --port 8004 --reload

## Endpoints
- GET /health
- POST /match
