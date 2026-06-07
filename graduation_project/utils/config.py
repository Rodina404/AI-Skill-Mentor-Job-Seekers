"""
Setup and Configuration Guide
"""

# API Configuration
API_HOST = "0.0.0.0"
API_PORT = 8000
API_WORKERS = 4
API_RELOAD = True  # Set to False for production

# Data Configuration
DATA_PATH = "../../data"
MODEL_PATH = "models"
MODEL_CACHE_ENABLED = True

# Job Recommendation Configuration
JOB_TFIDF_MAX_FEATURES = 5000
JOB_TFIDF_MIN_DF = 2
JOB_MIN_SIMILARITY = 0.1
JOB_RECOMMENDATIONS_TOP_N = 10

# Course Recommendation Configuration
COURSE_SYNTHETIC_USERS = 1000
COURSE_KNN_NEIGHBORS = 20
COURSE_MIN_SIMILARITY = 0.0
COURSE_RECOMMENDATIONS_TOP_N = 10

# Groq API Configuration
GROQ_MODEL = "mixtral-8x7b-32768"
GROQ_MAX_TOKENS = 1000
GROQ_TEMPERATURE = 0.7

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# CORS Configuration
CORS_ORIGINS = ["*"]
CORS_CREDENTIALS = True
CORS_METHODS = ["*"]
CORS_HEADERS = ["*"]

# Request Configuration
REQUEST_TIMEOUT = 30
REQUEST_MAX_SIZE = 10485760  # 10MB