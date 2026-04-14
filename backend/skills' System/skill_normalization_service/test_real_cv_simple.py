#!/usr/bin/env python3
"""
Real-world CV testing script - PURE PYTHON VERSION
Tests skill normalization without external dependencies.
"""

import json
import sys
from pathlib import Path
from pprint import pprint
from typing import Dict, List, Any

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

# ==================== Simple Normalization Logic ====================

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

def normalize_input_skill(skill: str, rules: Dict, skills_by_name: Dict) -> tuple:
    """
    Normalize a single skill using rules (L1 mapping).
    Returns (matched_skill_id, skill_name, confidence)
    """
    skill_normalized = skill.lower().strip()
    
    # Direct match in rules
    if skill_normalized in rules:
        canonical_name = rules[skill_normalized]
        skill_obj = skills_by_name.get(canonical_name)
        if skill_obj:
            return (skill_obj['id'], skill_obj['name'], 1.0)
    
    # Try common variations
    variations = [
        skill_normalized.replace("_", " "),
        skill_normalized.replace("-", " "),
        skill_normalized.split()[0] if " " in skill_normalized else None,
    ]
    
    for variation in variations:
        if variation and variation in rules:
            canonical_name = rules[variation]
            skill_obj = skills_by_name.get(canonical_name)
            if skill_obj:
                return (skill_obj['id'], skill_obj['name'], 0.9)
    
    # Partial match - check if skill contains any key from rules
    for key, canonical_name in rules.items():
        if len(key) > 2:  # Avoid single letter matches
            if key in skill_normalized or skill_normalized in key:
                skill_obj = skills_by_name.get(canonical_name)
                if skill_obj:
                    return (skill_obj['id'], skill_obj['name'], 0.7)
    
    return (None, skill, 0.0)  # Unknown skill

def normalize_skills_batch(skills: List[str], rules: Dict, skills_by_name: Dict) -> tuple:
    """
    Normalize multiple skills.
    Returns (matched_skills, unknown_skills)
    """
    matched = []
    unknown = []
    
    for skill in skills:
        skill_id, normalized_name, confidence = normalize_input_skill(skill, rules, skills_by_name)
        
        if skill_id:
            matched.append({
                'originalSkill': skill,
                'skillName': normalized_name,
                'skillId': skill_id,
                'confidence': confidence
            })
        else:
            unknown.append(skill)
    
    # Deduplicate matched skills (keep highest confidence)
    seen_ids = {}
    for skill in matched:
        skill_id = skill['skillId']
        if skill_id not in seen_ids or skill['confidence'] > seen_ids[skill_id]['confidence']:
            seen_ids[skill_id] = skill
    
    return list(seen_ids.values()), unknown

# ==================== Test Runner ====================

def test_single_case(case, skills_db, rules):
    """Test a single CV example."""
    
    # Create mapping of skill names to skill objects
    skills_by_name = {skill['name']: skill for skill in skills_db}
    
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
        input_skills = cv_data['skills']
        matched, unknown = normalize_skills_batch(input_skills, rules, skills_by_name)
        
        # Show output
        print("\n✅ NORMALIZED OUTPUT:")
        print("\n   User Profile:")
        
        # Skills
        print(f"\n   📊 Skills ({len(matched)} matched):")
        for skill in sorted(matched, key=lambda x: x['confidence'], reverse=True):
            confidence = skill.get('confidence', 0)
            status = "✓" if confidence >= 0.9 else "◇" if confidence >= 0.7 else "?"
            orig = skill.get('originalSkill', '')
            print(f"      {status} {skill['skillName']:20} ← '{orig}':15 (ID: {skill['skillId']:10}, conf: {confidence:.2f})")
        
        # Statistics
        print(f"\n   📈 Statistics:")
        total = len(input_skills)
        matched_count = len(matched)
        unknown_count = len(unknown)
        match_rate = (matched_count / max(total, 1)) * 100
        
        print(f"      Total Skills Provided: {total}")
        print(f"      Matched Skills: {matched_count}")
        print(f"      Unknown/Unmatched: {unknown_count}")
        print(f"      Match Rate: {match_rate:.1f}%")
        
        # Unknown skills
        if unknown:
            print(f"\n   ⚠️  Could Not Match ({len(unknown)} skills):")
            for skill in unknown[:8]:
                print(f"      - {skill}")
            if len(unknown) > 8:
                print(f"      ... and {len(unknown) - 8} more")
        else:
            print(f"\n   ✓✓ All skills successfully matched!")
        
        # Education & Experience preserved
        print(f"\n   📚 Education:")
        edu = cv_data.get('education', {})
        print(f"      Degree: {edu.get('degree', 'N/A')}")
        print(f"      Field: {edu.get('field', 'N/A')}")
        
        print(f"\n   💼 Experience:")
        exp = cv_data.get('experience', {})
        years = exp.get('yearsOfExperience', 'N/A')
        print(f"      Years: {years}")
        titles = exp.get('titles', [])
        print(f"      Job Titles: {', '.join(titles) if titles else 'N/A'}")
        
        return {
            'success': True,
            'name': case['name'],
            'total_input': total,
            'matched': matched_count,
            'unknown': unknown_count,
            'match_rate': match_rate
        }
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e), 'name': case['name']}

# ==================== Main ====================

def main():
    """Run all test cases."""
    
    print("\n")
    print("╔" + "="*78 + "╗")
    print("║" + " "*15 + "SKILL NORMALIZATION SERVICE - REAL CV TESTING (Pure Python)" + " "*3 + "║")
    print("╚" + "="*78 + "╝")
    
    # Load data
    skills_db, rules = load_service_data()
    if not skills_db or not rules:
        return
    
    # Run test cases
    results = []
    for case in TEST_CASES:
        result = test_single_case(case, skills_db, rules)
        results.append(result)
    
    # Summary
    print("\n" + "="*80)
    print("📊 SUMMARY & QUALITY VALIDATION")
    print("="*80)
    
    successful = [r for r in results if r.get('success')]
    total_inputs = sum(r.get('total_input', 0) for r in successful)
    total_matched = sum(r.get('matched', 0) for r in successful)
    total_unknown = sum(r.get('unknown', 0) for r in successful)
    
    if total_inputs > 0:
        overall_match_rate = (total_matched / total_inputs) * 100
    else:
        overall_match_rate = 0
    
    print(f"\n✓ Tests Run: {len(successful)}/{len(results)} successful")
    print(f"\n📈 AGGREGATED RESULTS:")
    print(f"   Total Skills Across All CVs: {total_inputs}")
    print(f"   Successfully Matched: {total_matched}")
    print(f"   Could Not Match: {total_unknown}")
    print(f"   👉 OVERALL MATCH RATE: {overall_match_rate:.1f}%")
    
    print(f"\n📋 PER-TEST RESULTS:")
    print(f"   {'Test Name':<25} {'Match Rate':<15} {'Matched':<10} {'Unknown':<10}")
    print("   " + "-"*60)
    for result in successful:
        rate = result.get('match_rate', 0)
        matched = result.get('matched', 0)
        total = result.get('total_input', 0)
        name = result.get('name', 'Unknown')[:25]
        print(f"   {name:<25} {rate:5.1f}% {' ':<8} {matched} / {total:<6}")
    
    print("\n" + "="*80)
    
    # Quality assessment
    print("\n🎯 ACCURACY & QUALITY ASSESSMENT:")
    if overall_match_rate >= 95:
        print("   ✓✓ EXCELLENT - Near-perfect normalization")
        print("      - Service can confidently normalize most real-world CVs")
        print("      - Very few unmatched skills (edge cases or misspellings)")
    elif overall_match_rate >= 85:
        print("   ✓ GOOD - High quality normalization")
        print("      - Service handles most real-world skill variations well")
        print("      - Some specialized or non-standard terms may not match")
    elif overall_match_rate >= 70:
        print("   ◇ FAIR - Acceptable normalization")
        print("      - Service works but misses some skill variations")
        print("      - Rules database may need expansion")
    else:
        print("   ? POOR - Normalization needs improvement")
        print("      - Many skills not recognized")
        print("      - Rules database insufficient for real-world use")
    
    print("\n🔍 INSIGHTS:")
    avg_match_rate = sum(r.get('match_rate', 0) for r in successful) / len(successful) if successful else 0
    print(f"   - Average per-test match rate: {avg_match_rate:.1f}%")
    print(f"   - Best performing test: {max(successful, key=lambda x: x.get('match_rate', 0)).get('name', 'N/A')} ({max(r.get('match_rate', 0) for r in successful):.1f}%)")
    print(f"   - Worst performing test: {min(successful, key=lambda x: x.get('match_rate', 0)).get('name', 'N/A')} ({min(r.get('match_rate', 0) for r in successful):.1f}%)")
    
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()
