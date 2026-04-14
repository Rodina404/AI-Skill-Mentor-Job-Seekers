import json

with open("skills.json") as f:
    skills = json.load(f)

rules = {}

for skill in skills:
    name = skill["name"].lower()

    # basic variations
    rules[name] = skill["name"]
    rules[name.replace(" ", "")] = skill["name"]
    rules[name.replace(".", "")] = skill["name"]

    # aliases
    for alias in skill.get("aliases", []):
        rules[alias.lower()] = skill["name"]

# extra noisy variations
extra = {
    "powerbi desktop": "Power BI",
    "react js": "React",
    "node js": "Node.js",
    "machine learning model": "Machine Learning",
    "deep learning model": "Deep Learning"
}

rules.update(extra)

# save
with open("rules.json", "w") as f:
    json.dump(rules, f, indent=2)

print("Generated", len(rules), "rules")