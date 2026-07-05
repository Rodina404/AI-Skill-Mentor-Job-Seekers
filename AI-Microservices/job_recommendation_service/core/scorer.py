import re
import logging
from fuzzywuzzy import fuzz

logger = logging.getLogger(__name__)

# Config thresholds
SKILL_MATCH_THRESHOLD = 80

# Vocabulary for parsing required skills/tools from job postings
SKILL_VOCABULARY = {
    'python': ['python', 'py', 'django', 'flask', 'fastapi'],
    'java': ['java', 'spring', 'gradle', 'maven'],
    'javascript': ['javascript', 'js', 'typescript', 'node.js', 'nodejs', 'npm'],
    'c++': ['c++', 'cpp', 'c\\+\\+'],
    'c#': ['c#', 'csharp', 'c\\#'],
    'sql': ['sql', 'plsql', 'tsql', 'mysql', 'postgresql', 'postgres'],
    'r': [r'\br\b', 'r programming', 'rstudio'],
    'go': ['golang', 'go'],
    'rust': ['rust'],
    'ruby': ['ruby', 'rails'],
    
    'machine learning': ['machine learning', 'ml(?!\\s*engineer)', 'supervised learning', 'unsupervised learning'],
    'deep learning': ['deep learning', 'dl(?!\\s*model)', 'neural network', 'cnn', 'rnn', 'lstm'],
    'data science': ['data science', 'data scientist'],
    'ai': ['artificial intelligence', 'ai(?!\\s*model)'],
    'nlp': ['nlp', 'natural language processing', 'text processing'],
    'computer vision': ['computer vision', 'cv(?!\\s*application)', 'image processing'],
    'reinforcement learning': ['reinforcement learning', 'rl(?!\\s*network)'],
    'statistics': ['statistics', 'statistical analysis', 'statistical modeling'],
    'data analysis': ['data analysis', 'analytical', 'data insights'],
    'data engineering': ['data engineering', 'data engineer', 'etl'],
    
    'web development': ['web development', 'web developer'],
    'frontend': ['frontend', 'front-end', 'ui development'],
    'backend': ['backend', 'back-end', 'server-side'],
    'fullstack': ['fullstack', 'full-stack', 'full stack'],
    'rest api': ['rest api', 'restful', 'api development'],
    'graphql': ['graphql'],
    
    'devops': ['devops', 'dev ops', 'infrastructure'],
    'cloud computing': ['cloud computing', 'cloud platform'],
    'aws': ['aws', 'amazon web services'],
    'gcp': ['gcp', 'google cloud', 'cloud platform'],
    'azure': ['azure', 'microsoft azure'],
    'kubernetes': ['kubernetes', 'k8s'],
    'docker': ['docker', 'containerization'],
    'ci/cd': ['ci/cd', 'continuous integration', 'continuous deployment'],
}

TOOLS_VOCABULARY = {
    'tensorflow': ['tensorflow', 'tf'],
    'pytorch': ['pytorch', 'torch'],
    'scikit-learn': ['scikit-learn', 'sklearn'],
    'keras': ['keras'],
    'pandas': ['pandas'],
    'numpy': ['numpy', 'np'],
    'matplotlib': ['matplotlib', 'pyplot'],
    'seaborn': ['seaborn'],
    'plotly': ['plotly'],
    'django': ['django'],
    'flask': ['flask'],
    'fastapi': ['fastapi'],
    'spring boot': ['spring boot', 'springframework'],
    'postgresql': ['postgresql', 'postgres'],
    'mongodb': ['mongodb', 'mongo'],
    'mysql': ['mysql'],
    'redis': ['redis'],
    'elasticsearch': ['elasticsearch'],
    'git': ['git', 'github', 'gitlab'],
    'docker': ['docker', 'dockerfile'],
    'kubernetes': ['kubernetes', 'k8s', 'helm'],
    'jenkins': ['jenkins', 'ci/cd'],
    'apache spark': ['spark', 'pyspark', 'apache spark'],
    'hadoop': ['hadoop', 'hdfs'],
    'kafka': ['kafka', 'apache kafka'],
    'airflow': ['airflow', 'dag'],
    'transformers': ['transformers', 'huggingface', 'hf'],
    'nltk': ['nltk'],
    'spacy': ['spacy'],
    'opencv': ['opencv', 'cv2'],
    'yolo': ['yolo', 'object detection'],
    'tableau': ['tableau'],
    'power bi': ['power bi', 'powerbi'],
    'dbt': ['dbt', 'data build tool'],
    'snowflake': ['snowflake'],
    'bigquery': ['bigquery', 'bq'],
}

def _is_negated(job_text: str, pos: int, window: int = 60) -> bool:
    """Check if a word/skill mention is in a negative context."""
    start = max(0, pos - window)
    context = job_text[start:pos].lower()
    negation_patterns = [
        r'no\s+',
        r'without\s+',
        r'not\s+required',
        r'don\'t\s+need',
        r'doesn\'t\s+require',
        r'not\s+necessary',
        r'not\s+critical',
    ]
    for pattern in negation_patterns:
        if re.search(pattern, context):
            return True
    return False

def extract_skills_from_job(job_text: str) -> list:
    """Extract required skills and tools from job text."""
    found_skills = []
    seen = set()
    job_text_lower = job_text.lower()
    
    # Extract skills
    for skill_name, aliases in SKILL_VOCABULARY.items():
        for alias in aliases:
            try:
                pattern = rf'\b{alias}\b'
                for match in re.finditer(pattern, job_text_lower, re.IGNORECASE):
                    if not _is_negated(job_text_lower, match.start()):
                        normalized = skill_name.title()
                        if skill_name == 'c++': normalized = 'C++'
                        elif skill_name == 'c#': normalized = 'C#'
                        elif skill_name == 'nlp': normalized = 'NLP'
                        elif skill_name == 'ai': normalized = 'AI'
                        
                        if normalized not in seen:
                            found_skills.append(normalized)
                            seen.add(normalized)
                        break
            except re.error:
                continue
                
    # Extract tools
    for tool_name, aliases in TOOLS_VOCABULARY.items():
        for alias in aliases:
            try:
                pattern = rf'\b{alias}\b'
                for match in re.finditer(pattern, job_text_lower, re.IGNORECASE):
                    if not _is_negated(job_text_lower, match.start()):
                        normalized = ' '.join(word.capitalize() for word in tool_name.split())
                        if normalized not in seen:
                            found_skills.append(normalized)
                            seen.add(normalized)
                        break
            except re.error:
                continue
                
    return found_skills

def get_experience_fit(user_experience: int, job_text: str) -> float:
    """Determine experience fit score based on job description keywords/requirements."""
    patterns = [
        r'(\d+)\+?\s*(?:to\s+\d+)?\s*years?\s+(?:of\s+)?experience',
        r'(\d+)\+?\s*years?\s+(?:in|with)',
        r'(?:minimum|at\s+least|required)\s+(\d+)\s*years?',
    ]
    req_exp = None
    for pattern in patterns:
        match = re.search(pattern, job_text, re.IGNORECASE)
        if match:
            req_exp = int(match.group(1))
            break
            
    if req_exp is None:
        text_lower = job_text.lower()
        if any(w in text_lower for w in ["senior", "sr.", "lead", "principal", "director", "manager", "head"]):
            req_exp = 5
        elif any(w in text_lower for w in ["junior", "jr.", "entry", "intern", "graduate", "apprentice"]):
            req_exp = 1
        else:
            req_exp = 2  # default baseline
            
    if req_exp == 0:
        return 1.0
        
    return min(user_experience / req_exp, 1.0)

def get_location_match_bonus(user_location: str, job: dict) -> float:
    """Calculate location match score/bonus."""
    if not user_location:
        return 0.0
        
    loc = job.get("location")
    job_location_str = ""
    if isinstance(loc, dict):
        job_location_str = loc.get("display_name", "")
    elif isinstance(loc, str):
        job_location_str = loc
        
    user_loc_lower = user_location.lower().strip()
    job_loc_lower = job_location_str.lower().strip()
    job_desc_lower = job.get("description", "").lower()
    job_title_lower = job.get("title", "").lower()
    
    is_user_remote = "remote" in user_loc_lower or "work from home" in user_loc_lower or "wfh" in user_loc_lower
    is_job_remote = "remote" in job_loc_lower or "remote" in job_title_lower or "remote" in job_desc_lower
    
    if is_user_remote and is_job_remote:
        return 1.0
        
    if not job_loc_lower:
        return 0.0
        
    if user_loc_lower in job_loc_lower or job_loc_lower in user_loc_lower:
        return 1.0
        
    user_tokens = set(re.findall(r'\w+', user_loc_lower))
    job_tokens = set(re.findall(r'\w+', job_loc_lower))
    common = user_tokens.intersection(job_tokens)
    if common:
        return 0.5
        
    return 0.0

def score_job(user_profile: dict, job: dict) -> dict:
    """
    Score a job posting against a user profile.
    
    Args:
        user_profile: Dict with keys 'skills', 'experience_years', 'education', 'location'.
        job: Dict with keys 'title', 'description', 'company', 'location', etc.
        
    Returns:
        Dict containing the score (0-1), breakdown, and dynamic explanation.
    """
    job_text = f"{job.get('title', '')} {job.get('description', '')}"
    
    # 1. Skill overlap
    required_skills = extract_skills_from_job(job_text)
    user_skills = user_profile.get("skills", [])
    
    matching_skills = []
    missing_skills = []
    for req_skill in required_skills:
        found = False
        for cand_skill in user_skills:
            if fuzz.partial_ratio(req_skill.lower(), cand_skill.lower()) > SKILL_MATCH_THRESHOLD:
                if req_skill not in matching_skills:
                    matching_skills.append(req_skill)
                found = True
                break
        if not found and req_skill not in missing_skills:
            missing_skills.append(req_skill)
            
    total_required = len(required_skills)
    skills_match_score = len(matching_skills) / max(total_required, 1) if total_required > 0 else 1.0
    
    # 2. Experience level fit
    user_exp = user_profile.get("experience_years", 0) or 0
    experience_fit_score = get_experience_fit(user_exp, job_text)
    
    # 3. Location match bonus
    user_loc = user_profile.get("location", "")
    location_match_score = get_location_match_bonus(user_loc, job)
    
    # Combine scores (60% skills, 30% experience, 10% location)
    score = 0.6 * skills_match_score + 0.3 * experience_fit_score + 0.1 * location_match_score
    score = round(min(max(score, 0.0), 1.0), 4)
    
    breakdown = {
        "skills_match": round(skills_match_score, 2),
        "experience_fit": round(experience_fit_score, 2),
        "location_match": round(location_match_score, 2),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "total_required_skills": total_required
    }
    
    # Build explanation dynamically
    explanation_parts = []
    if required_skills:
        explanation_parts.append(
            f"Matches {len(matching_skills)} of {total_required} required skills: {', '.join(matching_skills)}"
            if matching_skills else f"Missing required skills: {', '.join(missing_skills[:3])}"
        )
    else:
        explanation_parts.append("Matches general profile skills")
        
    if experience_fit_score > 0.8:
        explanation_parts.append("strong experience fit")
    elif experience_fit_score > 0.4:
        explanation_parts.append("moderate experience fit")
    else:
        explanation_parts.append("low experience fit")
        
    if location_match_score > 0.8:
        explanation_parts.append("perfect location match")
    elif location_match_score > 0.4:
        explanation_parts.append("partial location match")
        
    explanation = ", ".join(explanation_parts) + "."
    explanation = explanation[0].upper() + explanation[1:]
    
    return {
        "score": score,
        "breakdown": breakdown,
        "explanation": explanation
    }
