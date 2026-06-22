from fastapi import APIRouter, Depends
from schemas import ExplainRequest, StandardResponse
from services.config import default_config
from services.explainability_engine import ExplainabilityLLM
from dependencies import get_courses

router = APIRouter()

@router.post("/explain", response_model=StandardResponse)
def generate_explanations(
    req: ExplainRequest,
    courses=Depends(get_courses),
):
    explainer = ExplainabilityLLM(default_config)
    
    gap_dict = {
        "skill": req.skill,
        "gap_score": 1.0 - req.match_score,
        "similarity": req.match_score,
        "priority": "high",
        "market_freq": f"{req.market_freq * 100:.0f}%" if req.market_freq <= 1.0 else f"{req.market_freq}%",
        "best_match": "None",
    }
    
    course_dict = None
    for c in courses:
        if c.get("title", "").lower() == req.course_title.lower():
            course_dict = c
            break
            
    if not course_dict:
        course_dict = {
            "title": req.course_title,
            "platform": "Online Course",
            "rating": 4.5,
            "reviews": 1000,
            "hours": 15.0,
            "skills_taught": [req.skill],
            "url": "",
        }
        
    explanation = explainer.explain_gap(gap_dict, course_dict)
    
    fallback_used = not explainer.api_available
    
    data = {
        "why_skill": explanation.get("skill_explanation", f"'{req.skill}' is a critical skill for your target role."),
        "why_course": explanation.get("course_explanation", f"'{req.course_title}' is recommended to bridge your gap in '{req.skill}'."),
        "fallback_used": fallback_used
    }
    
    return StandardResponse(success=True, data=data, error=None)

