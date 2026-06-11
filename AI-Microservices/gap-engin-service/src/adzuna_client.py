"""
adzuna_client.py - Fetches live job postings from Adzuna jobs database.

Queries Adzuna API for jobs matching a title, filters low-quality postings,
and converts results to plain text for LLM consumption.

Required env vars:
  ADZUNA_APP_ID     - Your Adzuna app ID
  ADZUNA_APP_KEY    - Your Adzuna API key
  ADZUNA_COUNTRY    - Country code (e.g., "gb", "us")  [default: gb]
"""

import os
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs"
DEFAULT_RESULTS_PER_PAGE = 10


def _get_config() -> dict:
    return {
        "app_id": os.getenv("ADZUNA_APP_ID", ""),
        "app_key": os.getenv("ADZUNA_APP_KEY", ""),
        "country": os.getenv("ADZUNA_COUNTRY", "gb"),
    }


def fetch_job_postings(job_title: str, max_results: int = 5) -> list[dict]:
    """
    Fetch live job postings for a given title from Adzuna.

    Args:
        job_title: The job title to search for.
        max_results: Max number of postings to return.

    Returns:
        List of job posting dicts with keys: title, description, company, salary.
        Returns empty list on error.
    """
    config = _get_config()

    if not config["app_id"] or not config["app_key"]:
        logger.warning("Adzuna credentials not set. Skipping live job fetch.")
        return []

    url = f"{ADZUNA_BASE_URL}/{config['country']}/search/1"
    params = {
        "app_id": config["app_id"],
        "app_key": config["app_key"],
        "what": job_title,
        "results_per_page": max(max_results, DEFAULT_RESULTS_PER_PAGE),
        "content-type": "application/json",
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        logger.info(f"Adzuna returned {len(results)} postings for '{job_title}'")

        postings = []
        for job in results[:max_results]:
            desc = job.get("description", "").strip()
            # Skip very short / empty descriptions
            if len(desc) < 50:
                continue
            postings.append({
                "title": job.get("title", ""),
                "description": desc,
                "company": job.get("company", {}).get("display_name", ""),
                "salary_min": job.get("salary_min"),
                "salary_max": job.get("salary_max"),
            })
        return postings

    except requests.exceptions.RequestException as e:
        logger.error(f"Adzuna API error for '{job_title}': {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error fetching Adzuna data: {e}")
        return []


def postings_to_text(postings: list[dict]) -> str:
    """
    Convert job postings list to plain text for LLM context.

    Args:
        postings: List of posting dicts.

    Returns:
        Formatted string with all posting descriptions.
    """
    if not postings:
        return ""

    parts = []
    for i, p in enumerate(postings, 1):
        title = p.get("title", "Unknown")
        company = p.get("company", "Unknown")
        desc = p.get("description", "")
        parts.append(f"--- Job Posting {i} ---\nTitle: {title}\nCompany: {company}\n{desc}")

    return "\n\n".join(parts)
