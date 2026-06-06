from typing import List, Dict

def apply_constraints(courses: List[Dict], constraints: Dict) -> List[Dict]:
    """
    L1-4: Constraint Filter
    Input: topKCourses[], userConstraints{}
    Output: filteredCourses[]
    """
    level = (constraints.get("level") or "").lower()
    language = (constraints.get("language") or "").lower()
    hours_per_week = constraints.get("hoursPerWeek", 999)
    
    filtered = []
    for course in courses:
        # Level filter
        if level and level not in course.get("level", "").lower():
            continue
        
        # Language filter
        if language and language not in course.get("language", "").lower():
            continue
        
        # Duration filter (estimate weeks from hours)
        estimated_weeks = course.get("duration", 20) / max(hours_per_week, 1)
        if estimated_weeks > 52:  # Skip courses longer than a year
            continue
        
        filtered.append(course)
    
    # If filtering removed everything, return unfiltered results
    if not filtered and courses:
        return courses
    
    return filtered
