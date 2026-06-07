#!/usr/bin/env python3
"""
Test Suite for Skill Normalization FastAPI Service Endpoint
Tests POST /run endpoint with real-world CV data
"""

import json
import sys
import subprocess
import time
from pathlib import Path

# Test data with real CV examples
TEST_PAYLOADS = [
    {
        "name": "Full Stack Engineer",
        "request": {
            "userId": "dev_001",
            "skills": [
                "python3.9+", "typescript", "nodejs backend",
                "vue.js", "mongodb database", "postgresql sql",
                "docker containerization", "kubernetes orchestration",
                "aws cloud", "ci/cd pipelines", "linux administration",
                "rest api design", "agile methodology"
            ],
            "education": {
                "degree": "Bachelor",
                "field": "Software Engineering"
            },
            "experience": {
                "titles": ["Senior Developer", "Tech Lead"],
                "yearsOfExperience": 6
            }
        }
    },
    {
        "name": "DevOps Engineer",
        "request": {
            "userId": "devops_001",
            "skills": [
                "docker", "kubernetes k8s", "linux bash shell",
                "aws ec2 s3", "terraform iac", "jenkins ci",
                "ansible automation", "prometheus monitoring",
                "logging elk stack", "nginx web server",
                "ssl tls security", "git scm", "python scripting",
                "ci cd pipelines", "monitoring"
            ],
            "education": {
                "degree": "Bachelor",
                "field": "Computer Science"
            },
            "experience": {
                "titles": ["DevOps Engineer", "Site Reliability Engineer"],
                "yearsOfExperience": 5
            }
        }
    },
    {
        "name": "Data Scientist",
        "request": {
            "userId": "ds_001",
            "skills": [
                "python", "machine learning", "deep learning",
                "neural networks", "tensorflow", "pytorch",
                "scikit-learn", "pandas", "numpy",
                "matplotlib", "jupyter notebook", "statistics",
                "big data spark", "hadoop", "aws s3",
                "sql", "data visualization"
            ],
            "education": {
                "degree": "Master's",
                "field": "Data Science"
            },
            "experience": {
                "titles": ["Data Scientist", "ML Engineer"],
                "yearsOfExperience": 4
            }
        }
    },
    {
        "name": "Frontend Developer",
        "request": {
            "userId": "frontend_001",
            "skills": [
                "html css", "javascript es6", "react hooks",
                "vue.js", "angular", "typescript",
                "webpack bundler", "sass styling",
                "responsive design", "flexbox", "css grid",
                "jest testing", "react testing library",
                "figma design", "web accessibility",
                "redux state management", "graphql"
            ],
            "education": {
                "degree": "Bootcamp",
                "field": "Web Development"
            },
            "experience": {
                "titles": ["Frontend Developer", "UI Developer"],
                "yearsOfExperience": 3
            }
        }
    }
]

def test_endpoint(base_url: str, test_payload: dict) -> dict:
    """Test a single endpoint request."""
    
    name = test_payload['name']
    request_data = test_payload['request']
    
    print(f"\n{'='*80}")
    print(f"📝 TESTING: {name}")
    print(f"{'='*80}")
    
    print(f"\n📥 REQUEST:")
    print(f"   URL: POST {base_url}/run")
    print(f"   User ID: {request_data['userId']}")
    print(f"   Skills: {len(request_data['skills'])} items")
    print(f"   First 3 skills: {', '.join(request_data['skills'][:3])}")
    
    try:
        import requests
        
        response = requests.post(
            f"{base_url}/run",
            json=request_data,
            timeout=10
        )
        
        print(f"\n📤 RESPONSE:")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"   Status: ✓ SUCCESS")
            
            # Extract profile info
            profile = data.get('data', {}).get('profile', {})
            skills = profile.get('skills', [])
            stats = profile.get('statistics', {})
            
            print(f"\n   📊 RESULTS:")
            print(f"      Skills Provided: {stats.get('totalSkillsProvided', 0)}")
            print(f"      Skills Matched: {stats.get('matchedSkills', 0)}")
            print(f"      Skills Unknown: {stats.get('unknownSkills', 0)}")
            
            total = stats.get('totalSkillsProvided', 1)
            matched = stats.get('matchedSkills', 0)
            match_rate = (matched / total * 100) if total > 0 else 0
            print(f"      Match Rate: {match_rate:.1f}%")
            
            print(f"\n   📋 MATCHED SKILLS (top 5):")
            for skill in sorted(skills, key=lambda x: x.get('confidence', 0), reverse=True)[:5]:
                conf = skill.get('confidence', 0)
                confidence_indicator = "✓" if conf >= 0.9 else "◇" if conf >= 0.7 else "?"
                print(f"      {confidence_indicator} {skill.get('skillName', 'Unknown'):20} (conf: {conf:.2f})")
            
            if len(skills) > 5:
                print(f"      ... and {len(skills) - 5} more skills")
            
            # Unknown skills
            unknown = stats.get('unknownSkillsList', [])
            if unknown:
                print(f"\n   ⚠️  UNKNOWN SKILLS ({len(unknown)}):")
                for skill in unknown[:3]:
                    print(f"      - {skill}")
                if len(unknown) > 3:
                    print(f"      ... and {len(unknown) - 3} more")
            else:
                print(f"\n   ✓✓ ALL SKILLS MATCHED!")
            
            # Processing time
            proc_time = data.get('processingTimeMs', 0)
            print(f"\n   ⏱️  Processing Time: {proc_time:.0f}ms")
            
            return {
                'success': True,
                'name': name,
                'match_rate': match_rate,
                'matched': matched,
                'total': total,
                'unknown_count': len(unknown)
            }
        
        elif response.status_code == 422:
            print(f"   Status: ✗ VALIDATION ERROR")
            print(f"   Details: {response.json()}")
            return {'success': False, 'name': name, 'error': 'Validation error'}
        
        else:
            print(f"   Status: ✗ ERROR ({response.status_code})")
            print(f"   Response: {response.text}")
            return {'success': False, 'name': name, 'error': f'HTTP {response.status_code}'}
    
    except ImportError:
        print(f"\n   ❌ ERROR: requests library not installed")
        print(f"   Run: pip install requests")
        return {'success': False, 'name': name, 'error': 'Missing requests library'}
    
    except Exception as e:
        print(f"\n   ❌ ERROR: {str(e)}")
        return {'success': False, 'name': name, 'error': str(e)}

def main():
    """Run endpoint tests."""
    
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("⚠️  Installing requests library...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
        import requests
    
    print("\n")
    print("╔" + "="*78 + "╗")
    print("║" + " "*15 + "SKILL NORMALIZATION SERVICE - ENDPOINT TESTS" + " "*20 + "║")
    print("╚" + "="*78 + "╝")
    
    BASE_URL = "http://localhost:8003"
    
    print(f"\n🔗 API Endpoint: {BASE_URL}")
    print(f"📍 Testing: POST /run")
    
    # First, check if service is running
    print(f"\n✓ Checking service health...")
    try:
        import requests
        health_response = requests.get(f"{BASE_URL}/health", timeout=5)
        if health_response.status_code == 200:
            health = health_response.json()
            print(f"   ✓ Service is running")
            print(f"   Service: {health.get('service', 'Unknown')}")
            print(f"   Version: {health.get('version', 'Unknown')}")
        else:
            print(f"   ✗ Service returned status {health_response.status_code}")
            print(f"\n⚠️  Please start the service with:")
            print(f"    cd skill_normalization_service")
            print(f"    python -m uvicorn main:app --reload")
            return
    except Exception as e:
        print(f"   ✗ Service not running: {str(e)}")
        print(f"\n⚠️  Please start the service with:")
        print(f"    cd skill_normalization_service")
        print(f"    python -m uvicorn main:app --reload")
        return
    
    # Run tests
    results = []
    for test_payload in TEST_PAYLOADS:
        result = test_endpoint(BASE_URL, test_payload)
        results.append(result)
    
    # Summary
    print(f"\n\n{'='*80}")
    print(f"📊 SUMMARY")
    print(f"{'='*80}")
    
    successful = [r for r in results if r.get('success')]
    failed = [r for r in results if not r.get('success')]
    
    print(f"\n✓ Successful Tests: {len(successful)}/{len(results)}")
    
    if successful:
        total_inputs = sum(r.get('total', 0) for r in successful)
        total_matched = sum(r.get('matched', 0) for r in successful)
        overall_rate = (total_matched / total_inputs * 100) if total_inputs > 0 else 0
        
        print(f"\n📈 AGGREGATED RESULTS:")
        print(f"   Total Skills: {total_inputs}")
        print(f"   Matched: {total_matched}")
        print(f"   Overall Match Rate: {overall_rate:.1f}%")
        
        print(f"\n📋 PER-TEST RESULTS:")
        for result in successful:
            print(f"   ✓ {result['name']:25} → {result.get('match_rate', 0):5.1f}% ({result.get('matched', 0)}/{result.get('total', 0)})")
    
    if failed:
        print(f"\n✗ Failed Tests: {len(failed)}")
        for result in failed:
            print(f"   ✗ {result['name']:25} → {result.get('error', 'Unknown error')}")
    
    print(f"\n{'='*80}\n")

if __name__ == "__main__":
    main()
