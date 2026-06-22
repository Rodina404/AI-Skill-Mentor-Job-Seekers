"""
AI Skill Mentor - L3 Progress Engine
======================================

L3: Track progress events and update readiness score.

Features:
- Course progress tracking with timestamps
- Readiness score calculation (SRS FR4)
- ETA projection based on current pace
- Milestone tracking
- Optional forgetting curve decay
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from .config import Config, default_config
from .utils import (
    header, ok, info, warn, row, progress_bar, safe_print, safe_char,
    validate_progress_events, TermColors
)


class ProgressEngine:
    """
    L3: Learning progress tracking engine.
    
    Readiness score formula (SRS FR4):
        readiness = 50% × skill_alignment + 30% × experience_score + 20% × education_score
    
    Where skill_alignment = overall_pct / 100 (updates as courses are completed).
    """
    
    def __init__(
        self,
        roadmap: Dict,
        config: Optional[Config] = None
    ):
        self.roadmap = roadmap
        self.config = config or default_config
        self.progress: Dict[str, float] = {}  # {course_id: pct_complete 0-100}
        self.events: List[Dict] = []  # Audit log
        self._last_activity: Optional[datetime] = None
    
    @property
    def last_activity_date(self) -> Optional[str]:
        """Get ISO date string of last activity."""
        if self._last_activity:
            return self._last_activity.isoformat()
        if self.events:
            return self.events[-1].get("timestamp")
        return None
    
    def update(
        self,
        course_id: str,
        pct_complete: float,
        timestamp: Optional[str] = None
    ) -> Dict:
        """
        Update progress for a single course.
        
        Args:
            course_id: ID of the course
            pct_complete: Completion percentage (0-100)
            timestamp: Optional ISO timestamp
            
        Returns:
            Current status dictionary
        """
        ts = timestamp or datetime.now().isoformat()
        pct_complete = max(0.0, min(100.0, float(pct_complete)))
        
        old_pct = self.progress.get(course_id, 0.0)
        self.progress[course_id] = pct_complete
        
        # Update last activity
        try:
            self._last_activity = datetime.fromisoformat(ts)
        except ValueError:
            self._last_activity = datetime.now()
        
        # Log event
        self.events.append({
            "course_id": course_id,
            "pct_complete": pct_complete,
            "delta": round(pct_complete - old_pct, 1),
            "timestamp": ts,
        })
        
        return self.get_status()
    
    def batch_update(self, events: List[Dict]) -> Dict:
        """
        Batch update progress from multiple events.
        
        Args:
            events: List of event dictionaries with courseId/course_id and percentComplete/pct_complete
            
        Returns:
            Current status dictionary
        """
        validated = validate_progress_events(events)
        
        for ev in validated:
            self.update(
                ev["course_id"],
                ev["pct_complete"],
                ev.get("timestamp")
            )
        
        return self.get_status()
    
    def get_status(self) -> Dict:
        """
        Get current progress status.
        
        Returns:
            Comprehensive status dictionary with progress, milestones, ETA, etc.
        """
        weeks = self.roadmap.get("weeks", [])
        courses_used = self.roadmap.get("courses_used", [])
        
        # Apply forgetting curve if enabled
        if self.config.progress.enable_forgetting_curve:
            self._apply_forgetting_curve()
        
        # Calculate course progress
        course_status = []
        total_hours = 0
        done_hours = 0
        
        for course in courses_used:
            cid = course["id"]
            pct = self.progress.get(cid, 0.0)
            hrs = course.get("hours", 15.0)
            
            total_hours += hrs
            done_hours += hrs * pct / 100.0
            
            course_status.append({
                "course_id": cid,
                "title": course["title"][:50],
                "platform": course.get("platform", ""),
                "pct": round(pct, 1),
                "hours_done": round(hrs * pct / 100.0, 1),
                "hours_total": hrs,
                "complete": pct >= self.config.progress.complete_threshold,
                "hours_source": course.get("hours_source", "unknown"),
            })
        
        # Overall progress
        overall_pct = round(
            done_hours / total_hours * 100, 1
        ) if total_hours > 0 else 0.0
        
        # Week status
        weeks_status = self._calculate_week_status(weeks, overall_pct)
        
        # Milestones
        completed_milestones = self._get_completed_milestones(overall_pct)
        
        # Readiness score
        readiness = self._calculate_readiness(overall_pct)
        
        # ETA
        eta = self._calculate_eta(overall_pct)
        
        return {
            "overall_pct": overall_pct,
            "readiness_score": readiness,
            "done_hours": round(done_hours, 1),
            "total_hours": round(total_hours, 1),
            "course_progress": course_status,
            "weeks_status": weeks_status,
            "completed_milestones": completed_milestones,
            "eta_completion": eta,
            "events_count": len(self.events),
            "last_activity": self.last_activity_date,
        }
    
    def _calculate_week_status(
        self,
        weeks: List[Dict],
        overall_pct: float
    ) -> List[Dict]:
        """Calculate status for each week."""
        weeks_status = []
        
        for w in weeks:
            week_done = 0.0
            week_total = 0.0
            
            for t in w.get("tasks", []):
                h = t.get("duration_h", 0)
                week_total += h
                
                cid = t.get("course_id")
                if cid:
                    week_done += h * self.progress.get(cid, 0.0) / 100.0
                elif t["type"] in ("review", "project", "mini_project"):
                    # Estimate based on overall progress
                    week_done += h * (overall_pct / 100.0)
            
            w_pct = round(
                week_done / week_total * 100, 1
            ) if week_total > 0 else 0.0
            
            status = "complete"
            if w_pct < 90:
                status = "in_progress" if w_pct > self.config.progress.in_progress_threshold else "not_started"
            
            # Handle both "week" and "week_num" keys for compatibility
            week_num = w.get("week_num", w.get("week", 0))
            weeks_status.append({
                "week_num": week_num,
                "pct": w_pct,
                "status": status,
                "theme": w.get("theme", ""),
            })
        
        return weeks_status
    
    def _get_completed_milestones(self, overall_pct: float) -> List[Dict]:
        """Get list of completed milestones."""
        milestones = []
        
        for threshold in [25, 50, 75, 100]:
            if overall_pct >= threshold:
                milestones.append({
                    "threshold": threshold,
                    "label": f"{threshold}% of roadmap complete",
                    "reached_at": next(
                        (
                            e["timestamp"]
                            for e in reversed(self.events)
                            if e["pct_complete"] >= threshold
                        ),
                        None
                    ),
                })
        
        return milestones
    
    def _calculate_readiness(self, overall_pct: float) -> float:
        """
        Calculate readiness score using SRS FR4 formula.
        
        readiness = 50% × skill_alignment + 30% × experience_score + 20% × education_score
        """
        cfg = self.config.progress
        
        skill_alignment = overall_pct / 100.0
        exp_score = self.roadmap.get("user_exp_score", 0.5)
        edu_score = self.roadmap.get("user_edu_score", 0.6)
        
        readiness = (
            cfg.skill_alignment_weight * skill_alignment +
            cfg.experience_weight * exp_score +
            cfg.education_weight * edu_score
        ) * 100
        
        return round(readiness, 1)
    
    def _calculate_eta(self, overall_pct: float) -> str:
        """Calculate estimated completion date based on current pace."""
        if not self.events:
            return "N/A"
        
        if overall_pct >= 100:
            return "Completed"
        
        try:
            first_ts = datetime.fromisoformat(self.events[0]["timestamp"])
            last_ts = datetime.fromisoformat(self.events[-1]["timestamp"])
            
            elapsed_days = max((last_ts - first_ts).days, 1)
            rate_per_day = overall_pct / elapsed_days
            
            if rate_per_day > 0:
                days_remaining = (100 - overall_pct) / rate_per_day
                eta_date = last_ts + timedelta(days=days_remaining)
                return eta_date.strftime("%Y-%m-%d")
            
        except (ValueError, KeyError):
            pass
        
        return "N/A"
    
    def _apply_forgetting_curve(self) -> None:
        """Apply forgetting curve decay to progress (if enabled)."""
        if not self.config.progress.enable_forgetting_curve:
            return
        
        half_life_days = self.config.progress.forgetting_half_life_days
        now = datetime.now()
        
        # Find last activity for each course
        course_last_activity: Dict[str, datetime] = {}
        
        for event in self.events:
            cid = event.get("course_id")
            if cid:
                try:
                    ts = datetime.fromisoformat(event["timestamp"])
                    if cid not in course_last_activity or ts > course_last_activity[cid]:
                        course_last_activity[cid] = ts
                except ValueError:
                    pass
        
        # Apply decay
        for cid, last_active in course_last_activity.items():
            if cid not in self.progress:
                continue
            
            days_inactive = (now - last_active).days
            if days_inactive > 0:
                # Exponential decay: progress * (0.5 ^ (days / half_life))
                decay_factor = 0.5 ** (days_inactive / half_life_days)
                original = self.progress[cid]
                decayed = original * decay_factor
                
                # Don't decay below a minimum threshold
                self.progress[cid] = max(decayed, original * 0.5)
    
    def print_status(self, status: Optional[Dict] = None) -> None:
        """Print formatted status to terminal."""
        if status is None:
            status = self.get_status()
        
        header("L3 — PROGRESS ENGINE: Current Status")
        
        row("Overall progress", f"{status['overall_pct']:.1f}%")
        row("Readiness score", f"{status['readiness_score']:.1f}/100")
        row("Hours completed", f"{status['done_hours']:.1f} / {status['total_hours']:.1f}h")
        row("ETA completion", status['eta_completion'])
        
        if status["completed_milestones"]:
            ok(f"Milestones reached: {[m['label'] for m in status['completed_milestones']]}")
        
        # Course table
        print(f"\n  {'Course':<45} {'Progress':>8}  {'Hours':>8}  {'Hrs Source':>12}")
        print(f"  {'-'*45} {'-'*8}  {'-'*8}  {'-'*12}")
        
        c = TermColors
        fill = safe_char('█')
        for course in status["course_progress"]:
            bar = progress_bar(course["pct"], 100, width=10, fill_char=fill, empty_char=" ")
            
            if course["complete"]:
                col = c.GREEN
            elif course["pct"] > 30:
                col = c.YELLOW
            else:
                col = c.RED
            
            print(
                f"  {course['title']:<45} "
                f"{col}{course['pct']:>7.1f}%{c.END}  "
                f"{course['hours_done']}/{course['hours_total']}h  "
                f"{course.get('hours_source', '?'):>12}  "
                f"{col}{bar}{c.END}"
            )
    
    def save_status(self, path: Optional[Path] = None) -> Path:
        """Save status to JSON file."""
        if path is None:
            path = self.config.paths.output_dir / "progress_status.json"
        
        path.parent.mkdir(parents=True, exist_ok=True)
        
        status = self.get_status()
        path.write_text(
            json.dumps(status, indent=2, default=str),
            encoding="utf-8"
        )
        
        ok(f"Progress status saved → {path}")
        return path
