"""
AI Skill Mentor - L1 Roadmap Logic
===================================

L1: Convert skill gaps + recommended courses + user constraints into
a deterministic weekly roadmap with milestones and tasks.

Features:
- Priority-based skill ordering
- Skill prerequisite handling
- Semantic course matching
- Adaptive buffer weeks
- Mini-project scheduling
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from skill_mentor_config import Config, default_config
from skill_mentor_utils import (
    header, ok, info, warn, row, safe_print,
    validate_user_constraints, validate_skill_gaps, ValidationError
)
from skill_mentor_semantic import SemanticMatcher, CourseSkillMatcher


class RoadmapLogic:
    """
    L1: Roadmap generation logic.
    
    Algorithm:
    1. Sort gaps by priority × (1 - similarity)
    2. Apply skill prerequisites to determine learning order
    3. For each skill, find best matching course using semantic matching
    4. Distribute course hours across available weeks
    5. Insert buffer/review weeks periodically
    6. Add mini-projects at skill completion
    7. Track milestones at 25/50/75/100%
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self.semantic_matcher = SemanticMatcher(config)
        self.course_matcher = CourseSkillMatcher(config)
    
    def generate(
        self,
        missing_skills: List[Dict],
        all_courses: List[Dict],
        user_constraints: Dict,
        skill_hours: Optional[Dict[str, float]] = None
    ) -> Dict:
        """
        Generate a learning roadmap.
        
        Args:
            missing_skills: List of skill gap dictionaries
            all_courses: Full course catalog
            user_constraints: User's time/deadline constraints
            skill_hours: Optional skill-to-hours mapping
            
        Returns:
            Complete roadmap dictionary
        """
        header("L1 — ROADMAP LOGIC: Scheduling Algorithm")
        
        # Validate inputs
        try:
            user_constraints = validate_user_constraints(user_constraints, self.config)
            missing_skills = validate_skill_gaps(missing_skills)
        except ValidationError as e:
            warn(f"Validation warning: {e}")
        
        # Extract constraints
        hours_per_week = float(user_constraints.get(
            "hours_per_week", 
            self.config.roadmap.default_hours_per_week
        ))
        deadline_weeks = int(user_constraints.get(
            "deadline_weeks",
            self.config.roadmap.default_deadline_weeks
        ))
        user_name = user_constraints.get("name", "User")
        
        info(f"Constraints: {hours_per_week}h/week × {deadline_weeks} weeks = "
             f"{hours_per_week * deadline_weeks:.0f}h total")
        
        # Step 1: Sort skills by priority
        sorted_gaps = self._prioritize_skills(missing_skills)
        info(f"Skills to cover (ranked): {[g['skill'] for g in sorted_gaps]}")
        
        # Step 2: Apply skill prerequisites
        sorted_gaps = self._apply_prerequisites(sorted_gaps)
        
        # Step 3: Match skills to courses
        skill_to_course = self._match_skills_to_courses(sorted_gaps, all_courses)
        
        matched = len(skill_to_course)
        unmatched = [g["skill"] for g in sorted_gaps if g["skill"] not in skill_to_course]
        ok(f"Matched {matched}/{len(sorted_gaps)} skills to courses")
        if unmatched:
            warn(f"Unmatched skills (no course in catalog): {unmatched}")
        
        # Step 4: Build task list
        tasks_flat = self._build_task_list(sorted_gaps, skill_to_course, skill_hours)
        
        # Step 5: Distribute across weeks
        weeks, skill_coverage, remaining = self._distribute_tasks(
            tasks_flat, hours_per_week, deadline_weeks
        )
        
        total_hours = sum(w["total_hours"] for w in weeks)
        ok(f"Roadmap generated: {len(weeks)} weeks, {total_hours:.0f} total hours")
        row("Skills fully covered", str(len(skill_coverage)))
        row("Skills partially covered", str(sum(1 for h in remaining.values() if 0 < h < 5)))
        
        # Build roadmap
        roadmap = self._build_roadmap(
            user_name=user_name,
            hours_per_week=hours_per_week,
            deadline_weeks=deadline_weeks,
            weeks=weeks,
            skill_coverage=skill_coverage,
            skill_to_course=skill_to_course,
            tasks_flat=tasks_flat,
            unmatched=unmatched,
            matched=matched
        )
        
        # Save to file
        self._save_roadmap(roadmap)
        
        return roadmap
    
    def _prioritize_skills(self, missing_skills: List[Dict]) -> List[Dict]:
        """Sort skills by priority and gap score."""
        priority_weights = self.config.roadmap.priority_weights
        
        return sorted(
            missing_skills,
            key=lambda g: (
                priority_weights.get(g.get("priority", "medium"), 2.0) *
                (1.0 - g.get("similarity", 0.5))
            ),
            reverse=True
        )
    
    def _apply_prerequisites(self, sorted_gaps: List[Dict]) -> List[Dict]:
        """Reorder skills based on prerequisites."""
        skill_names = [g["skill"] for g in sorted_gaps]
        ordered_names = self.config.prerequisites.get_learning_order(skill_names)
        
        # Rebuild list in prerequisite order
        skill_to_gap = {g["skill"]: g for g in sorted_gaps}
        result = []
        
        for skill in ordered_names:
            if skill in skill_to_gap:
                result.append(skill_to_gap[skill])
        
        # Add any remaining (shouldn't happen, but just in case)
        for gap in sorted_gaps:
            if gap not in result:
                result.append(gap)
        
        return result
    
    def _match_skills_to_courses(
        self,
        sorted_gaps: List[Dict],
        all_courses: List[Dict]
    ) -> Dict[str, Dict]:
        """Match each skill to the best course using semantic matching."""
        return self.course_matcher.match_gaps_to_courses(sorted_gaps, all_courses)
    
    def _build_task_list(
        self,
        sorted_gaps: List[Dict],
        skill_to_course: Dict[str, Dict],
        skill_hours: Optional[Dict[str, float]]
    ) -> List[Dict]:
        """Build flat list of tasks from matched skills."""
        tasks = []
        
        for gap in sorted_gaps:
            skill = gap["skill"]
            match_info = skill_to_course.get(skill)
            
            if not match_info:
                continue
            
            course = match_info["course"]
            
            # Get hours from course or skill mapping
            course_hours = course.get("hours")
            if not course_hours and skill_hours:
                course_hours = skill_hours.get(skill, self.config.skill_hours.default_hours)
            if not course_hours:
                course_hours = self.config.skill_hours.get_hours(skill)
            
            tasks.append({
                "skill": skill,
                "course": course,
                "total_hours": course_hours,
                "priority": gap.get("priority", "medium"),
                "gap_score": gap.get("gap_score", 0.8),
            })
        
        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        tasks.sort(key=lambda t: priority_order.get(t["priority"], 1))
        
        return tasks
    
    def _distribute_tasks(
        self,
        tasks_flat: List[Dict],
        hours_per_week: float,
        deadline_weeks: int
    ) -> Tuple[List[Dict], Dict[str, str], Dict[str, float]]:
        """Distribute tasks across weeks."""
        weeks = []
        skill_coverage = {}
        remaining = {t["skill"]: t["total_hours"] for t in tasks_flat}
        
        week_num = 1
        buffer_interval = self.config.roadmap.buffer_week_interval
        
        while week_num <= deadline_weeks and any(h > 0 for h in remaining.values()):
            is_buffer = (week_num % (buffer_interval + 1) == 0)
            available = hours_per_week * (
                self.config.roadmap.buffer_week_ratio if is_buffer else 1.0
            )
            
            week_tasks = []
            hours_left = available
            skills_this_week = []
            
            if is_buffer:
                # Buffer week: review and project
                covered = [sk for sk, h in remaining.items() if h <= 0]
                week_tasks.append({
                    "type": "review",
                    "title": f"Review & consolidation: {', '.join(covered[-3:]) if covered else 'all topics so far'}",
                    "duration_h": round(hours_per_week * 0.4, 1),
                    "skill": "review",
                    "course_id": None,
                })
                week_tasks.append({
                    "type": "project",
                    "title": "End-of-module mini project",
                    "duration_h": round(hours_per_week * 0.6, 1),
                    "skill": "integration",
                    "course_id": None,
                })
            else:
                # Regular week: course sections
                for task in tasks_flat:
                    skill = task["skill"]
                    if remaining.get(skill, 0) <= 0:
                        continue
                    if hours_left <= 0:
                        break
                    
                    max_chunk = hours_per_week * self.config.roadmap.max_hours_per_task_ratio
                    chunk = min(remaining[skill], hours_left, max_chunk)
                    chunk = round(chunk, 1)
                    
                    if chunk < self.config.roadmap.min_task_hours:
                        continue
                    
                    course = task["course"]
                    week_tasks.append({
                        "type": "course_section",
                        "title": f"{course['title'][:55]} — {skill}",
                        "duration_h": chunk,
                        "skill": skill,
                        "course_id": course["id"],
                        "platform": course.get("platform", ""),
                        "url": course.get("url", ""),
                        "rating": course.get("rating", 4.5),
                        "hours_source": course.get("hours_source", "unknown"),
                    })
                    
                    remaining[skill] = round(remaining[skill] - chunk, 2)
                    hours_left = round(hours_left - chunk, 2)
                    skills_this_week.append(skill)
                    
                    # Add mini-project when skill complete
                    if remaining[skill] <= 0:
                        skill_coverage[skill] = course["id"]
                        proj_hours = min(hours_left, self.config.roadmap.mini_project_hours)
                        if proj_hours >= self.config.roadmap.min_task_hours:
                            week_tasks.append({
                                "type": "mini_project",
                                "title": f"Mini project: Apply {skill} skills",
                                "duration_h": proj_hours,
                                "skill": skill,
                                "course_id": course["id"],
                                "url": "",
                            })
                            hours_left -= proj_hours
            
            # Calculate milestone
            milestone = self._calculate_milestone(
                remaining, tasks_flat, skill_coverage
            )
            
            theme = (
                f"Focus: {', '.join(skills_this_week[:2])}" 
                if skills_this_week 
                else "Review & Practice"
            )
            
            weeks.append({
                "week_num": week_num,
                "theme": theme,
                "tasks": week_tasks,
                "milestone": milestone,
                "is_buffer": is_buffer,
                "total_hours": round(sum(t["duration_h"] for t in week_tasks), 1),
                "skills": skills_this_week,
            })
            
            week_num += 1
        
        return weeks, skill_coverage, remaining
    
    def _calculate_milestone(
        self,
        remaining: Dict[str, float],
        tasks_flat: List[Dict],
        skill_coverage: Dict[str, str]
    ) -> Optional[str]:
        """Calculate milestone for current progress."""
        total_skills = len(tasks_flat)
        covered_count = len(skill_coverage)
        
        if total_skills == 0:
            return None
        
        pct_done = covered_count / total_skills
        
        for threshold in self.config.roadmap.milestone_thresholds:
            if abs(pct_done - threshold) < 0.12:
                if threshold == 0.25:
                    return f"🏅 25% complete — {covered_count} of {total_skills} skills covered"
                elif threshold == 0.50:
                    return f"🏆 Halfway there! {covered_count} of {total_skills} skills covered"
                elif threshold == 0.75:
                    return "🚀 75% complete — almost there!"
                elif threshold >= 0.99:
                    return f"🎓 All {total_skills} skills completed!"
        
        return None
    
    def _build_roadmap(
        self,
        user_name: str,
        hours_per_week: float,
        deadline_weeks: int,
        weeks: List[Dict],
        skill_coverage: Dict[str, str],
        skill_to_course: Dict[str, Dict],
        tasks_flat: List[Dict],
        unmatched: List[str],
        matched: int
    ) -> Dict:
        """Build the final roadmap dictionary."""
        total_hours = sum(w["total_hours"] for w in weeks)
        
        courses_used = [
            skill_to_course[skill]["course"]
            for skill in skill_coverage
            if skill in skill_to_course
        ]
        
        return {
            "user": user_name,
            "generated_at": datetime.now().isoformat(),
            "total_weeks": len(weeks),
            "hours_per_week": hours_per_week,
            "deadline_weeks": deadline_weeks,
            "weeks": weeks,
            "skill_coverage": skill_coverage,
            "courses_used": courses_used,
            "summary_stats": {
                "total_hours": total_hours,
                "skills_covered": len(skill_coverage),
                "skills_total": len(tasks_flat),
                "coverage_pct": round(
                    len(skill_coverage) / len(tasks_flat) * 100, 1
                ) if tasks_flat else 0,
                "buffer_weeks": sum(1 for w in weeks if w["is_buffer"]),
                "mini_projects": sum(
                    1 for w in weeks 
                    for t in w["tasks"] 
                    if t["type"] == "mini_project"
                ),
                "skills_matched": matched,
                "skills_unmatched": len(unmatched),
            }
        }
    
    def _save_roadmap(self, roadmap: Dict) -> Path:
        """Save roadmap to JSON file."""
        output_path = self.config.paths.output_dir / "roadmap.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        output_path.write_text(
            json.dumps(roadmap, indent=2, default=str),
            encoding="utf-8"
        )
        ok(f"Roadmap saved → {output_path}")
        
        return output_path


if __name__ == "__main__":
    # Test roadmap generation
    print("Testing L1 Roadmap Logic...\n")
    
    # Mock data
    test_skills = [
        {"skill": "Power BI", "gap_score": 0.9, "similarity": 0.1, "priority": "high"},
        {"skill": "Python", "gap_score": 0.7, "similarity": 0.3, "priority": "medium"},
        {"skill": "machine learning", "gap_score": 0.85, "similarity": 0.15, "priority": "high"},
    ]
    
    test_courses = [
        {"id": "c1", "title": "Power BI Masterclass", "skills_taught": ["Power BI", "DAX"],
         "rating": 4.8, "hours": 10.0, "hours_source": "verified", "platform": "Udemy"},
        {"id": "c2", "title": "Python for Data Science", "skills_taught": ["Python", "Pandas"],
         "rating": 4.7, "hours": 25.0, "hours_source": "verified", "platform": "Coursera"},
        {"id": "c3", "title": "ML Specialization", "skills_taught": ["machine learning", "Python"],
         "rating": 4.9, "hours": 60.0, "hours_source": "verified", "platform": "Coursera"},
    ]
    
    test_constraints = {
        "name": "Test User",
        "hours_per_week": 10,
        "deadline_weeks": 12,
    }
    
    # Generate roadmap
    logic = RoadmapLogic()
    roadmap = logic.generate(test_skills, test_courses, test_constraints)
    
    safe_print(f"\n✓ Generated roadmap with {roadmap['total_weeks']} weeks")
    print(f"  Skills covered: {roadmap['summary_stats']['skills_covered']}")
    print(f"  Total hours: {roadmap['summary_stats']['total_hours']}")
