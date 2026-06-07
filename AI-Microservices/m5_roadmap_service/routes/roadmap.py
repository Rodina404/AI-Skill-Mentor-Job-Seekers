from fastapi import APIRouter
from schemas import RoadmapRequest, StandardResponse
from core.skill_mentor_config import default_config
from core.skill_mentor_data_loaders import DataLoader
from core.skill_mentor_l1_roadmap import RoadmapLogic
from core.skill_mentor_l2_svg import SVGGenerator

router = APIRouter()

COURSES = []
SKILL_HOURS = {}

@router.post("/roadmap", response_model=StandardResponse)
def generate_roadmap(req: RoadmapRequest):
    global COURSES, SKILL_HOURS
    if not COURSES:
        loader = DataLoader(default_config)
        data = loader.load_all()
        COURSES = data.get("courses", [])
        SKILL_HOURS = data.get("skill_hours", {})

    roadmap_logic = RoadmapLogic(default_config)
    
    missing_skills_dict = [{"skill": s, "priority": "high"} for s in req.missing_skills]
    constraints_dict = {
        "name": req.user_id,
        "hours_per_week": float(req.hours_per_week),
        "deadline_weeks": req.deadline_weeks,
        "job_title": req.job_title
    }

    roadmap = roadmap_logic.generate(
        missing_skills=missing_skills_dict,
        all_courses=COURSES,
        user_constraints=constraints_dict,
        skill_hours=SKILL_HOURS
    )
    
    svg_gen = SVGGenerator(default_config)
    timeline_svg = svg_gen.generate_timeline_svg(roadmap)
    cards_svg = svg_gen.generate_cards_svg(roadmap)
    
    data = {
        "roadmap": roadmap,
        "timeline_svg": timeline_svg,
        "cards_svg": cards_svg
    }
    
    return StandardResponse(success=True, data=data, error=None)
