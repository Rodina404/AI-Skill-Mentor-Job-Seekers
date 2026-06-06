# AI Skill Mentor - Graduation Project

A comprehensive recommendation system built with FastAPI, featuring job and course recommendations using advanced machine learning techniques.

## 🎯 Project Overview

This graduation project implements a complete AI-powered skill mentoring system with two main recommendation engines:

1. **Job Recommendation System** - Uses TF-IDF vectorization and cosine similarity
2. **Course Recommendation System** - Uses collaborative filtering with user-item matrices

## 🏗️ Architecture

```
graduation_project/
├── main_app/                 # FastAPI application
│   └── app.py               # Main application entry point
├── job_recommendation/      # Job recommendation system
│   ├── core/
│   │   ├── data_preprocessor.py    # Job data processing
│   │   └── job_recommender.py      # TF-IDF recommendation engine
│   └── routes/
│       └── job_routes.py           # Job API endpoints
├── course_recommendation/   # Course recommendation system
│   ├── core/
│   │   ├── data_preprocessor.py    # Course data processing
│   │   └── course_recommender.py   # Collaborative filtering engine
│   └── routes/
│       └── course_routes.py        # Course API endpoints
├── utils/                   # Shared utilities
│   └── groq_service.py      # Groq API integration
├── tests/                   # Test suite
│   └── test_system.py       # Comprehensive tests
└── requirements.txt         # Python dependencies
```

## 🚀 Features

### Job Recommendation System
- **TF-IDF Vectorization**: Converts job descriptions into numerical vectors
- **Cosine Similarity**: Finds jobs matching user skills and preferences
- **Skill Gap Analysis**: Identifies missing skills for target positions
- **Personalized Recommendations**: Based on skills, experience, and education

### Course Recommendation System
- **Collaborative Filtering**: User-based and item-based recommendations
- **Synthetic User Data**: Generated interaction matrix for demonstration
- **KNN Algorithm**: Finds similar courses using cosine similarity
- **Rating Prediction**: Estimates course ratings for new users

### AI-Powered Features (Groq Integration)
- **Skill Analysis**: Detailed gap analysis between user skills and job requirements
- **Career Advice**: Personalized career guidance and progression planning
- **Learning Paths**: Structured skill development recommendations
- **Enhanced Descriptions**: AI-generated job and course descriptions

## 📋 Requirements

- Python 3.8+
- FastAPI
- scikit-learn
- pandas
- numpy
- Groq API key

## 🛠️ Installation

1. **Clone and navigate to the project**:
   ```bash
   cd graduation_project
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   export GROQ_API_KEY="your_groq_api_key_here"
   ```

4. **Ensure data files are available**:
   - `../../data/jobs.csv`
   - `../../data/job_skills.csv`
   - `../../data/courses.csv`

## 🚀 Running the Application

### Development Mode
```bash
python main_app/app.py
```

### Production Mode
```bash
uvicorn main_app.app:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Job Recommendations

#### POST `/api/v1/recommend-job`
Get job recommendations based on user profile.

**Request Body**:
```json
{
  "skills": ["python", "machine learning", "data analysis"],
  "experience_years": 2,
  "education": "Bachelor's in Computer Science",
  "top_n": 10
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "title": "Data Scientist",
      "company": "Tech Corp",
      "similarity_score": 0.85,
      "relevance_explanation": "Matches your skills in: python, machine learning"
    }
  ],
  "total_count": 1
}
```

#### GET `/api/v1/job/{job_id}`
Get detailed information about a specific job.

#### GET `/api/v1/job-stats`
Get statistics about the job dataset.

### Course Recommendations

#### POST `/api/v1/recommend-course`
Get course recommendations using collaborative filtering.

**Request Body** (User-based):
```json
{
  "user_id": 0,
  "top_n": 10
}
```

**Request Body** (Item-based):
```json
{
  "user_ratings": {0: 5.0, 1: 4.0, 2: 3.0},
  "top_n": 10
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "title": "Advanced Python Programming",
      "instructor": "Dr. Smith",
      "recommendation_score": 4.5,
      "recommendation_reason": "Based on similar courses you rated"
    }
  ],
  "total_count": 1,
  "recommendation_type": "item-based"
}
```

#### GET `/api/v1/course/{course_id}`
Get detailed information about a specific course.

#### GET `/api/v1/course-stats`
Get statistics about the course dataset.

## 🧪 Testing

### Run All Tests
```bash
pytest tests/test_system.py -v
```

### Run Basic Functionality Tests
```bash
python tests/test_system.py
```

### Test Individual Components
```bash
# Test job recommender
python -c "from job_recommendation.core.job_recommender import JobRecommender; r = JobRecommender(); print('Initialized:', r.initialize())"

# Test course recommender
python -c "from course_recommendation.core.course_recommender import CollaborativeCourseRecommender; r = CollaborativeCourseRecommender(); print('Initialized:', r.initialize())"
```

## 🔧 Configuration

### Environment Variables
- `GROQ_API_KEY`: Your Groq API key for AI features

### Data Paths
The system expects data files in the `../../data/` directory:
- `jobs.csv`: Job listings with columns [title, company, description, requirements, location, salary]
- `job_skills.csv`: Job skills mapping (optional)
- `courses.csv`: Course data with columns [title, description, instructor, category, rating, students]

## 📊 Algorithms Explained

### Job Recommendation (TF-IDF + Cosine Similarity)

1. **Data Preprocessing**:
   - Combine job features into text
   - Clean and normalize text
   - Create TF-IDF vectors

2. **User Profile Creation**:
   - Convert user skills to TF-IDF vector
   - Include experience and education factors

3. **Similarity Calculation**:
   - Cosine similarity between user and job vectors
   - Rank jobs by similarity score

### Course Recommendation (Collaborative Filtering)

1. **User-Item Matrix Creation**:
   - Generate synthetic user-course interactions
   - Create sparse matrix of ratings

2. **Similarity Computation**:
   - User-based: Find similar users
   - Item-based: Find similar courses

3. **Recommendation Generation**:
   - Predict ratings for unrated courses
   - Return top-N recommendations

## 🎯 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| POST | `/api/v1/recommend-job` | Job recommendations |
| GET | `/api/v1/job/{id}` | Job details |
| GET | `/api/v1/job-stats` | Job statistics |
| POST | `/api/v1/recommend-course` | Course recommendations |
| GET | `/api/v1/course/{id}` | Course details |
| GET | `/api/v1/course-stats` | Course statistics |
| POST | `/api/v1/rate-course` | Record course rating |

## 🔍 Monitoring and Debugging

### Logs
The application uses Python's logging module. Logs are output to console with different levels:
- INFO: General information
- WARNING: Warnings
- ERROR: Errors

### Health Checks
- `/health`: Basic health check
- Individual system stats endpoints for detailed monitoring

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main_app.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment
The application can be deployed to:
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure Container Apps
- Heroku

## 📈 Performance Considerations

### Optimization Techniques
- **Preprocessed Data Caching**: Models are saved and loaded from disk
- **Sparse Matrices**: Efficient storage for user-item interactions
- **Batch Processing**: Vectorized operations for similarity calculations
- **Async Processing**: FastAPI's async capabilities for concurrent requests

### Scalability
- **Microservices Architecture**: Separate systems can be scaled independently
- **Database Integration**: Replace CSV files with proper databases for larger datasets
- **Caching Layer**: Redis for frequently accessed data
- **Load Balancing**: Multiple instances behind a load balancer

## 🔐 Security

### API Security
- Input validation using Pydantic models
- CORS configuration for web applications
- Rate limiting (can be added with middleware)

### Data Privacy
- No personal user data stored
- Synthetic data used for demonstrations
- API key required for Groq integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI for the web framework
- scikit-learn for machine learning algorithms
- Groq for AI capabilities
- Open source community for inspiration and tools

---

**Note**: This is a graduation project demonstrating machine learning concepts in recommendation systems. For production use, additional security, monitoring, and scalability measures should be implemented.