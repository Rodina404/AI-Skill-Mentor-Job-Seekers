
import sys
import os

# Add skill_gap_engine to path
sys.path.append(os.path.join(os.getcwd(), 'skill_gap_engine'))

from core.pipeline import run_recommendation_pipeline

missing_skills = [{"skill_id": "S_0", "skill_name": "Python"}]
user_constraints = {
    "level": "all",
    "language": "English",
    "hours_per_week": 5.0
}

try:
    print("Running pipeline...")
    results = run_recommendation_pipeline(missing_skills, user_constraints)
    print("Pipeline completed successfully.")
    print(f"Results: {len(results)} groups found.")
    for res in results:
        print(f"Skill: {res['skillName']}, Courses: {len(res['courses'])}")
except Exception as e:
    print(f"Error caught: {e}")
    import traceback
    traceback.print_exc()
