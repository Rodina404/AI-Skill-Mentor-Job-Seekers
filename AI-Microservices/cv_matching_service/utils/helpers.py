import logging

logger = logging.getLogger(__name__)

def candidate_to_text(candidate):
    """
    Convert candidate dictionary to searchable text format.
    
    Args:
        candidate: Dictionary with candidate information
        
    Returns:
        Formatted text string for vector embedding
    """
    try:
        skills = ', '.join(candidate.get('skills', []))
        experience = candidate.get('experience', 0)
        tools = ', '.join(candidate.get('tools', []))
        education = candidate.get('education', 'Not specified')
        
        text = f"""
        Name: {candidate.get('name', 'Unknown')}
        Skills: {skills}
        Experience: {experience} years
        Tools: {tools}
        Education: {education}
        """
        
        return text.strip()
    except Exception as e:
        logger.error(f"Error converting candidate to text: {str(e)}")
        return "Error processing candidate"

