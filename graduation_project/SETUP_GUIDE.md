"""
Guide for Running and Testing the AI Skill Mentor Graduation Project
"""

## INSTALLATION STEPS

1. **Install Dependencies**
   ```bash
   cd graduation_project
   pip install -r requirements.txt
   ```

2. **Set Groq API Key** (Optional but recommended)
   ```bash
   # Windows PowerShell
   $env:GROQ_API_KEY = "your_groq_api_key_here"

   # Windows CMD
   set GROQ_API_KEY=your_groq_api_key_here

   # Linux/Mac
   export GROQ_API_KEY="your_groq_api_key_here"
   ```

3. **Verify Data Files**
   Ensure these files exist in `../../data/`:
   - jobs.csv
   - courses.csv
   - job_skills.csv (optional)

## QUICK START

### Option 1: Run Quick Start Demo
```bash
python quick_start.py
```
This will:
- Test job recommendation system
- Test course recommendation system
- Test Groq integration (if API key set)
- Display sample recommendations

### Option 2: Start the FastAPI Server
```bash
python main_app/app.py
```
Then visit:
- API Documentation: http://localhost:8000/docs
- ReDoc Documentation: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## TESTING

### Run All Tests
```bash
pytest tests/test_system.py -v
```

### Run Specific Test Classes
```bash
# Job recommendation tests
pytest tests/test_system.py::TestJobRecommendationSystem -v

# Course recommendation tests
pytest tests/test_system.py::TestCourseRecommendationSystem -v

# API integration tests
pytest tests/test_system.py::TestSystemIntegration -v
```

### Run Specific Tests
```bash
# Test job recommender initialization
pytest tests/test_system.py::TestJobRecommendationSystem::test_job_recommender_initialization -v

# Test course recommendations
pytest tests/test_system.py::TestCourseRecommendationSystem::test_course_recommendations_api -v
```

## USING THE API

### 1. Get Job Recommendations
```bash
curl -X POST http://localhost:8000/api/v1/recommend-job \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["python", "machine learning", "data analysis"],
    "experience_years": 2,
    "education": "Bachelor in CS",
    "top_n": 5
  }'
```

### 2. Get Course Recommendations (User-Based)
```bash
curl -X POST http://localhost:8000/api/v1/recommend-course \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 0,
    "top_n": 5
  }'
```

### 3. Get Course Recommendations (Item-Based)
```bash
curl -X POST http://localhost:8000/api/v1/recommend-course \
  -H "Content-Type: application/json" \
  -d '{
    "user_ratings": {
      "0": 5.0,
      "1": 4.0,
      "2": 3.0
    },
    "top_n": 5
  }'
```

### 4. Get Statistics
```bash
# Job statistics
curl http://localhost:8000/api/v1/job-stats

# Course statistics
curl http://localhost:8000/api/v1/course-stats
```

## PROJECT STRUCTURE OVERVIEW

```
graduation_project/
├── main_app/
│   ├── __init__.py
│   └── app.py                    # FastAPI application
│
├── job_recommendation/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── data_preprocessor.py  # Job data processing
│   │   └── job_recommender.py    # TF-IDF recommendation
│   └── routes/
│       ├── __init__.py
│       └── job_routes.py         # API endpoints
│
├── course_recommendation/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── data_preprocessor.py  # Course data processing
│   │   └── course_recommender.py # Collaborative filtering
│   └── routes/
│       ├── __init__.py
│       └── course_routes.py      # API endpoints
│
├── utils/
│   ├── __init__.py
│   ├── config.py                 # Configuration
│   └── groq_service.py           # Groq API integration
│
├── tests/
│   ├── __init__.py
│   └── test_system.py            # Test suite
│
├── quick_start.py                # Quick start demo
├── README.md                      # Full documentation
└── requirements.txt              # Dependencies
```

## CONFIGURATION

Edit `utils/config.py` to customize:
- API host/port
- TF-IDF parameters
- Collaborative filtering settings
- Groq model and parameters
- Logging settings

## KEY ALGORITHMS

### Job Recommendation (TF-IDF + Cosine Similarity)

1. **Input**: User skills, experience, education
2. **Processing**:
   - Convert user profile to TF-IDF vector
   - Calculate cosine similarity with all jobs
   - Rank by similarity score
3. **Output**: Top N recommended jobs with explanations

**Complexity**: O(n_jobs) where n_jobs is number of jobs

### Course Recommendation (Collaborative Filtering)

1. **User-Based**:
   - Find similar users
   - Recommend courses they rated highly
   - Complexity: O(n_users + n_courses)

2. **Item-Based**:
   - Find similar courses to user's rated items
   - Recommend highly-rated similar courses
   - Complexity: O(n_courses²) with KNN

## PERFORMANCE TIPS

1. **Data Caching**: Models are cached in `models/` directory
2. **Vectorization**: All operations use numpy for speed
3. **Sparse Matrices**: Efficient storage for user-item data
4. **Batch Processing**: Process multiple requests efficiently

## TROUBLESHOOTING

### Issue: "ModuleNotFoundError: No module named 'main_app'"
**Solution**: Run commands from the `graduation_project/` directory

### Issue: "Data file not found"
**Solution**: Ensure CSV files are in `../../data/` or adjust DATA_PATH in config.py

### Issue: Groq API errors
**Solution**: 
1. Verify API key is set: `echo $GROQ_API_KEY`
2. Check API key is valid
3. Check internet connection
4. Groq features are optional; system works without them

### Issue: Slow recommendations
**Solution**:
1. Check system resources (RAM, CPU)
2. Reduce number of jobs/courses in data
3. Reduce TF-IDF max_features
4. Use model caching (enabled by default)

## NEXT STEPS

1. **Run Quick Start**: `python quick_start.py`
2. **Start API Server**: `python main_app/app.py`
3. **Test Endpoints**: Use curl or Postman
4. **Run Test Suite**: `pytest tests/test_system.py -v`
5. **Customize**: Modify parameters in `utils/config.py`
6. **Deploy**: See deployment section in README.md

## SUPPORT

For more details, see:
- README.md - Full project documentation
- API docs: http://localhost:8000/docs
- Test file: tests/test_system.py for usage examples
