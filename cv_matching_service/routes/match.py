from fastapi import APIRouter
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
            cands = [c.model_dump() for c in request.candidates]
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
