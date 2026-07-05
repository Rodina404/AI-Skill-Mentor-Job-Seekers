import os
import requests
import logging

logger = logging.getLogger(__name__)

class AdzunaClientError(Exception):
    """Custom exception raised when the Adzuna API client fails."""
    pass

def search(query: str, location: str = "", results_per_page: int = 10) -> list:
    """
    Search for jobs via the Adzuna API.
    
    Args:
        query: The job title or search keywords.
        location: The location to search in.
        results_per_page: Number of results to return.
        
    Returns:
        List of raw job results from Adzuna.
        
    Raises:
        AdzunaClientError: If the Adzuna API call fails after retries.
    """
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")
    country = os.getenv("ADZUNA_COUNTRY", "us")
    
    if not app_id or not app_key:
        raise AdzunaClientError("Adzuna credentials are not configured. Please set ADZUNA_APP_ID and ADZUNA_APP_KEY.")
        
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "what": query,
        "results_per_page": results_per_page,
        "content-type": "application/json"
    }
    if location:
        params["where"] = location
        
    max_attempts = 2
    for attempt in range(max_attempts):
        try:
            logger.info(f"Calling Adzuna API (attempt {attempt + 1}/{max_attempts}): {url} (query='{query}', location='{location}')")
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except (requests.RequestException, ValueError) as e:
            logger.warning(f"Adzuna API call failed on attempt {attempt + 1}: {e}")
            if attempt == max_attempts - 1:
                raise AdzunaClientError(f"Adzuna API call failed after {max_attempts} attempts. Original error: {str(e)}") from e
