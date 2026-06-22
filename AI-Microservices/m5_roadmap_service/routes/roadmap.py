from fastapi import APIRouter, Depends
from schemas import RoadmapRequest, StandardResponse
from services.config import default_config
from services.roadmap_generator import RoadmapLogic
from services.svg_renderer import SVGGenerator
from dependencies import get_courses, get_skill_hours
from db.roadmap_repo import RoadmapRepository
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/roadmap", response_model=StandardResponse)
def generate_roadmap(
    req: RoadmapRequest,
    courses=Depends(get_courses),
    skill_hours=Depends(get_skill_hours)
):
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
        all_courses=courses,
        user_constraints=constraints_dict,
        skill_hours=skill_hours
    )

    # Enrich roadmap tasks with explanations
    try:
        from services.explainability_engine import ExplainabilityLLM
        explainer = ExplainabilityLLM(default_config)
        for week in roadmap.get("weeks", []):
            for task in week.get("tasks", []):
                if task.get("type") == "course_section":
                    skill = task.get("skill")
                    course_id = task.get("course_id")
                    course_dict = next((c for c in courses if c.get("id") == course_id), None)
                    if course_dict:
                        gap_dict = {
                            "skill": skill,
                            "gap_score": 0.8,
                            "similarity": 0.2,
                            "priority": "high",
                            "market_freq": "N/A",
                            "best_match": "None",
                        }
                        explanation = explainer.explain_gap(gap_dict, course_dict)
                        task["explanation"] = explanation.get("skill_explanation", "")
                        task["course_fit"] = explanation.get("course_explanation", "")
    except Exception as e:
        logger.warning(f"Failed to enrich roadmap: {e}")
    
    svg_gen = SVGGenerator(default_config)
    timeline_svg = svg_gen.generate_timeline_svg(roadmap)
    cards_svg = svg_gen.generate_cards_svg(roadmap)
    
    # Save to Supabase
    roadmap_id = None
    try:
        repo = RoadmapRepository()
        saved = repo.save_roadmap(
            user_id=req.user_id,
            resume_id=req.resume_id,
            job_id=req.job_id,
            roadmap_data={
                "roadmap": roadmap,
                "timeline_svg": timeline_svg,
                "cards_svg": cards_svg,
                "job_title": req.job_title,
                "missing_skills": req.missing_skills,
                "hours_per_week": req.hours_per_week,
                "deadline_weeks": req.deadline_weeks,
            },
            explanation=f"Roadmap for {req.job_title} covering {len(req.missing_skills)} skills",
        )
        roadmap_id = saved.get("id")
        logger.info(f"Saved roadmap {roadmap_id} for user {req.user_id}")
    except Exception as e:
        logger.warning(f"Failed to save roadmap to DB: {e}")
    
    data = {
        "roadmap_id": roadmap_id,
        "roadmap": roadmap,
        "timeline_svg": timeline_svg,
        "cards_svg": cards_svg
    }
    
    return StandardResponse(success=True, data=data, error=None)

