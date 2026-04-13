def extract_skills_from_text(text, skills_db):
    found_skills = []
    text_lower = f" {text.lower()} "

    for skill in skills_db:
        name = skill["name"].lower()

        # exact match with spacing
        if f" {name} " in text_lower:
            found_skills.append(skill["name"])

        # check aliases
        for alias in skill.get("aliases", []):
            if f" {alias.lower()} " in text_lower:
                found_skills.append(skill["name"])

    return list(set(found_skills))