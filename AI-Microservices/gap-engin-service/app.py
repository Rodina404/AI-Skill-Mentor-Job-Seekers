#!/usr/bin/env python3
"""
app.py - CLI interface for GradRAG.

Enter a job title and optional skills → Get skill gap analysis.

Usage:
    python app.py
"""

import sys
import json
import logging
from dotenv import load_dotenv

load_dotenv(override=True)

logging.basicConfig(level=logging.WARNING)  # Keep CLI output clean

from src.pipeline import run_pipeline
from src.role_library import get_skill_name
from src.converters import experience_to_score, education_to_score


def _print_skills(label: str, skills: list[dict], color: str = ""):
    RESET = "\033[0m"
    print(f"\n  {color}{label}:{RESET}")
    if not skills:
        print("    (none)")
        return
    for s in skills:
        sid = s.get("skillId", "")
        name = get_skill_name(sid)
        weight = s.get("weight", 0)
        bar_len = int(weight * 20)
        bar = "█" * bar_len + "░" * (20 - bar_len)
        print(f"    [{bar}] {weight:.2f}  {name} ({sid})")


def _print_result(result: dict):
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    RESET = "\033[0m"

    print(f"\n{'='*60}")
    print(f"{BOLD}  GradRAG — Skill Gap Analysis{RESET}")
    print(f"{'='*60}")

    if result.get("error"):
        print(f"\n{RED}  ✗ Error: {result.get('message', 'Unknown error')}{RESET}\n")
        return

    job_title = result.get("jobTitle", "")
    source = result.get("source", "")
    confidence = result.get("roleConfidence", 0)
    readiness = result.get("readinessScore", 0)

    source_label = "Mode A (local KB)" if source == "mode_a" else "Mode B (RAG fallback)"
    conf_pct = int(confidence * 100)
    read_pct = int(readiness * 100)

    print(f"\n  {BOLD}Job Title:{RESET}    {job_title}")
    print(f"  {BOLD}Source:{RESET}       {source_label}")
    print(f"  {BOLD}Confidence:{RESET}   {conf_pct}%")

    readiness_color = GREEN if read_pct >= 70 else (YELLOW if read_pct >= 40 else RED)
    print(f"  {BOLD}Readiness:{RESET}    {readiness_color}{read_pct}%{RESET}", end="")
    if read_pct >= 70:
        print(f"  {GREEN}✓ Ready{RESET}")
    elif read_pct >= 40:
        print(f"  {YELLOW}⚠ Partially Ready{RESET}")
    else:
        print(f"  {RED}✗ Not Ready{RESET}")

    _print_skills("Required Skills", result.get("requiredSkills", []))
    _print_skills(f"Matched Skills ({GREEN}you have{RESET})", result.get("matchedSkills", []), GREEN)
    _print_skills(f"Missing Skills ({RED}gaps{RESET})", result.get("missingSkills", []), RED)

    unknown = result.get("unknownSkills", [])
    if unknown:
        print(f"\n  {YELLOW}Unrecognized skills (not in catalog):{RESET}")
        for u in unknown:
            print(f"    - {u}")

    print(f"\n{'='*60}\n")


def main():
    print("\n🎓  GradRAG — Role Skill Gap Analyzer")
    print("    (Type 'quit' to exit)\n")

    while True:
        try:
            job_title = input("Enter job title: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            sys.exit(0)

        if job_title.lower() in ("quit", "exit", "q"):
            print("Goodbye!")
            break

        if not job_title:
            print("Please enter a job title.\n")
            continue

        skills_input = input("Your skills (comma-separated, or press Enter to skip): ").strip()
        user_skills = None
        if skills_input:
            user_skills = [s.strip() for s in skills_input.split(",") if s.strip()]

        # Ask for natural-language experience and education levels
        exp_input = input("Experience level (e.g. no experience, junior, 3 years, senior): ").strip()
        experience_score = experience_to_score(exp_input) if exp_input else 1.0

        edu_input = input("Education level (e.g. high school, bachelor, master, phd): ").strip()
        education_score = education_to_score(edu_input) if edu_input else 1.0

        # Show what was detected
        print(f"\n  Experience: '{exp_input or 'unspecified'}' → score {experience_score}")
        print(f"  Education:  '{edu_input or 'unspecified'}' → score {education_score}\n")

        print(f"\n  Analyzing '{job_title}'...", end="", flush=True)

        result = run_pipeline(
            job_title=job_title,
            user_skills=user_skills,
            experience_score=experience_score,
            education_score=education_score,
        )

        _print_result(result)

        again = input("Analyze another? (Enter=yes, q=quit): ").strip().lower()
        if again in ("q", "quit", "no", "n"):
            print("Goodbye!")
            break


if __name__ == "__main__":
    main()
