from fastapi import APIRouter
from schemas import ExplainRequest, StandardResponse
from core.skill_mentor_config import default_config
from core.skill_mentor_data_loaders import DataLoader
from core.skill_mentor_l5_explainability import ExplainabilityLLM

router = APIRouter()

COURSES = []

@router.post("/explain", response_model=StandardResponse)
def generate_explanations(req: ExplainRequest):
    global COURSES
    if not COURSES:
        loader = DataLoader(default_config)
        data = loader.load_all()
        COURSES = data.get("courses", [])

    explainer = ExplainabilityLLM(default_config)
    
    dummy_roadmap = {"user": req.user_id}
    gaps_stub = [{"skill": req.skill}]
    
    # Generate all explanations wrapper method
    explanations = explainer.generate_all_explanations(
        roadmap=dummy_roadmap,
        gaps=gaps_stub,
        all_courses=COURSES
    )
    
    skill_exp = ""
    skill_explanations = explanations.get("skill_explanations", [])
    if skill_explanations:
        skill_exp = skill_explanations[0].get("explanation", "")
        
    fallback_used = not explainer._check_api()
    
    data = {
        "why_skill": skill_exp if skill_exp else f"Important skill for {req.user_id} to acquire.",
        "why_course": f"{req.course_title} is highly recommended with a match score of {req.match_score} and market frequency {req.market_freq}.",
        "fallback_used": fallback_used
    }
    
    return StandardResponse(success=True, data=data, error=None)
