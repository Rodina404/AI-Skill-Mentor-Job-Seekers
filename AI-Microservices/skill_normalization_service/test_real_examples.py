#!/usr/bin/env python3
"""
Real-world CV testing script for the Skill Normalization Service.
Tests with realistic CV data and shows normalized output.
"""

import json
import sys
from pathlib import Path
from pprint import pprint

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from core.pipeline import SkillNormalizationPipeline
from core.normalizer import normalize_skills

# ==================== TEST DATA: Real CV Examples ====================

TEST_CASES = [
    {
        "name": "Junior Software Developer",
        "description": "Recent grad with modern tech stack",
        "data": {
            "userId": "dev_001",
            "skills": [
                "Python", "JavaScript", "ReactJS", "SQL Database", 
                "REST APIs", "Git", "Agile", "problem solving"
            ],
            "education": {
                "degree": "Bachelor of Science",
                "field": "Computer Science"
            },
            "experience": {
                "titles": ["Junior Developer", "Intern"],
                "yearsOfExperience": 1
            }
        }
    },
    {
        "name": "Full Stack Engineer",
        "description": "Experienced with messy, real-world skill descriptions",
        "data": {
            "userId": "dev_002",
            "skills": [
                "python3.9+", "typescript", "nodejs backend", 
                "front-end dev", "vue.js", "mongodb database",
                "postgresql sql", "docker containerization",
                "kubernetes orchestration", "aws cloud", "ci/cd pipelines",
                "linux administration", "rest api design"
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
        "name": "Data Scientist",
        "description": "Data science and ML specialist with varied skill names",
        "data": {
            "userId": "ds_001",
            "skills": [
                "python", "ML", "machine learning models", "deep learning",
                "neural networks", "tensorflow", "pytorch", "scikit-learn",
                "pandas dataframes", "numpy", "matplotlib plotting",
                "statistics", "statistical analysis", "sql queries",
                "big data spark", "hadoop", "aws s3", "jupyter"
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
        "name": "DevOps Engineer",
        "description": "Infrastructure and deployment specialist",
        "data": {
            "userId": "devops_001",
            "skills": [
                "docker", "kubernetes k8s", "linux bash shell",
                "aws ec2 s3", "terraform iac", "jenkins ci",
                "ansible automation", "monitoring prometheus",
                "logging elk stack", "nginx web server", "apache",
                "tcp/ip networking", "security ssl tls",
                "git scm", "python scripting"
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
        "name": "Frontend Specialist",
        "description": "Web frontend specialist with design skills",
        "data": {
            "userId": "frontend_001",
            "skills": [
                "HTML CSS", "javascript ES6", "react hooks", "vue.js",
                "angular", "typescript", "webpack bundler",
                "sass styling", "responsive design", "flex grid",
                "api integration", "state management redux",
                "testing jest react-testing-library", "figma design",
                "ux/ui", "accessibility wcag"
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

# ==================== Load Service Data ====================

def load_service_data():
    """Load skills and rules from data files."""
    data_dir = Path(__file__).parent / "data"
    
    skills_file = data_dir / "skills.json"
    rules_file = data_dir / "rules.json"
    
    if not skills_file.exists():
        print(f"❌ ERROR: {skills_file} not found!")
        return None, None
    
    if not rules_file.exists():
        print(f"❌ ERROR: {rules_file} not found!")
        return None, None
    
    with open(skills_file) as f:
        skills_db = json.load(f)
    
    with open(rules_file) as f:
        rules = json.load(f)
    
    print(f"✓ Loaded {len(skills_db)} canonical skills")
    print(f"✓ Loaded {len(rules)} normalization rules")
    
    return skills_db, rules

# ==================== Test Runner ====================

def test_single_case(case, skills_db, rules, pipeline):
    """Test a single CV example."""
    
    print("\n" + "="*80)
    print(f"📝 TEST: {case['name']}")
    print(f"   Description: {case['description']}")
    print("="*80)
    
    cv_data = case['data']
    
    # Show input
    print("\n📥 INPUT CV DATA:")
    print(f"   User ID: {cv_data['userId']}")
    print(f"   Skills: {cv_data['skills']}")
    print(f"   Education: {cv_data['education']}")
    print(f"   Experience: {cv_data['experience']}")
    
    # Run normalization
    try:
        result = pipeline.run(cv_data)
        
        # Show output
        print("\n✅ NORMALIZED OUTPUT:")
        print("\n   User Profile:")
        profile = result.get('data', {}).get('profile', {})
        
        # Skills
        print(f"\n   📊 Skills ({len(profile.get('skills', []))} total):")
        for skill in profile.get('skills', []):
            confidence = skill.get('confidence', 0)
            status = "✓" if confidence >= 0.9 else "◇" if confidence >= 0.7 else "?"
            print(f"      {status} {skill['skillName']:20} → ID: {skill['skillId']:15} (confidence: {confidence:.2f})")
        
        # Statistics
        print(f"\n   📈 Statistics:")
        stats = profile.get('statistics', {})
        print(f"      Total Skills Provided: {stats.get('totalSkillsProvided', 0)}")
        print(f"      Matched Skills: {stats.get('matchedSkills', 0)}")
        print(f"      Unknown Skills: {stats.get('unknownSkills', 0)}")
        match_rate = (stats.get('matchedSkills', 0) / max(stats.get('totalSkillsProvided', 1), 1)) * 100
        print(f"      Match Rate: {match_rate:.1f}%")
        
        # Unknown skills
        unknown = profile.get('statistics', {}).get('unknownSkillsList', [])
        if unknown:
            print(f"\n   ⚠️  Unknown Skills ({len(unknown)}):")
            for skill in unknown[:5]:
                print(f"      - {skill}")
            if len(unknown) > 5:
                print(f"      ... and {len(unknown) - 5} more")
        else:
            print(f"\n   ✓✓ All skills matched!")
        
        # Education & Experience preserved
        print(f"\n   📚 Education:")
        edu = profile.get('education', {})
        print(f"      Degree: {edu.get('degree', 'N/A')}")
        print(f"      Field: {edu.get('field', 'N/A')}")
        
        print(f"\n   💼 Experience:")
        exp = profile.get('experience', {})
        print(f"      Years: {exp.get('yearsOfExperience', 'N/A')}")
        titles = exp.get('jobTitles', [])
        print(f"      Job Titles: {', '.join(titles) if titles else 'N/A'}")
        
        # Validation metrics
        print(f"\n   🎯 VALIDATION METRICS:")
        print(f"      Processing Time: {result.get('processingTimeMs', 0):.0f}ms")
        print(f"      Response Status: {result.get('success', False)}")
        
        return {
            'success': True,
            'total_input': stats.get('totalSkillsProvided', 0),
            'matched': stats.get('matchedSkills', 0),
            'unknown': stats.get('unknownSkills', 0),
            'match_rate': match_rate
        }
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

# ==================== Main ====================

def main():
    """Run all test cases."""
    
    print("\n")
    print("╔" + "="*78 + "╗")
    print("║" + " "*20 + "SKILL NORMALIZATION SERVICE - REAL CV TESTS" + " "*15 + "║")
    print("╚" + "="*78 + "╝")
    
    # Load data
    skills_db, rules = load_service_data()
    if not skills_db or not rules:
        return
    
    # Initialize pipeline
    try:
        pipeline = SkillNormalizationPipeline(skills_db, rules)
        print("✓ Pipeline initialized")
    except Exception as e:
        print(f"❌ Failed to initialize pipeline: {e}")
        return
    
    # Run test cases
    results = []
    for case in TEST_CASES:
        result = test_single_case(case, skills_db, rules, pipeline)
        result['name'] = case['name']
        results.append(result)
    
    # Summary
    print("\n" + "="*80)
    print("📊 SUMMARY")
    print("="*80)
    
    total_inputs = sum(r.get('total_input', 0) for r in results if r.get('success'))
    total_matched = sum(r.get('matched', 0) for r in results if r.get('success'))
    total_unknown = sum(r.get('unknown', 0) for r in results if r.get('success'))
    
    if total_inputs > 0:
        overall_match_rate = (total_matched / total_inputs) * 100
    else:
        overall_match_rate = 0
    
    print(f"\n✓ Tests Run: {len([r for r in results if r.get('success')])} successful")
    print(f"\n📈 Aggregated Results:")
    print(f"   Total Skills Provided: {total_inputs}")
    print(f"   Successfully Matched: {total_matched}")
    print(f"   Could Not Match: {total_unknown}")
    print(f"   Overall Match Rate: {overall_match_rate:.1f}%")
    
    print(f"\n📋 Per-Test Results:")
    for result in results:
        if result.get('success'):
            status = "✓"
            rate = result.get('match_rate', 0)
            print(f"   {status} {result['name']:25} → {rate:5.1f}% match ({result['matched']}/{result['total_input']})")
        else:
            print(f"   ✗ {result['name']:25} → FAILED: {result.get('error', 'Unknown error')}")
    
    print("\n" + "="*80)
    
    # Quality assessment
    print("\n🎯 QUALITY ASSESSMENT:")
    if overall_match_rate >= 95:
        print("   ✓✓ EXCELLENT - Nearly perfect matching")
    elif overall_match_rate >= 85:
        print("   ✓ GOOD - High quality normalization")
    elif overall_match_rate >= 70:
        print("   ◇ FAIR - Some skills unrecognized")
    else:
        print("   ? POOR - Many unrecognized skills")
    
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()
