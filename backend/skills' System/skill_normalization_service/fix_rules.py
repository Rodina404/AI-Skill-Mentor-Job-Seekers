#!/usr/bin/env python3
"""Fix rules.json - convert skill names to skill IDs"""

import json
from pathlib import Path

# Load skills database
data_dir = Path('.') / 'data'
with open(data_dir / 'skills.json') as f:
    skills_list = json.load(f)

# Create mapping of skill names -> skill IDs
name_to_id = {}
for skill in skills_list:
    name = skill.get('name', '')
    skill_id = skill.get('id', '')
    if name and skill_id:
        name_to_id[name] = skill_id

print(f'Created mapping with {len(name_to_id)} entries')

# Load old rules
with open(data_dir / 'rules.json') as f:
    old_rules = json.load(f)

# Convert rules: skill_name -> skill_id
new_rules = {}
missing = 0
for rule_key, skill_name in old_rules.items():
    if skill_name in name_to_id:
        new_rules[rule_key] = name_to_id[skill_name]
    else:
        missing += 1
        print(f'WARNING: Skill name "{skill_name}" not found')

print(f'\nConverted {len(new_rules)} rules')
if missing > 0:
    print(f'Failed to convert: {missing} rules')

print(f'\nSample mappings:')
for key in list(old_rules.keys())[:5]:
    old_val = old_rules[key]
    new_val = new_rules.get(key, 'NOT_FOUND')
    print(f'  "{key}": "{old_val}" → {new_val}')

# Save new rules
with open(data_dir / 'rules.json', 'w') as f:
    json.dump(new_rules, f, indent=2)

print(f'\n✓ Updated rules.json successfully!')
