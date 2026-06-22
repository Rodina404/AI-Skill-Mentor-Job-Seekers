from functools import lru_cache
from services.config import default_config
from services.data_loaders import DataLoader

@lru_cache(maxsize=1)
def get_loaded_data():
    """Singleton data loader — loads once, cached forever."""
    loader = DataLoader(default_config)
    return loader.load_all()

def get_courses():
    return get_loaded_data().get("courses", [])

def get_skill_hours():
    return get_loaded_data().get("skill_hours", {})

def get_oulad_thresholds():
    return get_loaded_data().get("oulad_thresholds", None)
