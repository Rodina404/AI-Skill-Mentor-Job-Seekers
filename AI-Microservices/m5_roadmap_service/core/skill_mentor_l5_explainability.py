"""
AI Skill Mentor - L5 Explainability LLM
=========================================

L5: Generate short, grounded explanations using LLM API.

Supports:
- Qwen models (via OpenAI-compatible API)
- Anthropic Claude (optional)
- Rule-based fallback when API unavailable

Features:
- Skill gap explanations
- Course recommendation explanations
- Roadmap structure explanations
- Response caching
"""

import hashlib
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional

from skill_mentor_config import Config, default_config
from skill_mentor_utils import header, ok, info, warn, safe_print, SimpleCache


# Try to import openai for Qwen (primary)
OPENAI_AVAILABLE = False
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    pass

# Try to import anthropic (fallback)
ANTHROPIC_AVAILABLE = False
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    pass


class ExplainabilityLLM:
    """
    L5: Explainability module using LLM API.
    
    Supports Qwen (via OpenAI-compatible API) or Claude.
    
    Generates grounded explanations for:
    - Why a skill gap was detected
    - Why a specific course was recommended
    - Why the roadmap is structured a certain way
    
    Falls back to rule-based explanations if API is unavailable.
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self._client = None
        self._api_available = False
        self._provider = None  # 'qwen', 'anthropic', or None
        self._cache = SimpleCache(
            ttl_seconds=self.config.explainability.cache_ttl_hours * 3600
        )
        
        # Check API availability
        self._check_api()
    
    @property
    def api_available(self) -> bool:
        """Check if any LLM API is available."""
        return self._api_available
    
    @property
    def provider(self) -> Optional[str]:
        """Get current LLM provider."""
        return self._provider
    
    def _check_api(self) -> bool:
        """Validate API key and initialize client."""
        # Try Qwen first (via OpenAI-compatible API)
        qwen_key = os.environ.get("QWEN_API_KEY") or os.environ.get("DASHSCOPE_API_KEY")
        qwen_base_url = os.environ.get("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
        
        if qwen_key and OPENAI_AVAILABLE:
            try:
                self._client = openai.OpenAI(
                    api_key=qwen_key,
                    base_url=qwen_base_url
                )
                self._api_available = True
                self._provider = "qwen"
                ok("Qwen API key found - Explainability LLM enabled (Qwen)")
                return True
            except Exception as e:
                warn(f"Qwen client init failed ({e})")
        
        # Try OpenAI-compatible endpoint (generic)
        openai_key = os.environ.get("OPENAI_API_KEY")
        openai_base = os.environ.get("OPENAI_BASE_URL")
        
        if openai_key and OPENAI_AVAILABLE:
            try:
                kwargs = {"api_key": openai_key}
                if openai_base:
                    kwargs["base_url"] = openai_base
                self._client = openai.OpenAI(**kwargs)
                self._api_available = True
                self._provider = "openai"
                ok(f"OpenAI API key found - Explainability LLM enabled")
                return True
            except Exception as e:
                warn(f"OpenAI client init failed ({e})")
        
        # Try Anthropic as fallback
        anthropic_key = self.config.network.anthropic_api_key
        
        if anthropic_key and ANTHROPIC_AVAILABLE:
            try:
                self._client = anthropic.Anthropic(api_key=anthropic_key)
                self._api_available = True
                self._provider = "anthropic"
                ok("Anthropic API key found - Explainability LLM enabled (Claude)")
                return True
            except Exception as e:
                warn(f"Anthropic client init failed ({e})")
        
        # No API available
        warn("No LLM API key found - using rule-based fallback for L5")
        warn("To enable LLM, set one of: QWEN_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY")
        self._api_available = False
        self._provider = None
        return False
    
    def explain_gap(
        self,
        gap: Dict,
        course: Dict
    ) -> Dict:
        """
        Generate explanation for a skill gap and course recommendation.
        
        Args:
            gap: Skill gap dictionary
            course: Recommended course dictionary
            
        Returns:
            Dictionary with skill_explanation and course_explanation
        """
        # Check cache first
        cache_key = self._make_cache_key(gap, course)
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached
        
        # Build context
        context = self._build_gap_context(gap, course)
        
        # Try LLM
        if self._api_available:
            result = self._call_llm(context)
            if result:
                self._cache.set(cache_key, result)
                return result
        
        # Fall back to rule-based
        result = self._rule_based_gap_explanation(gap, course)
        self._cache.set(cache_key, result)
        return result
    
    def _build_gap_context(self, gap: Dict, course: Dict) -> str:
        """Build context prompt for gap explanation."""
        return f"""
SKILL GAP DETECTED:
  Skill: {gap.get('skill', 'Unknown')}
  Gap score: {gap.get('gap_score', 0.8)} (1.0 = completely missing, 0.0 = already have it)
  Best match in user's current skills: "{gap.get('best_match', 'none')}" (similarity: {gap.get('similarity', 0.0)})
  Market frequency: {gap.get('market_freq', 'N/A')} of job postings require this skill
  Priority: {gap.get('priority', 'medium')}

RECOMMENDED COURSE:
  Title: {course.get('title', 'Unknown')}
  Platform: {course.get('platform', 'Unknown')}
  Rating: {course.get('rating', 4.5)}/5.0 ({course.get('reviews', 0):,} reviews)
  Duration: {course.get('hours', 0)} hours (source: {course.get('hours_source', 'unknown')})
  Skills taught: {', '.join(course.get('skills_taught', []))}
  URL: {course.get('url', '')}

Generate a JSON object with:
- "skill_explanation": Why this skill gap matters and was flagged (2-3 sentences)
- "course_explanation": Why this specific course was recommended (2-3 sentences)
"""
    
    def _call_llm(self, context: str) -> Optional[Dict]:
        """Call LLM API for explanation (Qwen/OpenAI or Claude)."""
        if not self._api_available:
            return None
        
        try:
            if self._provider in ("qwen", "openai"):
                # OpenAI-compatible API (Qwen, OpenAI, etc.)
                model = self._get_model_name()
                response = self._client.chat.completions.create(
                    model=model,
                    max_tokens=self.config.explainability.max_tokens_per_explanation,
                    messages=[
                        {"role": "system", "content": self.config.explainability.system_prompt},
                        {"role": "user", "content": context}
                    ]
                )
                text = response.choices[0].message.content.strip()
                
            elif self._provider == "anthropic":
                # Anthropic Claude API
                response = self._client.messages.create(
                    model=self.config.explainability.model_name,
                    max_tokens=self.config.explainability.max_tokens_per_explanation,
                    system=self.config.explainability.system_prompt,
                    messages=[{"role": "user", "content": context}]
                )
                text = response.content[0].text.strip()
            else:
                return None
            
            # Clean markdown fences
            text = re.sub(r"```json\s*|\s*```", "", text).strip()
            
            return json.loads(text)
            
        except json.JSONDecodeError as e:
            warn(f"LLM response not valid JSON: {e}")
            return None
        except Exception as e:
            warn(f"LLM call failed ({e}) - using rule-based fallback")
            return None
    
    def _get_model_name(self) -> str:
        """Get appropriate model name for provider."""
        if self._provider == "qwen":
            # Qwen model names
            qwen_model = os.environ.get("QWEN_MODEL", "qwen-turbo")
            return qwen_model
        elif self._provider == "openai":
            # Check for custom model in env
            return os.environ.get("OPENAI_MODEL", "gpt-3.5-turbo")
        else:
            return self.config.explainability.model_name
    
    def _rule_based_gap_explanation(
        self,
        gap: Dict,
        course: Dict
    ) -> Dict:
        """Generate rule-based explanation (fallback)."""
        priority_labels = {
            "high": "highly critical",
            "medium": "moderately important",
            "low": "nice to have",
        }
        prio_label = priority_labels.get(
            gap.get("priority", "medium"),
            "important"
        )
        
        skill = gap.get("skill", "This skill")
        market_freq = gap.get("market_freq", "a significant percentage of")
        best_match = gap.get("best_match", "none")
        similarity = gap.get("similarity", 0.0)
        
        skill_explanation = (
            f"'{skill}' was flagged as a {prio_label} gap because it appears in "
            f"{market_freq} job postings in your target field. "
            f"Your closest existing skill ('{best_match}') has only "
            f"{similarity*100:.0f}% semantic overlap, indicating a real gap "
            f"that employers will notice."
        )
        
        title = course.get("title", "This course")
        platform = course.get("platform", "the platform")
        rating = course.get("rating", 4.5)
        reviews = course.get("reviews", 0)
        hours = course.get("hours", 0)
        skills_taught = course.get("skills_taught", [])[:3]
        
        course_explanation = (
            f"'{title}' on {platform} was selected because it directly covers "
            f"{', '.join(skills_taught)} with a rating of {rating}/5.0 "
            f"from {reviews:,} learners. "
            f"At {hours} hours, it fits efficiently within your weekly schedule."
        )
        
        return {
            "skill_explanation": skill_explanation,
            "course_explanation": course_explanation,
        }
    
    def explain_roadmap(
        self,
        roadmap: Dict,
        gaps: List[Dict]
    ) -> str:
        """
        Generate explanation for overall roadmap structure.
        
        Args:
            roadmap: Full roadmap dictionary
            gaps: List of skill gap dictionaries
            
        Returns:
            Roadmap explanation string
        """
        # Check cache
        cache_key = f"roadmap_{roadmap.get('user', '')}_{len(gaps)}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached
        
        # Build context
        context = self._build_roadmap_context(roadmap, gaps)
        
        # Try LLM
        if self._api_available:
            result = self._call_llm_roadmap(context)
            if result:
                self._cache.set(cache_key, result)
                return result
        
        # Fall back to rule-based
        result = self._rule_based_roadmap_explanation(roadmap, gaps)
        self._cache.set(cache_key, result)
        return result
    
    def _build_roadmap_context(
        self,
        roadmap: Dict,
        gaps: List[Dict]
    ) -> str:
        """Build context for roadmap explanation."""
        top_skills = [
            g["skill"] for g in gaps[:3]
            if g.get("priority") == "high"
        ]
        
        courses_used = roadmap.get("courses_used", [])
        courses_str = ", ".join(
            c["title"][:40] for c in courses_used[:3]
        )
        
        stats = roadmap.get("summary_stats", {})
        
        return f"""
USER'S LEARNING ROADMAP SUMMARY:
  User: {roadmap.get('user', 'User')}
  Duration: {roadmap.get('total_weeks', 0)} weeks at {roadmap.get('hours_per_week', 10)}h/week
  Skills to cover: {stats.get('skills_total', 0)} skills, {stats.get('skills_covered', 0)} fully addressed
  Top priority skill gaps: {', '.join(top_skills) if top_skills else 'See roadmap'}
  Key courses included: {courses_str}
  Buffer/review weeks: {stats.get('buffer_weeks', 0)}
  Mini-projects planned: {stats.get('mini_projects', 0)}

Write 3-4 sentences explaining:
1. Why the roadmap is structured this way (priority ordering)
2. Why the timeline is appropriate
3. What the user will be able to do after completing it

Return a JSON object with key: "roadmap_explanation"
"""
    
    def _call_llm_roadmap(self, context: str) -> Optional[str]:
        """Call LLM for roadmap explanation."""
        if not self._api_available:
            return None
        
        try:
            response = self._client.messages.create(
                model=self.config.explainability.model_name,
                max_tokens=self.config.explainability.max_tokens_roadmap_explanation,
                system=self.config.explainability.system_prompt,
                messages=[{"role": "user", "content": context}]
            )
            
            text = response.content[0].text.strip()
            text = re.sub(r"```json\s*|\s*```", "", text).strip()
            
            result = json.loads(text)
            return result.get("roadmap_explanation", "")
            
        except Exception as e:
            warn(f"Roadmap explanation LLM failed ({e})")
            return None
    
    def _rule_based_roadmap_explanation(
        self,
        roadmap: Dict,
        gaps: List[Dict]
    ) -> str:
        """Generate rule-based roadmap explanation."""
        top_skills = [
            g["skill"] for g in gaps[:3]
            if g.get("priority") == "high"
        ]
        
        stats = roadmap.get("summary_stats", {})
        total_weeks = roadmap.get("total_weeks", 0)
        
        skills_str = (
            f"{', '.join(top_skills[:2])}"
            if top_skills
            else "core technical skills"
        )
        
        return (
            f"Your {total_weeks}-week roadmap was ordered by market demand — "
            f"high-frequency skills like {skills_str} "
            f"come first so you gain maximum employability early. "
            f"Buffer weeks every 4 weeks give you time to consolidate and build mini-projects, "
            f"which research shows improves retention by 40%. "
            f"Upon completion, you will have covered {stats.get('skills_covered', 0)} skills "
            f"with {stats.get('mini_projects', 0)} hands-on projects to showcase in your portfolio."
        )
    
    def generate_all_explanations(
        self,
        roadmap: Dict,
        gaps: List[Dict],
        all_courses: List[Dict]
    ) -> Dict:
        """
        Generate all explanations for skills and roadmap.
        
        Args:
            roadmap: Full roadmap dictionary
            gaps: List of skill gap dictionaries
            all_courses: Full course catalog
            
        Returns:
            Dictionary with skills and roadmap explanations
        """
        header("L5 — EXPLAINABILITY LLM: Generating Explanations")
        
        explanations = {
            "skills": [],
            "roadmap": "",
        }
        
        # Build skill -> course mapping
        skill_coverage = roadmap.get("skill_coverage", {})
        courses_used = roadmap.get("courses_used", [])
        
        skill_to_course = {}
        for skill, course_id in skill_coverage.items():
            for course in courses_used:
                if course.get("id") == course_id:
                    skill_to_course[skill] = course
                    break
        
        # Generate skill explanations (limit to top 5)
        for gap in gaps[:5]:
            skill = gap["skill"]
            course = skill_to_course.get(skill)
            
            if not course:
                continue
            
            info(f"Explaining gap: {skill}")
            expl = self.explain_gap(gap, course)
            
            explanations["skills"].append({
                "skill": skill,
                "course_title": course.get("title", ""),
                "skill_explanation": expl.get("skill_explanation", ""),
                "course_explanation": expl.get("course_explanation", ""),
            })
            
            ok(f"  -> {expl.get('skill_explanation', '')[:80]}...")
        
        # Generate roadmap explanation
        explanations["roadmap"] = self.explain_roadmap(roadmap, gaps)
        ok(f"Roadmap explanation: {explanations['roadmap'][:80]}...")
        
        # Save
        path = self.config.paths.output_dir / "explanations.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(explanations, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
        ok(f"Explanations saved → {path}")
        
        return explanations
    
    def _make_cache_key(self, gap: Dict, course: Dict) -> str:
        """Create cache key from gap and course."""
        key_data = f"{gap.get('skill', '')}{course.get('id', '')}"
        return hashlib.md5(key_data.encode()).hexdigest()


if __name__ == "__main__":
    # Test explainability
    print("Testing L5 Explainability LLM...\n")
    
    # Mock data
    test_gap = {
        "skill": "Power BI",
        "gap_score": 0.92,
        "similarity": 0.08,
        "priority": "high",
        "market_freq": "61%",
        "best_match": "Excel",
    }
    
    test_course = {
        "id": "rc01",
        "title": "Microsoft Power BI Desktop for Business Intelligence",
        "platform": "Udemy",
        "rating": 4.8,
        "reviews": 42000,
        "skills_taught": ["Power BI", "DAX", "data visualization"],
        "hours": 8.5,
        "hours_source": "verified",
    }
    
    test_roadmap = {
        "user": "Test User",
        "total_weeks": 9,
        "hours_per_week": 10,
        "skill_coverage": {"Power BI": "rc01"},
        "courses_used": [test_course],
        "summary_stats": {
            "skills_covered": 1,
            "skills_total": 3,
            "buffer_weeks": 2,
            "mini_projects": 3,
        },
    }
    
    # Test
    explainer = ExplainabilityLLM()
    
    print(f"API available: {explainer.api_available}\n")
    
    # Test gap explanation
    explanation = explainer.explain_gap(test_gap, test_course)
    print("Skill explanation:")
    print(f"  {explanation['skill_explanation'][:100]}...\n")
    print("Course explanation:")
    print(f"  {explanation['course_explanation'][:100]}...\n")
    
    # Test roadmap explanation
    roadmap_expl = explainer.explain_roadmap(test_roadmap, [test_gap])
    print("Roadmap explanation:")
    print(f"  {roadmap_expl[:100]}...")
    
    safe_print("\n[OK] Explainability tests complete!")
