"""
Profile Builder - Structures normalized data into UserProfile.

Pure Python module (no FastAPI imports).
"""

from typing import List, Dict, Any


def build_user_profile(
    user_id: str,
    normalized_skills: List[Dict[str, Any]],
    education: Dict[str, Any],
    experience: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Build complete user profile with normalized skills.
    
    Args:
        user_id: User identifier
        normalized_skills: Output from normalize_skills()
        education: {degree, field, university, year}
        experience: {titles, years}
    
    Returns:
        {
            userId: str,
            skills: [{skillId, name, confidence}],
            education: {degree, field, university, year},
            experience: {titles, years},
            statistics: {totalInputSkills, matchedSkills, unknownSkills, avgConfidence}
        }
    """
    
    # Extract education fields safely
    education = education or {}
    edu_degree = education.get('degree', '')
    edu_field = education.get('field', '')
    edu_university = education.get('university', '')
    edu_year = education.get('year', 0)
    
    # Extract experience fields safely
    experience = experience or {}
    exp_titles = experience.get('titles', [])
    if not isinstance(exp_titles, list):
        exp_titles = []
    exp_years = experience.get('years', 0.0)
    if not isinstance(exp_years, (int, float)):
        exp_years = 0.0
    
    # Calculate statistics
    total_skills = len(normalized_skills)
    matched_skills = len([s for s in normalized_skills if s.get('confidence', 0) > 0])
    unknown_skills = total_skills - matched_skills
    
    avg_confidence = 0.0
    if total_skills > 0:
        confidences = [s.get('confidence', 0) for s in normalized_skills]
        avg_confidence = sum(confidences) / len(confidences)
    
    return {
        'userId': user_id,
        'skills': normalized_skills,
        'education': {
            'degree': str(edu_degree) if edu_degree else '',
            'field': str(edu_field) if edu_field else '',
            'university': str(edu_university) if edu_university else '',
            'year': int(edu_year) if edu_year else 0
        },
        'experience': {
            'titles': [str(t) for t in exp_titles] if exp_titles else [],
            'years': float(exp_years) if exp_years else 0.0
        },
        'statistics': {
            'totalInputSkills': total_skills,
            'matchedSkills': matched_skills,
            'unknownSkills': unknown_skills,
            'avgConfidence': round(avg_confidence, 2)
        }
    }
