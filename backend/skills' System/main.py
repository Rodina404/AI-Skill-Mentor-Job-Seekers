import json

from modules.pdf_reader import extract_text_from_pdf
from modules.skill_extractor import extract_skills_from_text
from modules.info_extractor import extract_education, extract_experience
from modules.embedding_engine import compute_embeddings
from modules.normalizer import normalize_skills
from modules.profile_builder import build_user_profile

# load data
with open("skills.json") as f:
    skills_db = json.load(f)

with open("rules.json") as f:
    rules = json.load(f)

# embeddings
skill_embeddings = compute_embeddings(skills_db)

# read CV
text = extract_text_from_pdf("cv.pdf")

# extract
raw_skills = extract_skills_from_text(text, skills_db)
education = extract_education(text)
experience = extract_experience(text)

# normalize
normalized_skills = normalize_skills(
    raw_skills,
    skills_db,
    rules,
    skill_embeddings
)

# build profile
profile = build_user_profile(
    normalized_skills,
    education,
    experience
)

print(profile)