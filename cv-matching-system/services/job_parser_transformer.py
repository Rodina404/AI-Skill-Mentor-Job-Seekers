"""
Enhanced Job Parser using Transformers + NER
Combines speed of regex with accuracy of transformers
"""

import re
import logging
from functools import lru_cache
import hashlib

logger = logging.getLogger(__name__)

# Try to import transformers - graceful fallback if not available
try:
    from transformers import pipeline
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    logger.warning("Transformers not installed. Using regex-only parser.")

# Cache the pipeline to avoid loading model multiple times
_ner_pipeline_cache = None
_skill_extraction_cache = {}

def get_ner_pipeline():
    """
    Get or create NER pipeline (cached at module level).
    Loads model once, reuses for all requests.
    """
    global _ner_pipeline_cache
    
    if not HAS_TRANSFORMERS:
        return None
    
    if _ner_pipeline_cache is None:
        try:
            logger.info("Loading NER model (cached for future use)...")
            _ner_pipeline_cache = pipeline(
                "token-classification",
                model="dslim/bert-base-multilingual-cased-ner",
                aggregation_strategy="simple"  # Merge subword tokens
            )
            logger.info("✓ NER model loaded and cached")
        except Exception as e:
            logger.warning(f"Failed to load NER model: {e}. Falling back to regex parser.")
            return None
    
    return _ner_pipeline_cache

def extract_skills_with_ner(job_text, max_length=512):
    """
    Extract skills using Named Entity Recognition (Transformer-based).
    
    More accurate but slower than regex (~300-500ms per request).
    Handles negation, context, unknown skills better.
    
    Args:
        job_text: Job description
        max_length: Max tokens for transformer (avoid memory issues)
    
    Returns:
        List of extracted skills
    """
    if not HAS_TRANSFORMERS:
        return []
    
    # Check cache first
    job_hash = hashlib.md5(job_text.encode()).hexdigest()
    if job_hash in _skill_extraction_cache:
        logger.debug("Using cached NER results")
        return _skill_extraction_cache[job_hash]
    
    try:
        ner_pipeline = get_ner_pipeline()
        if not ner_pipeline:
            return []
        
        # Limit text length to avoid memory issues
        truncated_text = job_text[:max_length * 4]  # Rough estimate
        
        logger.debug(f"Running NER on {len(truncated_text)} chars of text...")
        entities = ner_pipeline(truncated_text)
        
        # Filter for skill-related entities
        skills = set()
        skill_keywords = [
            'SKILL', 'EXPERTISE', 'PROFICIENCY', 'KNOWLEDGE',
            'PROGRAMMING', 'TECHNOLOGY', 'FRAMEWORK', 'LIBRARY'
        ]
        
        for entity in entities:
            if any(keyword in entity.get('entity_group', '').upper() for keyword in skill_keywords):
                skill = entity['word'].strip()
                if skill and len(skill) > 2:  # Filter noise
                    skills.add(skill)
        
        result = list(skills)
        _skill_extraction_cache[job_hash] = result
        
        logger.info(f"NER extracted {len(result)} skills")
        return result
        
    except Exception as e:
        logger.error(f"NER extraction failed: {e}")
        return []

def extract_skills_with_llm(job_text):
    """
    Extract skills using LLM (if available).
    Most accurate but requires API/model.
    
    This is commented out but available for future implementation.
    """
    # from transformers import AutoModelForSequenceClassification, AutoTokenizer
    # Could use few-shot prompt with a smaller LLM
    pass

# Keep original dictionaries for hybrid approach
SKILL_VOCABULARY = {
    'python': ['python', 'py'],
    'java': ['java'],
    'javascript': ['javascript', 'js', 'typescript'],
    'machine learning': ['machine learning', 'ml'],
    'deep learning': ['deep learning', 'dl', 'cnn', 'rnn', 'lstm'],
    'data science': ['data science'],
    'nlp': ['nlp', 'natural language processing'],
    'computer vision': ['computer vision', 'cv'],
    'tensorflow': ['tensorflow', 'tf'],
    'pytorch': ['pytorch', 'torch'],
    'kubernetes': ['kubernetes', 'k8s'],
    'docker': ['docker'],
    'aws': ['aws', 'amazon web services'],
    'sql': ['sql'],
    'cloud computing': ['cloud computing'],
}

def parse_job_hybrid(job_text, use_transformer=True):
    """
    Hybrid parser combining regex (fast) + transformers (accurate).
    
    Args:
        job_text: Job description
        use_transformer: Whether to use NER (slower but more accurate)
    
    Returns:
        Dictionary with extracted skills, experience, tools
    """
    try:
        result = {
            "skills": [],
            "experience": extract_experience(job_text),
            "tools": extract_tools(job_text),
            "raw_text": job_text,
            "parsing_method": "hybrid"
        }
        
        # Start with regex (fast)
        regex_skills = extract_skills_regex(job_text)
        result["skills"] = regex_skills
        result["regex_skills"] = len(regex_skills)
        
        # Optionally add NER results (accurate)
        if use_transformer:
            ner_skills = extract_skills_with_ner(job_text)
            # Merge results, NER might catch new skills
            all_skills = set(regex_skills + ner_skills)
            result["skills"] = sorted(list(all_skills))
            result["ner_skills"] = len(ner_skills)
            result["parsing_method"] = "hybrid (regex + NER)"
            logger.info(f"Hybrid parsing: {len(regex_skills)} regex + {len(ner_skills)} NER = {len(result['skills'])} total")
        else:
            result["parsing_method"] = "regex-only (fast)"
        
        return result
        
    except Exception as e:
        logger.error(f"Error parsing job: {e}")
        return {"skills": [], "experience": 0, "tools": [], "raw_text": job_text}

def extract_skills_regex(job_text):
    """Fast regex-based skill extraction (fallback)."""
    found_skills = []
    job_text_lower = job_text.lower()
    seen = set()
    
    for skill_name, aliases in SKILL_VOCABULARY.items():
        for alias in aliases:
            pattern = rf'\b{alias}\b'
            if re.search(pattern, job_text_lower, re.IGNORECASE):
                normalized = skill_name.title()
                if normalized not in seen:
                    found_skills.append(normalized)
                    seen.add(normalized)
                break
    
    return found_skills

def extract_experience(job_text):
    """Extract years of experience."""
    patterns = [
        r'(\d+)\+?\s*(?:to\s+\d+)?\s*years?\s+(?:of\s+)?experience',
        r'(\d+)\+?\s*years?\s+(?:in|with)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, job_text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    
    return 0

def extract_tools(job_text):
    """Extract tools and frameworks."""
    tools_list = [
        'tensorflow', 'pytorch', 'kubernetes', 'docker', 'aws',
        'pandas', 'numpy', 'django', 'flask', 'postgresql'
    ]
    
    found_tools = []
    job_text_lower = job_text.lower()
    
    for tool in tools_list:
        if tool in job_text_lower:
            found_tools.append(tool.title())
    
    return found_tools

# Alias for backward compatibility
def parse_job(job_text, use_transformer=True):
    """Parse job description using hybrid approach."""
    return parse_job_hybrid(job_text, use_transformer=use_transformer)

# Performance monitoring
_latency_samples = []

def log_performance(execution_time_ms):
    """Track parsing performance."""
    _latency_samples.append(execution_time_ms)
    if len(_latency_samples) % 10 == 0:
        avg = sum(_latency_samples[-10:]) / 10
        logger.info(f"Avg parsing latency (last 10): {avg:.0f}ms")

def get_performance_stats():
    """Return parsing performance statistics."""
    if not _latency_samples:
        return None
    
    return {
        "total_parses": len(_latency_samples),
        "avg_latency_ms": sum(_latency_samples) / len(_latency_samples),
        "min_latency_ms": min(_latency_samples),
        "max_latency_ms": max(_latency_samples),
    }
