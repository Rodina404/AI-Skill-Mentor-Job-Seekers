#!/usr/bin/env python3
"""
check_env.py - Validates environment, dependencies, API keys, and system initialization.

Run this before anything else to diagnose setup issues.
"""

import os
import sys
import importlib

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except ImportError:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BOLD = "\033[1m"
RESET = "\033[0m"

errors = 0
warnings = 0


def ok(msg):
    print(f"  {GREEN}✓{RESET} {msg}")


def warn(msg):
    global warnings
    warnings += 1
    print(f"  {YELLOW}⚠{RESET} {msg}")


def fail(msg):
    global errors
    errors += 1
    print(f"  {RED}✗{RESET} {msg}")


def section(title):
    print(f"\n{BOLD}{'─'*50}{RESET}")
    print(f"{BOLD}  {title}{RESET}")
    print(f"{BOLD}{'─'*50}{RESET}")


# ── Python version ──────────────────────────────────────
section("Python Version")
major, minor = sys.version_info[:2]
if major == 3 and minor >= 10:
    ok(f"Python {major}.{minor} (≥3.10 required)")
else:
    fail(f"Python {major}.{minor} — requires Python 3.10+")

# ── Required packages ────────────────────────────────────
section("Required Packages")
REQUIRED = [
    ("fastapi", "fastapi"),
    ("uvicorn", "uvicorn"),
    ("pydantic", "pydantic"),
    ("requests", "requests"),
    ("python-dotenv", "dotenv"),
    ("sentence-transformers", "sentence_transformers"),
    ("numpy", "numpy"),
]
OPTIONAL = [
    ("chromadb", "chromadb"),
    ("groq", "groq"),
    ("pytest", "pytest"),
]

for display, import_name in REQUIRED:
    try:
        importlib.import_module(import_name)
        ok(display)
    except ImportError:
        fail(f"{display} — run: pip install {display}")

print()
for display, import_name in OPTIONAL:
    try:
        importlib.import_module(import_name)
        ok(f"{display} (optional)")
    except ImportError:
        warn(f"{display} not installed (optional) — run: pip install {display}")

# ── Environment variables ────────────────────────────────
section("Environment Variables")

groq_key = os.getenv("GROQ_API_KEY", "")
if groq_key and len(groq_key) > 10:
    ok(f"GROQ_API_KEY is set ({groq_key[:8]}...)")
else:
    warn("GROQ_API_KEY not set — Mode B LLM will be disabled")

adzuna_id = os.getenv("ADZUNA_APP_ID", "")
adzuna_key = os.getenv("ADZUNA_APP_KEY", "")
adzuna_country = os.getenv("ADZUNA_COUNTRY", "gb")

if adzuna_id and adzuna_key:
    ok(f"Adzuna credentials set (country: {adzuna_country})")
else:
    warn("ADZUNA_APP_ID / ADZUNA_APP_KEY not set — Mode B job fetching will be disabled")

allowed_origin = os.getenv("ALLOWED_ORIGIN", "")
if allowed_origin:
    ok(f"ALLOWED_ORIGIN={allowed_origin}")
else:
    ok("ALLOWED_ORIGIN not set (using defaults: localhost:3000, localhost:5173)")

# ── Data files ───────────────────────────────────────────
section("Data Files")
DATA_DIR = os.path.join(ROOT, "data")
FILES = [
    "merged_roles_structured_preserve_all.json",
    "skills_catalog.json",
    "role_skill_library_seed.json",
]
for fname in FILES:
    path = os.path.join(DATA_DIR, fname)
    if os.path.exists(path):
        size = os.path.getsize(path)
        ok(f"{fname} ({size:,} bytes)")
    else:
        fail(f"{fname} — missing from data/")

# ── Core module imports ──────────────────────────────────
section("Core Module Imports")
MODULES = [
    "src.role_library",
    "src.loaders",
    "src.gap_engine",
    "src.adzuna_client",
    "src.llm",
    "src.vectorstore",
    "src.retrieval_helpers",
    "src.pipeline",
    "api.schemas",
    "api.adapter",
]
for mod in MODULES:
    try:
        importlib.import_module(mod)
        ok(mod)
    except Exception as e:
        fail(f"{mod} — {e}")

# ── Quick pipeline smoke test ────────────────────────────
section("Pipeline Smoke Test")
try:
    from src.pipeline import run_pipeline
    result = run_pipeline("data analyst")
    if result.get("error"):
        warn(f"Pipeline returned error for 'data analyst': {result.get('message')}")
    else:
        src = result.get("source", "?")
        conf = result.get("roleConfidence", 0)
        n_skills = len(result.get("requiredSkills", []))
        ok(f"Pipeline works: 'data analyst' → {n_skills} skills ({src}, conf={conf:.2f})")
except Exception as e:
    fail(f"Pipeline smoke test failed: {e}")

# ── Summary ──────────────────────────────────────────────
section("Summary")
if errors == 0 and warnings == 0:
    print(f"  {GREEN}{BOLD}All checks passed! GradRAG is ready.{RESET}\n")
elif errors == 0:
    print(f"  {YELLOW}{BOLD}{warnings} warning(s). Core system OK; some optional features may be limited.{RESET}\n")
else:
    print(f"  {RED}{BOLD}{errors} error(s), {warnings} warning(s). Fix errors before running.{RESET}\n")

sys.exit(1 if errors > 0 else 0)
