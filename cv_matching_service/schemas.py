from pydantic import BaseModel
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
