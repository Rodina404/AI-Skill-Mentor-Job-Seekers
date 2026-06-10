#!/usr/bin/env python3
"""
run_all_tests.py - Master test runner for GradRAG.

Executes all 12 core tests + 17 API test cases in organized groups
with color-coded output.

Usage:
    python scripts/run_all_tests.py
"""

import os
import sys
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

TEST_GROUPS = [
    {
        "name": "Core Components",
        "description": "Component initialization & basics (4 tests)",
        "path": "tests/core/",
    },
    {
        "name": "Integration",
        "description": "Full pipeline & fallback behavior (4 tests)",
        "path": "tests/integration/",
    },
    {
        "name": "Features",
        "description": "Feature validation (3 tests)",
        "path": "tests/features/",
    },
    {
        "name": "API Suite",
        "description": "API endpoints (17 test cases)",
        "path": "tests/test_service.py",
    },
]


def run_group(group: dict) -> bool:
    """Run a pytest group. Returns True if all passed."""
    print(f"\n{CYAN}{BOLD}▶ {group['name']}{RESET}  {group['description']}")
    print(f"  Path: {group['path']}")
    print("  " + "─" * 46)

    path = os.path.join(ROOT, group["path"])
    if not os.path.exists(path):
        print(f"  {YELLOW}⚠ Path not found: {path}{RESET}")
        return False

    result = subprocess.run(
        [sys.executable, "-m", "pytest", path, "-v", "--tb=short", "--no-header"],
        cwd=ROOT,
        capture_output=False,
    )
    return result.returncode == 0


def main():
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  GradRAG — Full Test Suite{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")

    results = {}
    for group in TEST_GROUPS:
        results[group["name"]] = run_group(group)

    # Summary
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  Test Summary{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")

    all_passed = True
    for name, passed in results.items():
        status = f"{GREEN}PASSED{RESET}" if passed else f"{RED}FAILED{RESET}"
        print(f"  {status}  {name}")
        if not passed:
            all_passed = False

    print()
    if all_passed:
        print(f"  {GREEN}{BOLD}🎉 All test groups passed!{RESET}\n")
    else:
        print(f"  {RED}{BOLD}Some tests failed. Run individual groups with pytest for details.{RESET}\n")

    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
