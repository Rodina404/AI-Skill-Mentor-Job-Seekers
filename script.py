import os
import shutil

base_dir = r"d:\ai_skill_mentor\4th year\Graduation\AI-Skill-Mentor-Job-Seekers\cv_matching_service"
os.makedirs(base_dir, exist_ok=True)
os.makedirs(os.path.join(base_dir, "routes"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "core"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "utils"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "data"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "tests"), exist_ok=True)

# Copy data/candidates.py
src_candidates = r"d:\ai_skill_mentor\4th year\Graduation\AI-Skill-Mentor-Job-Seekers\cv-matching-system\data\candidates.py"
shutil.copy(src_candidates, os.path.join(base_dir, "data", "candidates.py"))

with open(os.path.join(base_dir, "main.py"), "w", encoding='utf-8') as f:
    f.write('''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import match, health
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CV Matching & Job Scoring Service", version="1.0.0")

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
''')

with open(os.path.join(base_dir, "schemas.py"), "w", encoding='utf-8') as f:
    f.write('''from pydantic import BaseModel
from typing import List, Optional, Any

class CandidateInput(BaseModel):
    candidateId: str
    name: str
    skills: List[str]
    experience: float
    education: Optional[str] = None

class MatchRequest(BaseModel):
    jobId: str
    jobDescription: str
    candidates: Optional[List[CandidateInput]] = None

class RankedCandidate(BaseModel):
    name: str
    score: float
    experience: float
    skills: List[str]
    matching_skills: List[str]
    missing_skills: List[str]
    skill_match_count: int
    skill_total_required: int

class MatchData(BaseModel):
    jobId: str
    rankedCandidates: List[RankedCandidate]

class MatchMeta(BaseModel):
    processingTimeMs: int

class MatchResponse(BaseModel):
    success: bool
    data: Optional[MatchData] = None
    meta: Optional[MatchMeta] = None
    error: Optional[dict] = None
''')

with open(os.path.join(base_dir, "routes", "__init__.py"), "w") as f:
    f.write("")

with open(os.path.join(base_dir, "routes", "health.py"), "w", encoding='utf-8') as f:
    f.write('''from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def get_health():
    return {
        "status": "ok",
        "service": "CV Matching & Job Scoring Service",
        "version": "1.0.0"
    }
''')

with open(os.path.join(base_dir, "routes", "match.py"), "w", encoding='utf-8') as f:
    f.write('''from fastapi import APIRouter
from schemas import MatchRequest, MatchResponse, MatchData, RankedCandidate, MatchMeta
from core.matcher import match_candidates
import time
import logging
from data.candidates import candidates as fallback_candidates

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/match", response_model=MatchResponse)
def run_match(request: MatchRequest):
    start_time = time.time()
    try:
        if request.candidates:
            cands = [c.dict() for c in request.candidates]
        else:
            cands = fallback_candidates
            
        ranked = match_candidates(request.jobDescription, cands)
        
        return MatchResponse(
            success=True,
            data=MatchData(
                jobId=request.jobId,
                rankedCandidates=[RankedCandidate(**rc) for rc in ranked]
            ),
            meta=MatchMeta(processingTimeMs=int((time.time() - start_time) * 1000))
        )
    except Exception as e:
        logger.error(f"Error matching candidates: {e}")
        return MatchResponse(
            success=False,
            error={
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(e)
            }
        )
''')

with open(os.path.join(base_dir, "core", "__init__.py"), "w") as f:
    f.write("")

with open(os.path.join(base_dir, "core", "matcher.py"), "w", encoding='utf-8') as f:
    f.write('''import logging
from utils.helpers import candidate_to_text
from core.vector_store import build_vector_store
from core.scorer import compute_score_detailed
from core.job_parser import parse_job

logger = logging.getLogger(__name__)

def match_candidates(job_text, candidates):
    logger.info(f"Matching {len(candidates)} candidates against job description")
    
    if not candidates:
        logger.warning("No candidates provided for matching")
        return []
        
    job_requirements = parse_job(job_text)
    texts = [candidate_to_text(c) for c in candidates]
    vector_db = build_vector_store(texts, candidates)
    
    docs = vector_db.similarity_search_with_score(job_text, k=len(candidates))
    results = []
    for doc, similarity_score in docs:
        candidate = doc.metadata
        score_detail = compute_score_detailed(job_text, candidate, similarity_score)
        results.append({
            "name": candidate.get("name", "Unknown"),
            "score": score_detail["score"],
            "experience": candidate.get("experience", 0),
            "skills": candidate.get("skills", []),
            "matching_skills": score_detail["matching_skills"],
            "missing_skills": score_detail["missing_skills"],
            "skill_match_count": score_detail["skill_match_count"],
            "skill_total_required": score_detail["skill_total_required"]
        })
    return sorted(results, key=lambda x: x["score"], reverse=True)
''')

with open(os.path.join(base_dir, "core", "scorer.py"), "w", encoding='utf-8') as f:
    f.write('''from fuzzywuzzy import fuzz
import core.config as config
import logging
import time

try:
    from core.job_parser_transformer import parse_job_hybrid
    PARSER_FN = lambda text: parse_job_hybrid(text, use_transformer=True)
except ImportError:
    from core.job_parser import parse_job
    PARSER_FN = lambda text: parse_job(text)

logger = logging.getLogger(__name__)

def compute_score_detailed(job_text, candidate, semantic_similarity=0.5):
    job_req = PARSER_FN(job_text)
    required_skills = job_req.get('skills', [])
    job_text_lower = job_text.lower()
    
    matching_skills = []
    missing_skills = []
    for req_skill in required_skills:
        found = False
        for cand_skill in candidate.get("skills", []):
            if fuzz.partial_ratio(req_skill.lower(), cand_skill.lower()) > config.SKILL_MATCH_THRESHOLD:
                if req_skill not in matching_skills:
                    matching_skills.append(req_skill)
                found = True
                break
        if not found and req_skill not in missing_skills:
            missing_skills.append(req_skill)
            
    total_required = len(required_skills) if required_skills else 1
    skill_score = len(matching_skills) / max(total_required, 1)
    
    experience_required = config.EXPERIENCE_BASELINE
    experience_score = min(candidate.get("experience", 0) / max(experience_required, 1), 1.0)
    
    tools_matches = 0
    for tool in candidate.get("tools", []):
        if any(fuzz.partial_ratio(tool.lower(), word) > config.TOOL_MATCH_THRESHOLD 
               for word in job_text_lower.split()):
            tools_matches += 1
    
    tools_score = (tools_matches / max(len(candidate.get("tools", [])), 1)) if candidate.get("tools") else 0
    semantic_score = min(semantic_similarity * 2, 1.0)
    
    weights = config.SCORING_WEIGHTS
    final_score = (
        semantic_score * weights["semantic_similarity"] +
        skill_score * weights["skill_match"] +
        tools_score * weights["tools_match"] +
        experience_score * weights["experience"]
    )
    
    return {
        "score": round(final_score * 100, 2),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "skill_match_count": len(matching_skills),
        "skill_total_required": total_required
    }
''')

# Now writing job_parser.py by copying the content but updating imports
src_job_parser = r"d:\ai_skill_mentor\4th year\Graduation\AI-Skill-Mentor-Job-Seekers\cv-matching-system\services\job_parser.py"
shutil.copy(src_job_parser, os.path.join(base_dir, "core", "job_parser.py"))

with open(os.path.join(base_dir, "core", "vector_store.py"), "w", encoding='utf-8') as f:
    f.write('''import logging
import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import core.config as config

logger = logging.getLogger(__name__)

def get_embeddings():
    try:
        return HuggingFaceEmbeddings(model_name=config.EMBEDDING_MODEL)
    except Exception as e:
        logger.error(f"Failed to load embeddings model: {str(e)}")
        raise

def build_vector_store(texts, metadatas, rebuild=False):
    if not texts:
        return None
        
    store_path = config.VECTOR_STORE_PATH
    if config.VECTOR_STORE_PERSIST and not rebuild and os.path.exists(store_path):
        try:
            embeddings = get_embeddings()
            return FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)
        except Exception as e:
            logger.warning(f"Failed to load vector store: {e}")
            
    embeddings = get_embeddings()
    vector_store = FAISS.from_texts(texts, embeddings, metadatas=metadatas)
    
    if config.VECTOR_STORE_PERSIST:
        try:
            os.makedirs(store_path, exist_ok=True)
            vector_store.save_local(store_path)
        except Exception as e:
            logger.warning(str(e))
            
    return vector_store
''')

with open(os.path.join(base_dir, "core", "config.py"), "w", encoding='utf-8') as f:
    f.write('''import os
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
VECTOR_STORE_PATH = ".vector_store"
VECTOR_STORE_PERSIST = False

SCORING_WEIGHTS = {
    "semantic_similarity": 0.40,
    "skill_match": 0.35,
    "tools_match": 0.15,
    "experience": 0.10
}

SKILL_MATCH_THRESHOLD = 80
TOOL_MATCH_THRESHOLD = 75
EXPERIENCE_BASELINE = 2
''')

with open(os.path.join(base_dir, "utils", "__init__.py"), "w") as f:
    f.write("")

src_helpers = r"d:\ai_skill_mentor\4th year\Graduation\AI-Skill-Mentor-Job-Seekers\cv-matching-system\utils\helpers.py"
shutil.copy(src_helpers, os.path.join(base_dir, "utils", "helpers.py"))

with open(os.path.join(base_dir, "tests", "__init__.py"), "w") as f:
    f.write("")

with open(os.path.join(base_dir, "tests", "conftest.py"), "w", encoding='utf-8') as f:
    f.write('''import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
''')

with open(os.path.join(base_dir, "tests", "test_service.py"), "w", encoding='utf-8') as f:
    f.write('''def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_match(client):
    req = {
        "jobId": "J123",
        "jobDescription": "Looking for a Python backend engineer with FastAPI.",
        "candidates": [{
            "candidateId": "C123",
            "name": "Jane",
            "skills": ["Python", "FastAPI"],
            "experience": 4,
            "education": "BSc SC"
        }]
    }
    response = client.post("/match", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["jobId"] == "J123"
    assert len(data["data"]["rankedCandidates"]) == 1
    assert data["data"]["rankedCandidates"][0]["name"] == "Jane"
''')

with open(os.path.join(base_dir, ".env.example"), "w", encoding='utf-8') as f:
    f.write('''ALLOWED_ORIGIN=http://localhost:3000
PORT=8004
''')

with open(os.path.join(base_dir, "requirements.txt"), "w", encoding='utf-8') as f:
    f.write('''fastapi
uvicorn[standard]
python-dotenv
pydantic
langchain
langchain_community
faiss-cpu
sentence-transformers
scikit-learn
pytest
fuzzywuzzy
''')

with open(os.path.join(base_dir, "README.md"), "w", encoding='utf-8') as f:
    f.write('''# CV Matching & Job Scoring Service

Matches pre-processed CVs against job descriptions using LangChain, semantic search (FAISS Vector Store), and hybrid scoring logic to return a ranked list of best-fit candidates.

## Installation
pip install -r requirements.txt

## Run
uvicorn main:app --host 0.0.0.0 --port 8004 --reload

## Endpoints
- GET /health
- POST /match
''')

with open(os.path.join(base_dir, "start.sh"), "w", encoding='utf-8') as f:
    f.write('''#!/bin/bash
uvicorn main:app --host 0.0.0.0 --port 8004 --reload
''')

import stat
os.chmod(os.path.join(base_dir, "start.sh"), os.stat(os.path.join(base_dir, "start.sh")).st_mode | stat.S_IEXEC)
print("Done")