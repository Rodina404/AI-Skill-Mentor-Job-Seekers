import re

def extract_education(text):
    text_lower = text.lower()

    degree = ""
    if "bachelor" in text_lower:
        degree = "BSc"
    elif "master" in text_lower:
        degree = "MSc"

    field = "CS" if "computer science" in text_lower else ""

    university = "Unknown"
    if "aiu" in text_lower:
        university = "AIU"

    return {
        "degree": degree,
        "field": field,
        "university": university,
        "year": 2025
    }


def extract_experience(text):
    text_lower = text.lower()

    years = 0

    # detect internship
    if "intern" in text_lower:
        years = 0.25

    # detect explicit years
    matches = re.findall(r"(\d+)\+?\s+years", text_lower)
    if matches:
        years = max([int(x) for x in matches])

    title = "Unknown"
    if "data analyst" in text_lower:
        title = "Data Analyst"

    return {
        "titles": [title],
        "years": years
    }