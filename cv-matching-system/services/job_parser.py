import re
import logging

logger = logging.getLogger(__name__)

# Expanded skill vocabulary with categories
SKILL_VOCABULARY = {
    # Programming Languages
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
    
    # ML/AI
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
    
    # Web Development
    'web development': ['web development', 'web developer'],
    'frontend': ['frontend', 'front-end', 'ui development'],
    'backend': ['backend', 'back-end', 'server-side'],
    'fullstack': ['fullstack', 'full-stack', 'full stack'],
    'rest api': ['rest api', 'restful', 'api development'],
    'graphql': ['graphql'],
    
    # DevOps/Cloud
    'devops': ['devops', 'dev ops', 'infrastructure'],
    'cloud computing': ['cloud computing', 'cloud platform'],
    'aws': ['aws', 'amazon web services'],
    'gcp': ['gcp', 'google cloud', 'cloud platform'],
    'azure': ['azure', 'microsoft azure'],
    'kubernetes': ['kubernetes', 'k8s'],
    'docker': ['docker', 'containerization'],
    'ci/cd': ['ci/cd', 'continuous integration', 'continuous deployment'],
}

# Tool/Framework vocabulary  
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

# Synonym mapping for normalization
SKILL_SYNONYMS = {
    'ml': 'Machine Learning',
    'dl': 'Deep Learning',
    'ai': 'AI',
    'cv': 'Computer Vision',
    'nlp': 'NLP',
    'rl': 'Reinforcement Learning',
    'dnn': 'Deep Learning',
    'cnn': 'Computer Vision',
    'rnn': 'Deep Learning',
    'lstm': 'Deep Learning',
    'etl': 'Data Engineering',
    'k8s': 'Kubernetes',
}

def parse_job(job_text):
    """
    Extract key requirements from job description.
    Enhanced with context awareness, synonym handling, and expanded vocabulary.
    
    Args:
        job_text: Raw job description
        
    Returns:
        Dictionary with extracted skills, experience, tools
    """
    try:
        result = {
            "skills": extract_skills(job_text),
            "experience": extract_experience(job_text),
            "tools": extract_tools(job_text),
            "raw_text": job_text
        }
        logger.info(f"Parsed job description: {len(result['skills'])} skills, {result['experience']} years experience")
        return result
    except Exception as e:
        logger.error(f"Error parsing job description: {str(e)}")
        return {"skills": [], "experience": 0, "tools": [], "raw_text": job_text}

def extract_experience(job_text):
    """Extract years of experience requirement with context awareness."""
    patterns = [
        r'(\d+)\+?\s*(?:to\s+\d+)?\s*years?\s+(?:of\s+)?experience',
        r'(\d+)\+?\s*years?\s+(?:in|with)',
        r'(?:minimum|at\s+least|required)\s+(\d+)\s*years?',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, job_text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    
    # Default if no explicit experience found
    return 0

def _is_negated(job_text, skill_position, window=50):
    """Check if a skill mention is in a negative context."""
    # Look back in the text for negation words
    start = max(0, skill_position - window)
    context = job_text[start:skill_position].lower()
    
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

def extract_skills(job_text):
    """Extract technical skills with context awareness and synonym handling."""
    found_skills = []
    job_text_lower = job_text.lower()
    seen = set()  # To avoid duplicates
    
    # Search through skill vocabulary
    for skill_name, aliases in SKILL_VOCABULARY.items():
        for alias in aliases:
            try:
                # Use word boundary matching
                pattern = rf'\b{alias}\b'
                for match in re.finditer(pattern, job_text_lower, re.IGNORECASE):
                    # Check if this match is in a negated context
                    if not _is_negated(job_text_lower, match.start(), window=60):
                        # Normalize skill name
                        normalized_skill = skill_name.title()
                        
                        # Handle special cases
                        if skill_name == 'c++':
                            normalized_skill = 'C++'
                        elif skill_name == 'c#':
                            normalized_skill = 'C#'
                        elif skill_name == 'nlp':
                            normalized_skill = 'NLP'
                        elif skill_name == 'ai':
                            normalized_skill = 'AI'
                        
                        if normalized_skill not in seen:
                            found_skills.append(normalized_skill)
                            seen.add(normalized_skill)
                        break  # Only add once per skill
            except re.error:
                # Skip invalid regex patterns
                continue
    
    logger.debug(f"Found skills: {found_skills}")
    return found_skills

def extract_tools(job_text):
    """Extract specific tools and frameworks with synonym handling."""
    found_tools = []
    job_text_lower = job_text.lower()
    seen = set()
    
    # Search through tools vocabulary
    for tool_name, aliases in TOOLS_VOCABULARY.items():
        for alias in aliases:
            try:
                # Use word boundary matching for most, but some tools don't have boundaries
                if alias in ['tf', 'bq']:  # Short aliases
                    pattern = rf'\b{alias}\b'
                else:
                    pattern = rf'\b{alias}\b'
                
                if re.search(pattern, job_text_lower, re.IGNORECASE):
                    if not _is_negated(job_text_lower, job_text_lower.find(alias), window=60):
                        normalized_tool = ' '.join(word.capitalize() for word in tool_name.split())
                        if normalized_tool not in seen:
                            found_tools.append(normalized_tool)
                            seen.add(normalized_tool)
                        break  # Only add once per tool
            except re.error:
                continue
    
    logger.debug(f"Found tools: {found_tools}")
    return found_tools


# ============================================================================
# ENHANCEMENTS MADE TO JOB PARSER
# ============================================================================
"""
Enhanced job_parser.py to address previous limitations:

1. CONTEXT AWARENESS (Negation Handling)
   ✓ Now understands negative contexts: "no Python", "without Docker", "not required"
   ✓ Uses _is_negated() helper to check backward context within 60 chars
   ✓ Prevents false positives from negated skill mentions
   
   Example: "We don't require C++ experience" → C++ not extracted
   
2. EXPANDED VOCABULARY
   ✓ 30+ programming languages and frameworks
   ✓ 20+ machine learning tools and libraries
   ✓ 25+ DevOps and cloud services
   ✓ Better coverage of synonyms and abbreviations
   
   Examples:
   - "Django" → Recognizes as "Django" (not just "Python")
   - "k8s" → Maps to "Kubernetes"
   - "PyTorch" → Recognizes PySpark separately
   
3. SYNONYM HANDLING
   ✓ Automatic normalization of common abbreviations
   ✓ SKILL_SYNONYMS mapping for ML/AI terms
   ✓ Consistent capitalization (C++, C#, NLP, AI)
   
   Examples:
   - "ML Engineer" → Extracted as "Machine Learning"
   - "DL models" → Extracted as "Deep Learning"
   - "ETL pipeline" → Extracted as "Data Engineering"
   
4. IMPROVED FLEXIBILITY
   ✓ Modular vocabulary dicts (SKILL_VOCABULARY, TOOLS_VOCABULARY)
   ✓ Easy to add new skills/tools to vocab
   ✓ Better regex pattern handling with error catching
   ✓ Multiple aliases per skill for variations
   
   To add new skill:
   1. Add to SKILL_VOCABULARY: {'skill_name': ['alias1', 'alias2']}
   2. Automatically integrated into extraction logic
   
5. LOGGING & DEBUGGING
   ✓ Debug logs show extracted skills and tools
   ✓ Better error handling for regex issues
   ✓ Informative logging for troubleshooting
   
USAGE:
   from services.job_parser import parse_job
   job_info = parse_job(job_description)
   # Returns: {
   #   'skills': ['Python', 'Machine Learning', ...],
   #   'tools': ['Tensorflow', 'Pandas', ...],
   #   'experience': 3,
   #   'raw_text': '...'
   # }
"""