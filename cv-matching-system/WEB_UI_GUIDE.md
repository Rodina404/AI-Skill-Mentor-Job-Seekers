# CV Matching System - Web UI Guide

## Quick Start

### Running the Web Application

1. **Install Flask** (if not already installed):
```bash
pip install flask flask-cors
```

2. **Start the web server**:
```bash
python run_web.py
```

3. **Open your browser**:
```
http://localhost:5000
```

## Features

### 🎯 Matcher Page (Home)
The main page for matching candidates to job descriptions.

**How to use:**
1. Enter a job description in the text area
2. Click "Match Candidates" button
3. Results are ranked by match score (highest first)
4. Each result shows:
   - Candidate name
   - Match percentage (0-100%)
   - Experience level
   - Top skills

**Tips for better results:**
- Use detailed job descriptions
- Include required skills and experience
- Mention specific tools/technologies
- Be specific about experience requirements

### 👥 Candidates Page
Browse all available candidates in the system.

**Information shown:**
- Name
- Years of experience
- Education background
- Technical skills
- Tools and technologies

### 📊 Results Display

Results are ranked by match score:

| Score | Color | Meaning |
|-------|-------|---------|
| 75-100% | Green | Excellent match |
| 50-74% | Orange | Good match |
| 0-49% | Red | Potential match |

## API Endpoints

The application also provides REST APIs for programmatic access:

### 1. Match Candidates
```
POST /api/match
Content-Type: application/json

{
  "job_description": "Machine Learning Engineer with 3+ years Python experience..."
}

Response:
{
  "success": true,
  "timestamp": "2024-04-13T10:30:45.123456",
  "candidates_count": 15,
  "results": [
    {
      "name": "Fatima Ahmad",
      "score": 87.5,
      "experience": 4,
      "skills": ["Python", "Machine Learning", "TensorFlow"]
    },
    ...
  ]
}
```

### 2. Get All Candidates
```
GET /api/candidates

Response:
{
  "success": true,
  "count": 15,
  "candidates": [
    {
      "id": 1,
      "name": "Ahmed Hassan",
      "skills": ["Python", "Machine Learning"],
      "experience": 1,
      "tools": ["PyTorch"],
      "education": "BS Computer Science"
    },
    ...
  ]
}
```

### 3. Health Check
```
GET /api/health

Response:
{
  "status": "healthy",
  "candidates_loaded": 15,
  "timestamp": "2024-04-13T10:30:45.123456"
}
```

## Using the Web UI

### Example 1: Find ML Engineers
```
Job Description:
"Looking for experienced Machine Learning Engineer.
Required: Python, TensorFlow, 3+ years
Preferred: AWS, Deep Learning, Computer Vision"
```

Expected top matches: Fatima Ahmad, Layla Noor, Amr Shawky

### Example 2: Find Data Engineers
```
Job Description:
"Data Engineer needed.
Tech Stack: SQL, Apache Spark, ETL, Airflow
Experience: 4+ years"
```

Expected top match: Hassan Amr

### Example 3: Find Full Stack Developer
```
Job Description:
"Full-stack web developer.
Backend: Java, Spring Boot, PostgreSQL
DevOps: Docker, Kubernetes
Experience: 3+ years"
```

Expected top match: Karim Yusuf

## URL Paths

| Path | Description |
|------|-------------|
| `/` | Home page with matcher form |
| `/candidates` | Browse all candidates |
| `/api/match` | REST API for matching |
| `/api/candidates` | REST API for candidates list |
| `/api/health` | Health check endpoint |

## Configuration

Advanced configuration can be modified in `config.py`:

### Scoring Weights
```python
SCORING_WEIGHTS = {
    "semantic_similarity": 0.40,
    "skill_match": 0.35,
    "tools_match": 0.15,
    "experience": 0.10
}
```

### Matching Thresholds
```python
SKILL_MATCH_THRESHOLD = 80
TOOL_MATCH_THRESHOLD = 75
```

### Change in `web_app.py` to modify server settings:
```python
app.run(
    host='127.0.0.1',  # Only local access
    port=5000,         # Port number
    debug=True,        # Debug mode
)
```

## Integration with Other Systems

### Example: Python Script Integration
```python
import requests

job_description = "Machine Learning Engineer with Python experience"

response = requests.post(
    'http://localhost:5000/api/match',
    json={'job_description': job_description}
)

results = response.json()
for candidate in results['results']:
    print(f"{candidate['name']}: {candidate['score']}%")
```

### Example: cURL Command
```bash
curl -X POST http://localhost:5000/api/match \
  -H "Content-Type: application/json" \
  -d '{"job_description":"Python developer with 3 years experience"}'
```

### Example: JavaScript/Fetch
```javascript
const jobDesc = "Senior ML Engineer with TensorFlow";

fetch('/api/match', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({job_description: jobDesc})
})
.then(r => r.json())
.then(data => console.log(data.results));
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, modify `run_web.py`:
```python
app.run(port=5001)  # Use different port
```

### CORS Issues
If integrating from a different domain, enable CORS in `web_app.py`:
```python
from flask_cors import CORS
CORS(app)
```

### Missing Templates
Make sure `templates/` folder exists with all HTML files:
- `base.html`
- `index.html`
- `candidates.html`
- `404.html`
- `500.html`

### Dependencies Not Installed
```bash
pip install flask flask-cors
pip install -r requirements.txt
```

## Performance Tips

1. **Cache Results**: Results are usually ready in 2-5 seconds
2. **Vector Store**: First run takes 30-60s, subsequent runs are faster
3. **Large Job List**: If matching against many jobs, consider:
   - Using API in batch mode
   - Implementing database caching
   - Running on more powerful machine

## Security Considerations

For production deployment:

1. **Disable Debug Mode**:
```python
app.run(debug=False)
```

2. **Set Secret Key**:
```python
app.secret_key = 'your-secret-key-here'
```

3. **Use Environment Variables**:
```python
import os
SECRET_KEY = os.environ.get('SECRET_KEY', 'default-key')
```

4. **HTTPS**: Deploy behind reverse proxy (nginx/Apache) with SSL

## Deployment

### Docker Deployment (Example)
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run_web.py"]
```

### Heroku Deployment (Example)
```bash
heroku create cv-matcher-app
git push heroku main
heroku open
```

## Logging

All activities are logged to `web_app.log`:
```
2024-04-13 10:15:23 - web_app - INFO - User accessed homepage
2024-04-13 10:15:45 - web_app - INFO - API match request received
2024-04-13 10:16:01 - web_app - INFO - Matching completed: 15 candidates ranked
```

## Support

For issues or questions:
1. Check `web_app.log` for error messages
2. Check browser console (F12) for frontend errors
3. Verify all dependencies are installed
4. Ensure candidates data is properly loaded
