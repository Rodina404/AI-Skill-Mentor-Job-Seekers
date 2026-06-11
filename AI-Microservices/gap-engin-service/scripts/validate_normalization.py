#!/usr/bin/env python3
"""
validate_normalization.py - Validates skill alias → canonical ID mappings.

Tests that common natural language skill names correctly map
to their canonical S_* identifiers.
"""

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from src.role_library import normalize_skill_name

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"
BOLD = "\033[1m"

TEST_CASES = [
    # (input, expected_canonical_id)
    ("python", "S_python"),
    ("Python 3", "S_python"),
    ("aws ec2", "S_aws"),
    ("amazon web services", "S_aws"),
    ("robot operating system", "S_ros"),
    ("nlp", "S_nlp"),
    ("natural language processing", "S_nlp"),
    ("machine-learning", "S_machine_learning"),
    ("machine learning", "S_machine_learning"),
    ("tensorflow", "S_tensorflow"),
    ("pytorch", "S_pytorch"),
    ("react.js", "S_react"),
    ("nodejs", "S_javascript"),
    ("postgres", "S_sql"),
    ("docker", "S_docker"),
    ("k8s", "S_kubernetes"),
    ("github", "S_git"),
    ("ci/cd", "S_cicd"),
    ("pyspark", "S_spark"),
    ("tableau", "S_data_visualization"),
    ("sklearn", "S_scikit_learn"),
    ("gcp", "S_gcp"),
]

print(f"\n{BOLD}Skill Normalization Validation{RESET}")
print("=" * 50)

passed = 0
failed = 0

for raw, expected in TEST_CASES:
    result = normalize_skill_name(raw)
    if result == expected:
        print(f"  {GREEN}✓{RESET} '{raw}' → {result}")
        passed += 1
    else:
        print(f"  {RED}✗{RESET} '{raw}' → {result!r} (expected {expected!r})")
        failed += 1

print("=" * 50)
print(f"\n  Passed: {GREEN}{passed}{RESET}  Failed: {RED}{failed}{RESET}  Total: {passed + failed}")

if failed == 0:
    print(f"\n  {GREEN}{BOLD}All normalization mappings are correct!{RESET}\n")
else:
    print(f"\n  {YELLOW}Some mappings need attention. Check data/skills_catalog.json aliases.{RESET}\n")

sys.exit(1 if failed > 0 else 0)
