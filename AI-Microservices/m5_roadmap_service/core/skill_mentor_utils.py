"""
AI Skill Mentor - Utilities Module
===================================

Common utilities including:
- Retry decorator with exponential backoff
- Input validation functions
- Logging setup
- Terminal formatting
- Date/time helpers
"""

import functools
import logging
import time
from datetime import datetime, timedelta
from typing import Any, Callable, Dict, List, Optional, TypeVar, Union
import re

# Type variable for generic functions
T = TypeVar("T")


# ══════════════════════════════════════════════════════════════════════════════
#  TERMINAL FORMATTING (colored output)
# ══════════════════════════════════════════════════════════════════════════════

class TermColors:
    """ANSI color codes for terminal output."""
    
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    END = "\033[0m"
    
    @classmethod
    def disable(cls):
        """Disable colors (for non-TTY output)."""
        cls.GREEN = cls.YELLOW = cls.RED = cls.BLUE = ""
        cls.CYAN = cls.WHITE = cls.BOLD = cls.END = ""


# Safe ASCII fallbacks for Windows cp1252 encoding
import sys
_IS_WINDOWS_CONSOLE = sys.platform == "win32" and not sys.stdout.encoding.lower().startswith("utf")

# Unicode to ASCII mapping for Windows console compatibility
_UNICODE_ASCII_MAP = {
    '→': '->',
    '✓': '[OK]',
    '✗': '[X]',
    '⚠': '[!]',
    '⚠️': '[!]',
    '═': '=',
    '█': '#',
    '×': 'x',
}

def safe_char(unicode_char: str, ascii_fallback: str = None) -> str:
    """Return ASCII fallback if on Windows console without UTF-8."""
    if not _IS_WINDOWS_CONSOLE:
        return unicode_char
    if ascii_fallback is not None:
        return ascii_fallback
    return _UNICODE_ASCII_MAP.get(unicode_char, unicode_char)

def safe_print(text: str) -> None:
    """Print text with Unicode characters safely converted for Windows."""
    if _IS_WINDOWS_CONSOLE:
        for uni, asc in _UNICODE_ASCII_MAP.items():
            text = text.replace(uni, asc)
        # Strip any remaining non-ASCII characters
        text = text.encode('ascii', errors='replace').decode('ascii')
    print(text)

def header(title: str) -> None:
    """Print a formatted section header."""
    c = TermColors
    border = safe_char('═')
    print(f"\n{c.BOLD}{c.BLUE}{border*72}{c.END}")
    print(f"{c.BOLD}{c.WHITE}  {title}{c.END}")
    print(f"{c.BOLD}{c.BLUE}{border*72}{c.END}")


def ok(message: str) -> None:
    """Print a success message."""
    check = safe_char('✓')
    safe_print(f"  {TermColors.GREEN}{check}{TermColors.END} {message}")


def info(message: str) -> None:
    """Print an info message."""
    arrow = safe_char('→')
    safe_print(f"  {TermColors.CYAN}{arrow}{TermColors.END} {message}")


def warn(message: str) -> None:
    """Print a warning message."""
    warning = safe_char('⚠')
    safe_print(f"  {TermColors.YELLOW}{warning}{TermColors.END} {message}")


def error(message: str) -> None:
    """Print an error message."""
    cross = safe_char('✗')
    safe_print(f"  {TermColors.RED}{cross}{TermColors.END} {message}")


def row(key: str, value: str, key_width: int = 42) -> None:
    """Print a key-value row."""
    c = TermColors
    safe_print(f"  {c.YELLOW}{key:<{key_width}}{c.END} {c.WHITE}{value}{c.END}")


# ══════════════════════════════════════════════════════════════════════════════
#  LOGGING SETUP
# ══════════════════════════════════════════════════════════════════════════════

def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    format_string: Optional[str] = None
) -> logging.Logger:
    """
    Set up logging for the skill mentor pipeline.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional path to log file
        format_string: Custom format string
    
    Returns:
        Configured logger instance
    """
    if format_string is None:
        format_string = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    
    logger = logging.getLogger("skill_mentor")
    logger.setLevel(getattr(logging, level.upper()))
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(format_string))
    logger.addHandler(console_handler)
    
    # File handler (optional)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(logging.Formatter(format_string))
        logger.addHandler(file_handler)
    
    return logger


# ══════════════════════════════════════════════════════════════════════════════
#  RETRY DECORATOR
# ══════════════════════════════════════════════════════════════════════════════

class RetryError(Exception):
    """Raised when all retries are exhausted."""
    
    def __init__(self, message: str, last_exception: Optional[Exception] = None):
        super().__init__(message)
        self.last_exception = last_exception


def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,),
    on_retry: Optional[Callable[[Exception, int], None]] = None
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    Decorator that retries a function with exponential backoff.
    
    Args:
        max_attempts: Maximum number of attempts
        delay: Initial delay between retries (seconds)
        backoff_factor: Multiply delay by this factor after each retry
        exceptions: Tuple of exception types to catch
        on_retry: Optional callback called on each retry with (exception, attempt)
    
    Returns:
        Decorated function
    
    Example:
        @retry(max_attempts=3, delay=1.0, exceptions=(requests.RequestException,))
        def fetch_data(url):
            return requests.get(url).json()
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> T:
            current_delay = delay
            last_exception = None
            
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_attempts:
                        raise RetryError(
                            f"All {max_attempts} attempts failed for {func.__name__}",
                            last_exception=e
                        ) from e
                    
                    if on_retry:
                        on_retry(e, attempt)
                    else:
                        warn(f"Attempt {attempt}/{max_attempts} failed: {e}. "
                             f"Retrying in {current_delay:.1f}s...")
                    
                    time.sleep(current_delay)
                    current_delay *= backoff_factor
            
            # Should never reach here, but just in case
            raise RetryError(
                f"Unexpected failure in retry logic for {func.__name__}",
                last_exception=last_exception
            )
        
        return wrapper
    return decorator


# ══════════════════════════════════════════════════════════════════════════════
#  INPUT VALIDATION
# ══════════════════════════════════════════════════════════════════════════════

class ValidationError(Exception):
    """Raised when input validation fails."""
    pass


def validate_user_constraints(
    constraints: Dict[str, Any],
    config: Any = None
) -> Dict[str, Any]:
    """
    Validate and normalize user constraints.
    
    Args:
        constraints: User-provided constraints dict
        config: Optional Config object for bounds checking
    
    Returns:
        Validated and normalized constraints
    
    Raises:
        ValidationError: If constraints are invalid
    """
    from skill_mentor_config import Config
    config = config or Config()
    
    validated = {}
    errors = []
    
    # Name (required)
    name = constraints.get("name", "").strip()
    if not name:
        errors.append("name is required")
    elif len(name) > 100:
        errors.append("name must be 100 characters or less")
    else:
        validated["name"] = name
    
    # Hours per week
    hours_pw = constraints.get("hours_per_week", config.roadmap.default_hours_per_week)
    try:
        hours_pw = float(hours_pw)
        if hours_pw < config.roadmap.min_hours_per_week:
            errors.append(f"hours_per_week must be at least {config.roadmap.min_hours_per_week}")
        elif hours_pw > config.roadmap.max_hours_per_week:
            errors.append(f"hours_per_week must be at most {config.roadmap.max_hours_per_week}")
        else:
            validated["hours_per_week"] = hours_pw
    except (TypeError, ValueError):
        errors.append(f"hours_per_week must be a number, got {type(hours_pw).__name__}")
    
    # Deadline weeks
    deadline_w = constraints.get("deadline_weeks", config.roadmap.default_deadline_weeks)
    try:
        deadline_w = int(deadline_w)
        if deadline_w < config.roadmap.min_deadline_weeks:
            errors.append(f"deadline_weeks must be at least {config.roadmap.min_deadline_weeks}")
        elif deadline_w > config.roadmap.max_deadline_weeks:
            errors.append(f"deadline_weeks must be at most {config.roadmap.max_deadline_weeks}")
        else:
            validated["deadline_weeks"] = deadline_w
    except (TypeError, ValueError):
        errors.append(f"deadline_weeks must be an integer, got {type(deadline_w).__name__}")
    
    if errors:
        raise ValidationError("Invalid user constraints:\n  - " + "\n  - ".join(errors))
    
    return validated


def validate_skill_gaps(gaps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validate and normalize skill gap entries.
    
    Args:
        gaps: List of skill gap dictionaries
    
    Returns:
        Validated and normalized skill gaps
    
    Raises:
        ValidationError: If gaps are invalid
    """
    if not gaps:
        raise ValidationError("At least one skill gap is required")
    
    if not isinstance(gaps, list):
        raise ValidationError(f"gaps must be a list, got {type(gaps).__name__}")
    
    validated = []
    errors = []
    
    for i, gap in enumerate(gaps):
        if not isinstance(gap, dict):
            errors.append(f"Gap {i}: must be a dictionary")
            continue
        
        # Skill name (required)
        skill = gap.get("skill", "").strip()
        if not skill:
            errors.append(f"Gap {i}: skill name is required")
            continue
        
        validated_gap = {"skill": skill}
        
        # Gap score (optional, default 0.8)
        gap_score = gap.get("gap_score", 0.8)
        try:
            gap_score = float(gap_score)
            validated_gap["gap_score"] = max(0.0, min(1.0, gap_score))
        except (TypeError, ValueError):
            validated_gap["gap_score"] = 0.8
        
        # Similarity (optional, default 0.2)
        similarity = gap.get("similarity", 0.2)
        try:
            similarity = float(similarity)
            validated_gap["similarity"] = max(0.0, min(1.0, similarity))
        except (TypeError, ValueError):
            validated_gap["similarity"] = 0.2
        
        # Priority (optional, default "medium")
        priority = gap.get("priority", "medium").lower()
        if priority not in ("high", "medium", "low"):
            priority = "medium"
        validated_gap["priority"] = priority
        
        # Market frequency (optional)
        validated_gap["market_freq"] = gap.get("market_freq", "N/A")
        
        # Best match (optional)
        validated_gap["best_match"] = gap.get("best_match", "none")
        
        validated.append(validated_gap)
    
    if errors:
        raise ValidationError("Invalid skill gaps:\n  - " + "\n  - ".join(errors))
    
    if not validated:
        raise ValidationError("No valid skill gaps after validation")
    
    return validated


def validate_progress_events(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validate progress update events.
    
    Args:
        events: List of progress event dictionaries
    
    Returns:
        Validated events
    
    Raises:
        ValidationError: If events are invalid
    """
    if not isinstance(events, list):
        raise ValidationError(f"events must be a list, got {type(events).__name__}")
    
    validated = []
    
    for event in events:
        if not isinstance(event, dict):
            continue
        
        course_id = event.get("courseId") or event.get("course_id", "")
        if not course_id:
            continue
        
        pct = event.get("percentComplete") or event.get("pct_complete", 0)
        try:
            pct = float(pct)
            pct = max(0.0, min(100.0, pct))
        except (TypeError, ValueError):
            pct = 0.0
        
        timestamp = event.get("timestamp")
        if timestamp:
            try:
                datetime.fromisoformat(timestamp)
            except ValueError:
                timestamp = datetime.now().isoformat()
        else:
            timestamp = datetime.now().isoformat()
        
        validated.append({
            "course_id": course_id,
            "pct_complete": pct,
            "timestamp": timestamp,
        })
    
    return validated


# ══════════════════════════════════════════════════════════════════════════════
#  DATE/TIME HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """
    Parse a date string into a datetime object.
    
    Supports ISO format and common date formats.
    """
    if not date_str:
        return None
    
    formats = [
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    # Try ISO format parsing
    try:
        return datetime.fromisoformat(date_str)
    except ValueError:
        return None


def days_between(date1: Union[str, datetime], date2: Union[str, datetime]) -> int:
    """Calculate days between two dates."""
    if isinstance(date1, str):
        date1 = parse_date(date1) or datetime.now()
    if isinstance(date2, str):
        date2 = parse_date(date2) or datetime.now()
    
    return abs((date2 - date1).days)


def add_days(date: Union[str, datetime], days: int) -> datetime:
    """Add days to a date."""
    if isinstance(date, str):
        date = parse_date(date) or datetime.now()
    return date + timedelta(days=days)


# ══════════════════════════════════════════════════════════════════════════════
#  STRING HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def normalize_skill_name(skill: str) -> str:
    """
    Normalize a skill name for consistent matching.
    
    - Lowercase
    - Strip whitespace
    - Collapse multiple spaces
    - Preserve important characters like ++ and .
    """
    if not skill:
        return ""
    skill = skill.lower().strip()
    skill = re.sub(r'\s+', ' ', skill)  # Collapse multiple spaces
    return skill


def truncate(text: str, max_length: int, suffix: str = "...") -> str:
    """Truncate text to max_length, adding suffix if truncated."""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def parse_hours_string(hours_str: str) -> Optional[float]:
    """
    Parse hours from various string formats.
    
    Examples:
        "10.5 hours" -> 10.5
        "2h 30m" -> 2.5
        "45 minutes" -> 0.75
    """
    if not hours_str:
        return None
    
    hours_str = str(hours_str).lower().strip()
    
    # Try simple float extraction
    nums = re.findall(r'[\d.]+', hours_str)
    if not nums:
        return None
    
    if 'hour' in hours_str or 'hr' in hours_str:
        try:
            return float(nums[0])
        except (ValueError, IndexError):
            return None
    
    if 'min' in hours_str:
        try:
            return float(nums[0]) / 60.0
        except (ValueError, IndexError):
            return None
    
    # Default: assume hours
    try:
        value = float(nums[0])
        if 1.0 <= value <= 300.0:
            return value
    except (ValueError, IndexError):
        pass
    
    return None


# ══════════════════════════════════════════════════════════════════════════════
#  PROGRESS BAR
# ══════════════════════════════════════════════════════════════════════════════

def progress_bar(
    current: float,
    total: float,
    width: int = 20,
    fill_char: str = "█",
    empty_char: str = "░"
) -> str:
    """Generate a simple ASCII progress bar."""
    if total <= 0:
        return empty_char * width
    
    pct = min(1.0, max(0.0, current / total))
    filled = int(width * pct)
    
    return fill_char * filled + empty_char * (width - filled)


# ══════════════════════════════════════════════════════════════════════════════
#  CACHING
# ══════════════════════════════════════════════════════════════════════════════

class SimpleCache:
    """Simple in-memory cache with TTL support."""
    
    def __init__(self, ttl_seconds: int = 3600):
        self.ttl = ttl_seconds
        self._cache: Dict[str, tuple] = {}  # key -> (value, expiry_time)
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired."""
        if key not in self._cache:
            return None
        
        value, expiry = self._cache[key]
        if datetime.now().timestamp() > expiry:
            del self._cache[key]
            return None
        
        return value
    
    def set(self, key: str, value: Any) -> None:
        """Set value in cache with TTL."""
        expiry = datetime.now().timestamp() + self.ttl
        self._cache[key] = (value, expiry)
    
    def clear(self) -> None:
        """Clear all cached values."""
        self._cache.clear()
    
    def __contains__(self, key: str) -> bool:
        return self.get(key) is not None


if __name__ == "__main__":
    # Test utilities
    print("Testing utilities module...\n")
    
    # Test terminal formatting
    header("Test Section")
    ok("This is a success message")
    info("This is an info message")
    warn("This is a warning message")
    error("This is an error message")
    row("Key", "Value")
    
    # Test retry decorator
    @retry(max_attempts=3, delay=0.1)
    def failing_function(fail_count: List[int]):
        fail_count[0] += 1
        if fail_count[0] < 3:
            raise ValueError(f"Attempt {fail_count[0]} failed")
        return "Success!"
    
    print("\nTesting retry decorator...")
    try:
        result = failing_function([0])
        print(f"Result: {result}")
    except RetryError as e:
        print(f"All retries failed: {e}")
    
    # Test validation
    print("\nTesting validation...")
    try:
        validated = validate_user_constraints({
            "name": "Test User",
            "hours_per_week": 10,
            "deadline_weeks": 12
        })
        print(f"Validated constraints: {validated}")
    except ValidationError as e:
        print(f"Validation error: {e}")
    
    # Test progress bar
    print("\nProgress bar examples:")
    for pct in [0, 25, 50, 75, 100]:
        bar = progress_bar(pct, 100)
        print(f"  {pct:3d}% [{bar}]")
    
    print("\n✓ All utility tests passed!")
