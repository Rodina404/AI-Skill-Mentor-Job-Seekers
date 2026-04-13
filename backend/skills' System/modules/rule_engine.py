def rule_mapping(clean_skills, rules):
    mapped = []
    unknown = []

    for skill in clean_skills:
        s = skill.lower()

        if s in rules:
            mapped.append(rules[s])
        else:
            unknown.append(skill)

    return mapped, unknown


def find_in_db(skill_name, skills_db):
    for skill in skills_db:
        if skill_name.lower() == skill["name"].lower():
            return skill

        for alias in skill.get("aliases", []):
            if skill_name.lower() == alias.lower():
                return skill

    return None