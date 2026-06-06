import sys
sys.path.append(r'c:\Users\march\OneDrive\Desktop\ai_skill_mentor1')
from enhanced_mentor.api_v2 import router
from enhanced_mentor.recommender import ProfessionalRecommender
print('api_ok')
r = ProfessionalRecommender()
print('jobs', len(r.recommend_jobs('Python Data Science AWS', 2)))
print('courses', len(r.recommend_courses(['Python','AWS'], ['Docker','Kubernetes'], 2)))
