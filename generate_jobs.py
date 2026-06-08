import pandas as pd
import numpy as np
import os

titles = ["Software Engineer", "Senior Backend Developer", "Data Scientist", "Frontend Engineer", "Machine Learning Engineer", "DevOps Engineer", "Full Stack Developer"]
skills_pool = ["Python", "Java", "C++", "JavaScript", "React", "Node.js", "Django", "Flask", "AWS", "Docker", "Kubernetes", "SQL", "PostgreSQL", "Machine Learning", "TensorFlow", "PyTorch", "Git", "CI/CD"]

jobs = []
for i in range(1000):
    title = np.random.choice(titles)
    # Give each job 3-7 required skills
    num_skills = np.random.randint(3, 8)
    job_skills = np.random.choice(skills_pool, size=num_skills, replace=False)
    
    desc = f"We are looking for a {title}. You must be proficient in {', '.join(job_skills)}. Additional experience is a plus."
    
    jobs.append({
        'job_title': title,
        'company_name': f"TechCorp {i}",
        'job_description': desc
    })

df = pd.DataFrame(jobs)
os.makedirs('artifacts', exist_ok=True)
df.to_pickle('artifacts/jobs.pkl')
print(f"Generated artifacts/jobs.pkl with {len(df)} jobs.")
