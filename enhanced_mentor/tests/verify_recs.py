import os
import sys
# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from enhanced_mentor.recommender import ProfessionalRecommender
from enhanced_mentor.skill_processor import SkillProcessor

def main():
    print("INITIALIZING ENHANCED RECOMMENDER")
    recommender = ProfessionalRecommender()
    
    # 1. Test Job Recommendations
    profile = "Expert Python developer with experience in AWS and Docker."
    print(f"\n[JOB RECOMMENDATIONS] for: '{profile}'")
    jobs = recommender.recommend_jobs(profile, top_n=3)
    
    if not jobs:
        print("X No jobs found. Check if artifacts/jobs.index and jobs.pkl exist.")
    else:
        for i, j in enumerate(jobs):
            print(f"{i+1}. {j['job_title']} @ {j['company']}")
            print(f"   Readiness: {int(j['readiness_score']*100)}% | Hybrid Score: {j['hybrid_score']}")
            print(f"   Matched: {', '.join(j['matched_skills'])}")
            print(f"   Missing: {', '.join(j['missing_skills'])}")
    
    # 2. Test Course Recommendations
    user_skills = ["Python", "SQL"]
    target_job_skills = ["Python", "SQL", "Docker", "AWS"]
    print(f"\n[COURSE RECOMMENDATIONS] to bridge gap: {target_job_skills}")
    courses = recommender.recommend_courses(user_skills, target_job_skills, top_n=3)
    
    if not courses:
        print("X No courses found. Check if artifacts/courses.index exists.")
    else:
        for i, c in enumerate(courses):
            print(f"{i+1}. {c['title']} ({c['provider']})")
            print(f"   Score: {c['score']} | Level: {c['level']}")

if __name__ == "__main__":
    main()
