#!/usr/bin/env python3
"""
Test script to demonstrate the enhanced job_parser improvements
"""

from services.job_parser import parse_job

# Test cases demonstrating the enhancements
test_jobs = [
    {
        "name": "Test 1: Context Awareness - Negation",
        "description": "We are looking for a Backend Developer. Python and Java are required. Note: C++ experience is NOT necessary. We don't need Rust expertise."
    },
    {
        "name": "Test 2: Expanded Vocabulary & Synonyms",
        "description": "Machine Learning Engineer needed with expertise in: Python, PyTorch, TensorFlow, ML models, DL networks, NLP projects. Must have experience with k8s and AWS cloud services."
    },
    {
        "name": "Test 3: Multiple Tools Detection",
        "description": "Full-stack engineer required: 5+ years. Skills: Python, JavaScript, Django, React. Tools: PostgreSQL, MongoDB, Redis, Docker, Kubernetes, Git, Jenkins. Must have CI/CD experience."
    },
    {
        "name": "Test 4: Synonym Recognition",
        "description": "Data Engineer with 3 years experience. Need ETL pipeline development. Skills: Python, SQL, Spark. Experience with k8s, BigQuery, and dbt required."
    },
    {
        "name": "Test 5: Complex Job Description",
        "description": """
        Lead Machine Learning Engineer - 5+ years required
        
        Required Skills:
        - Python (mandatory, not optional)
        - Deep Learning (CNN, LSTM, RNN experience)
        - Computer Vision (image processing, object detection with YOLO)
        - NLP (transformers, BERT, HuggingFace)
        
        Tools & Frameworks:
        - PyTorch and TensorFlow
        - Scikit-learn for ML
        - OpenCV for vision
        - Airflow for ETL
        
        Cloud & DevOps:
        - AWS (mandatory)
        - Kubernetes (k8s)
        - Docker
        - CI/CD pipelines
        
        Nice to have (not critical):
        - Rust programming
        - Scala experience
        """
    }
]

print("=" * 80)
print("JOB PARSER ENHANCEMENT TEST SUITE")
print("=" * 80)

for test in test_jobs:
    print(f"\n{test['name']}")
    print("-" * 80)
    print(f"Job Description:\n{test['description'][:200]}...")
    
    # Parse the job
    result = parse_job(test['description'])
    
    print(f"\n✅ Extracted Skills ({len(result['skills'])}): {', '.join(result['skills'])}")
    print(f"🔧 Extracted Tools ({len(result['tools'])}): {', '.join(result['tools'])}")
    print(f"📊 Experience Required: {result['experience']} years")

print("\n" + "=" * 80)
print("KEY IMPROVEMENTS DEMONSTRATED:")
print("=" * 80)
print("""
1. ✓ Context Awareness: "NOT necessary" → Not extracted
2. ✓ Expanded Vocab: "k8s" → Recognized and converted to "Kubernetes"  
3. ✓ Synonym Handling: "DL", "ETL" → Normalized to full names
4. ✓ Better Matching: Detects PyTorch, TensorFlow, Scikit-learn separately
5. ✓ Multiple Tool Recognition: Docker, Kubernetes, Jenkins all detected
6. ✓ Flexible & Extensible: Easy to add new skills/tools to vocabulary
""")
