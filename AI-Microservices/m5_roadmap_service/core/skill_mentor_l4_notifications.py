"""
AI Skill Mentor - L4 Notification System
==========================================

L4: Generate notifications based on roadmap deadlines + progress state.

Uses OULAD-derived thresholds for stall detection:
- 7 days inactive: 40% withdrawal risk (warning)
- 14 days inactive: 68% withdrawal risk (critical)

Notification types:
- WEEKLY_REMINDER: What to do this week
- MILESTONE_ACHIEVED: Celebrate reaching 25/50/75/100%
- STALL_WARNING: No progress for 7 days
- STALL_CRITICAL: No progress for 14 days
- DEADLINE_APPROACHING: < 2 weeks to deadline with < 80% done
- COURSE_COMPLETE: A course just hit 100%
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Set

from skill_mentor_config import Config, default_config
from skill_mentor_utils import header, ok, info, warn, safe_print, safe_char, TermColors


class NotificationSystem:
    """
    L4: Notification generation system.
    
    Generates contextual notifications based on:
    - Roadmap schedule
    - Progress state
    - Inactivity duration
    - OULAD dropout thresholds
    """
    
    def __init__(
        self,
        roadmap: Dict,
        oulad_thresholds: Optional[Dict] = None,
        config: Optional[Config] = None
    ):
        self.roadmap = roadmap
        self.config = config or default_config
        
        # Use provided thresholds or defaults from config
        self.thresholds = oulad_thresholds or {
            "withdrawal_rate": self.config.oulad.withdrawal_rate,
            "stall_warning_days": self.config.oulad.stall_warning_days,
            "stall_critical_days": self.config.oulad.stall_critical_days,
        }
        
        self.sent_ids: Set[str] = set()
        self._notification_history: List[Dict] = []
    
    def generate(
        self,
        progress_status: Dict,
        last_activity_date: Optional[str] = None,
        current_date: Optional[str] = None
    ) -> List[Dict]:
        """
        Generate notifications based on current state.
        
        Args:
            progress_status: Status dict from ProgressEngine
            last_activity_date: ISO date of last activity
            current_date: Current date (for testing)
            
        Returns:
            List of notification dictionaries
        """
        now = datetime.fromisoformat(current_date) if current_date else datetime.now()
        if now.tzinfo is not None:
            now = now.replace(tzinfo=None)
        
        last_act = (
            datetime.fromisoformat(last_activity_date)
            if last_activity_date
            else now - timedelta(days=1)
        )
        if last_act.tzinfo is not None:
            last_act = last_act.replace(tzinfo=None)
        
        days_inactive = (now - last_act).days
        overall_pct = progress_status.get("overall_pct", 0.0)
        
        notifications = []
        
        # 1. Weekly reminder
        weekly = self._generate_weekly_reminder(now, overall_pct)
        if weekly:
            notifications.append(weekly)
        
        # 2. Milestone notifications
        milestone_notifs = self._generate_milestone_notifications(
            progress_status, now
        )
        notifications.extend(milestone_notifs)
        
        # 3. Stall detection (OULAD thresholds)
        stall_notif = self._generate_stall_notification(
            days_inactive, overall_pct, now
        )
        if stall_notif:
            notifications.append(stall_notif)
        
        # 4. Deadline approaching
        deadline_notif = self._generate_deadline_notification(
            overall_pct, now
        )
        if deadline_notif:
            notifications.append(deadline_notif)
        
        # 5. Course completion
        course_notifs = self._generate_course_complete_notifications(
            progress_status, now
        )
        notifications.extend(course_notifs)
        
        # Apply rate limiting
        notifications = self._apply_rate_limiting(notifications)
        
        # Track history
        self._notification_history.extend(notifications)
        
        return notifications
    
    def _generate_weekly_reminder(
        self,
        now: datetime,
        overall_pct: float
    ) -> Optional[Dict]:
        """Generate weekly reminder notification."""
        try:
            roadmap_start = datetime.fromisoformat(self.roadmap["generated_at"])
            if roadmap_start.tzinfo is not None:
                roadmap_start = roadmap_start.replace(tzinfo=None)
        except (KeyError, ValueError):
            return None
        
        elapsed_weeks = max(1, (now - roadmap_start).days // 7 + 1)
        current_week = min(elapsed_weeks, self.roadmap.get("total_weeks", 1))
        
        weeks = self.roadmap.get("weeks", [])
        if current_week > len(weeks):
            return None
        
        w = weeks[current_week - 1]
        notif_id = f"weekly_{current_week}"
        
        if notif_id in self.sent_ids:
            return None
        
        tasks_desc = "; ".join(
            f'{t["title"][:35]} ({t["duration_h"]}h)'
            for t in w.get("tasks", [])[:3]
        )
        
        self.sent_ids.add(notif_id)
        
        return {
            "id": notif_id,
            "type": "WEEKLY_REMINDER",
            "priority": "medium",
            "title": f"[Week {current_week}] Plan - {w.get('theme', 'Learning')}",
            "body": f"This week's focus: {tasks_desc}. Target: {w.get('total_hours', 10)}h of study.",
            "action": "View this week's tasks",
            "channel": self.config.notifications.priority_channels.get("medium", ["in_app"]),
            "sent_at": now.isoformat(),
        }
    
    def _generate_milestone_notifications(
        self,
        progress_status: Dict,
        now: datetime
    ) -> List[Dict]:
        """Generate milestone achievement notifications."""
        notifications = []
        
        for ms in progress_status.get("completed_milestones", []):
            notif_id = f"milestone_{ms['threshold']}"
            
            if notif_id in self.sent_ids:
                continue
            
            self.sent_ids.add(notif_id)
            
            notifications.append({
                "id": notif_id,
                "type": "MILESTONE_ACHIEVED",
                "priority": "high",
                "title": f"🏆 Milestone: {ms['label']}!",
                "body": (
                    f"Congratulations! You've reached {ms['threshold']}% of your roadmap. "
                    f"Current readiness score: {progress_status.get('readiness_score', 0)}/100."
                ),
                "action": "View progress dashboard",
                "channel": self.config.notifications.priority_channels.get("high", ["in_app", "email"]),
                "sent_at": now.isoformat(),
            })
        
        return notifications
    
    def _generate_stall_notification(
        self,
        days_inactive: int,
        overall_pct: float,
        now: datetime
    ) -> Optional[Dict]:
        """Generate stall warning/critical notifications."""
        if overall_pct >= 100:
            return None
        
        stall_warn = self.thresholds.get("stall_warning_days", 7)
        stall_crit = self.thresholds.get("stall_critical_days", 14)
        
        # Critical stall (14+ days)
        if days_inactive >= stall_crit:
            notif_id = f"stall_crit_{now.strftime('%Y-%W')}"
            
            if notif_id in self.sent_ids:
                return None
            
            self.sent_ids.add(notif_id)
            
            withdrawal_risk = int(
                self.thresholds.get("withdrawal_rate", 0.317) * 100 * 2
            )
            
            return {
                "id": notif_id,
                "type": "STALL_CRITICAL",
                "priority": "urgent",
                "title": f"🚨 {days_inactive} days without progress!",
                "body": (
                    f"OULAD research (32,593 students) shows learners inactive for "
                    f"{stall_crit}+ days have a {withdrawal_risk}% withdrawal risk. "
                    f"You're at {overall_pct:.1f}% — jump back in for even 30 minutes today!"
                ),
                "action": "Continue where you left off",
                "channel": self.config.notifications.priority_channels.get("urgent", ["in_app", "email", "push"]),
                "sent_at": now.isoformat(),
            }
        
        # Warning stall (7+ days)
        if days_inactive >= stall_warn:
            notif_id = f"stall_warn_{now.strftime('%Y-%W')}"
            
            if notif_id in self.sent_ids:
                return None
            
            self.sent_ids.add(notif_id)
            
            return {
                "id": notif_id,
                "type": "STALL_WARNING",
                "priority": "high",
                "title": f"[!] No activity for {days_inactive} days",
                "body": (
                    f"You haven't logged progress in {days_inactive} days. "
                    f"You're {overall_pct:.1f}% through your roadmap. "
                    f"Consistent study of just {self.roadmap.get('hours_per_week', 10)}h/week keeps you on track."
                ),
                "action": "Resume learning",
                "channel": self.config.notifications.priority_channels.get("high", ["in_app", "email"]),
                "sent_at": now.isoformat(),
            }
        
        return None
    
    def _generate_deadline_notification(
        self,
        overall_pct: float,
        now: datetime
    ) -> Optional[Dict]:
        """Generate deadline approaching notification."""
        try:
            roadmap_start = datetime.fromisoformat(self.roadmap["generated_at"])
            if roadmap_start.tzinfo is not None:
                roadmap_start = roadmap_start.replace(tzinfo=None)
        except (KeyError, ValueError):
            return None
        
        deadline_weeks = self.roadmap.get("deadline_weeks", 12)
        deadline_date = roadmap_start + timedelta(weeks=deadline_weeks)
        days_to_deadline = (deadline_date - now).days
        
        # Only notify if deadline is within 14 days and progress < 80%
        if not (0 < days_to_deadline <= 14 and overall_pct < 80):
            return None
        
        notif_id = f"deadline_{days_to_deadline}d"
        
        if notif_id in self.sent_ids:
            return None
        
        self.sent_ids.add(notif_id)
        
        hours_per_week = self.roadmap.get("hours_per_week", 10)
        
        return {
            "id": notif_id,
            "type": "DEADLINE_APPROACHING",
            "priority": "urgent",
            "title": f"⏰ Deadline in {days_to_deadline} days — {overall_pct:.1f}% done",
            "body": (
                f"Your roadmap deadline is {deadline_date.strftime('%b %d, %Y')}. "
                f"You've completed {overall_pct:.1f}% of your plan. "
                f"You need {hours_per_week * 1.5:.0f}h/week to finish on time."
            ),
            "action": "View accelerated plan",
            "channel": self.config.notifications.priority_channels.get("urgent", ["in_app", "email", "push"]),
            "sent_at": now.isoformat(),
        }
    
    def _generate_course_complete_notifications(
        self,
        progress_status: Dict,
        now: datetime
    ) -> List[Dict]:
        """Generate course completion notifications."""
        notifications = []
        
        for course in progress_status.get("course_progress", []):
            if not course.get("complete"):
                continue
            
            notif_id = f"course_done_{course['course_id']}"
            
            if notif_id in self.sent_ids:
                continue
            
            self.sent_ids.add(notif_id)
            
            notifications.append({
                "id": notif_id,
                "type": "COURSE_COMPLETE",
                "priority": "medium",
                "title": f"✅ Course complete: {course['title'][:40]}",
                "body": (
                    f"You've finished '{course['title']}' on {course.get('platform', 'the platform')}! "
                    f"This unlocks your next skill in the roadmap."
                ),
                "action": "Start next course",
                "channel": self.config.notifications.priority_channels.get("medium", ["in_app", "push"]),
                "sent_at": now.isoformat(),
            })
        
        return notifications
    
    def _apply_rate_limiting(
        self,
        notifications: List[Dict]
    ) -> List[Dict]:
        """Apply rate limiting to prevent notification spam."""
        max_per_day = self.config.notifications.max_notifications_per_day
        
        # Count notifications sent today
        today = datetime.now().date()
        today_count = sum(
            1 for n in self._notification_history
            if datetime.fromisoformat(n["sent_at"]).date() == today
        )
        
        # Limit to remaining quota
        remaining = max(0, max_per_day - today_count)
        
        if remaining < len(notifications):
            # Prioritize by urgency
            priority_order = {"urgent": 0, "high": 1, "medium": 2, "low": 3}
            notifications.sort(
                key=lambda n: priority_order.get(n.get("priority", "medium"), 2)
            )
            notifications = notifications[:remaining]
        
        return notifications
    
    def print_notifications(self, notifications: List[Dict]) -> None:
        """Print notifications to terminal."""
        header("L4 — NOTIFICATION SYSTEM: Generated Notifications")
        
        if not notifications:
            ok("No notifications to send at this time.")
            return
        
        c = TermColors
        icons = {
            "urgent": f"{c.RED}(!){c.END}",
            "high": f"{c.YELLOW}[!]{c.END}",
            "medium": f"{c.GREEN}[i]{c.END}",
            "low": f"{c.CYAN}[-]{c.END}",
        }
        
        for n in notifications:
            icon = icons.get(n.get("priority", "medium"), "* ")
            print(f"\n  {icon} [{n['type']}]")
            # Sanitize title for Windows console
            title = n['title']
            for emoji in ['📅', '🎯', '🚀', '💪', '📢', '🔔', '⚠️', '✓', '✗']:
                title = title.replace(emoji, '')
            safe_print(f"     {c.BOLD}{title.strip()}{c.END}")
            safe_print(f"     {n['body']}")
            print(f"     Channels: {', '.join(n['channel'])}  |  Action: {n['action']}")
    
    def save_notifications(
        self,
        notifications: List[Dict],
        path: Optional[Path] = None
    ) -> Path:
        """Save notifications to JSON file."""
        if path is None:
            path = self.config.paths.output_dir / "notifications.json"
        
        path.parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            "generated_at": datetime.now().isoformat(),
            "notifications": notifications,
            "history": self._notification_history,
        }
        
        path.write_text(
            json.dumps(data, indent=2, default=str),
            encoding="utf-8"
        )
        
        ok(f"Notifications saved → {path}")
        return path


if __name__ == "__main__":
    # Test notification system
    print("Testing L4 Notification System...\n")
    
    # Mock roadmap
    base_date = datetime.now() - timedelta(days=20)
    
    test_roadmap = {
        "user": "Test User",
        "generated_at": base_date.isoformat(),
        "total_weeks": 12,
        "hours_per_week": 10,
        "deadline_weeks": 12,
        "weeks": [
            {
                "week_num": 1,
                "theme": "Focus: Python",
                "tasks": [{"title": "Python Basics", "duration_h": 6.0}],
                "total_hours": 10.0,
            },
            {
                "week_num": 2,
                "theme": "Focus: SQL",
                "tasks": [{"title": "SQL Fundamentals", "duration_h": 8.0}],
                "total_hours": 10.0,
            },
        ],
    }
    
    test_status = {
        "overall_pct": 25.5,
        "readiness_score": 45.0,
        "completed_milestones": [
            {"threshold": 25, "label": "25% of roadmap complete", "reached_at": datetime.now().isoformat()}
        ],
        "course_progress": [
            {"course_id": "c1", "title": "Python Bootcamp", "platform": "Udemy", "complete": True},
            {"course_id": "c2", "title": "SQL Masterclass", "platform": "Coursera", "complete": False},
        ],
    }
    
    # Test active user (recent activity)
    notif_sys = NotificationSystem(test_roadmap)
    
    notifications = notif_sys.generate(
        test_status,
        last_activity_date=(datetime.now() - timedelta(days=2)).isoformat(),
    )
    
    print("Active user notifications:")
    notif_sys.print_notifications(notifications)
    
    # Test stalled user (15 days inactive)
    notif_sys_stalled = NotificationSystem(test_roadmap)
    
    notifications_stalled = notif_sys_stalled.generate(
        test_status,
        last_activity_date=(datetime.now() - timedelta(days=15)).isoformat(),
    )
    
    print("\n\nStalled user notifications:")
    notif_sys_stalled.print_notifications(notifications_stalled)
    
    safe_print(f"\n[OK] Notification system tests complete!")
