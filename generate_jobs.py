import pandas as pd
import numpy as np
import os

titles = ["Software Engineer", "Senior Backend Developer", "Data Scientist", "Frontend Engineer", "Machine Learning Engineer", "DevOps Engineer", "Full Stack Developer"]
skills_pool = ["Python", "Java", "C++", "JavaScript", "React", "Node.js", "Django", "Flask", "AWS", "Docker", "Kubernetes", "SQL", "PostgreSQL", "Machine Learning", "TensorFlow", "PyTorch", "Git", "CI/CD", "Azure", "GCP", "Ruby", "PHP"]

jobs = []
# Generate 900 random noise jobs
for i in range(900):
    title = np.random.choice(titles)
    num_skills = np.random.randint(2, 6)
    job_skills = np.random.choice(skills_pool, size=num_skills, replace=False)
    desc = f"Looking for a {title}. Required: {', '.join(job_skills)}."
    jobs.append({
        'job_title': title,
        'company_name': f"RandomCorp {i}",
        'job_description': desc
    })

# Generate 100 highly relevant "Golden" jobs for our test profile: 
# "Software Engineer", "Python", "Django", "PostgreSQL", "Docker", "AWS", "Git"
golden_skills = ["Python", "Django", "PostgreSQL", "Docker", "AWS", "Git"]
for i in range(100):
    num_skills = np.random.randint(4, 7)
    job_skills = np.random.choice(golden_skills, size=num_skills, replace=False)
    # Add 1-2 random skills
    extra_skills = np.random.choice(skills_pool, size=2, replace=False)
    final_skills = list(job_skills) + list(extra_skills)
    desc = f"We need a Senior Software Engineer. You must master {', '.join(final_skills)} to succeed here. Immediate hire."
    jobs.append({
        'job_title': "Software Engineer",
        'company_name': f"GoldenTech {i}",
        'job_description': desc
    })

df = pd.DataFrame(jobs)
# Shuffle
df = df.sample(frac=1).reset_index(drop=True)

os.makedirs('artifacts', exist_ok=True)
df.to_pickle('artifacts/jobs.pkl')
print(f"Generated artifacts/jobs.pkl with {len(df)} jobs (100 Golden).")
