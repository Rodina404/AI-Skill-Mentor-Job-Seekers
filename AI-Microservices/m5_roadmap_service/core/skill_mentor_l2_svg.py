"""
AI Skill Mentor - L2 SVG Generator
====================================

L2: Convert roadmap JSON → SVG timeline diagrams.

Produces three views:
    (a) timeline.svg  — horizontal Gantt-style week-by-week view
    (b) cards.svg     — vertical card stack (one card per week)
    (c) report.html   — interactive HTML report with embedded SVGs

No external libraries — pure SVG string generation.
"""

from pathlib import Path
from typing import Dict, List, Optional

from skill_mentor_config import Config, default_config
from skill_mentor_utils import header, ok, info, safe_print


class SVGGenerator:
    """
    L2: SVG visualization generator.
    
    Creates visual representations of the learning roadmap.
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or default_config
        self.colors = self.config.svg.colors
    
    def generate_all(self, roadmap: Dict) -> Dict[str, str]:
        """
        Generate all visualizations.
        
        Args:
            roadmap: Roadmap dictionary from L1
            
        Returns:
            Dictionary with timeline_svg, cards_svg, and report_html
        """
        timeline_svg = self.generate_timeline_svg(roadmap)
        cards_svg = self.generate_cards_svg(roadmap)
        report_html = self.generate_html_report(roadmap, timeline_svg, cards_svg)
        
        return {
            "timeline_svg": timeline_svg,
            "cards_svg": cards_svg,
            "report_html": report_html,
        }
    
    def generate_timeline_svg(self, roadmap: Dict) -> str:
        """
        Generate horizontal Gantt-style timeline SVG.
        
        Args:
            roadmap: Roadmap dictionary
            
        Returns:
            SVG string
        """
        weeks = roadmap.get("weeks", [])
        n_weeks = len(weeks)
        
        if n_weeks == 0:
            return "<svg/>"
        
        # Extract unique skills
        skills = []
        for w in weeks:
            for t in w["tasks"]:
                skill = t.get("skill", "")
                if skill not in ("review", "integration") and skill not in skills:
                    skills.append(skill)
        
        n_skills = len(skills)
        
        # Calculate dimensions
        svg_config = self.config.svg
        cell_w = max(
            svg_config.timeline_cell_width_min,
            min(svg_config.timeline_cell_width_max, 1400 // max(n_weeks, 1))
        )
        cell_h = svg_config.timeline_cell_height
        label_w = svg_config.timeline_label_width
        header_h = svg_config.timeline_header_height
        
        svg_w = label_w + n_weeks * cell_w + 40
        svg_h = header_h + n_skills * cell_h + 80
        
        lines = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{svg_w}" height="{svg_h}" '
            f'viewBox="0 0 {svg_w} {svg_h}" style="font-family:Arial,sans-serif;background:#fff;">',
            '<!-- TIMELINE SVG — AI Skill Mentor Roadmap -->',
        ]
        
        # Title
        lines.append(
            f'<text x="{svg_w//2}" y="24" text-anchor="middle" '
            f'font-size="16" font-weight="bold" fill="#1a1a1a">'
            f'Learning Roadmap — {roadmap.get("user", "User")}</text>'
        )
        lines.append(
            f'<text x="{svg_w//2}" y="42" text-anchor="middle" '
            f'font-size="11" fill="#666">'
            f'{roadmap["total_weeks"]} weeks · {roadmap["hours_per_week"]}h/week · '
            f'Generated {roadmap["generated_at"][:10]}</text>'
        )
        
        # Week headers
        for i, w in enumerate(weeks):
            x = label_w + i * cell_w
            bg = "#F1EFE8" if w["is_buffer"] else "#E6F1FB"
            lines.append(
                f'<rect x="{x}" y="{header_h}" width="{cell_w-1}" height="20" '
                f'fill="{bg}" stroke="#ccc" stroke-width="0.5"/>'
            )
            lines.append(
                f'<text x="{x + cell_w//2}" y="{header_h+14}" '
                f'text-anchor="middle" font-size="10" fill="#333">W{w["week_num"]}</text>'
            )
        
        # Skill rows
        for row_i, skill in enumerate(skills):
            y_row = header_h + 20 + row_i * cell_h
            row_bg = "#FAFAFA" if row_i % 2 == 0 else "#F4F4F4"
            
            lines.append(
                f'<rect x="0" y="{y_row}" width="{svg_w}" height="{cell_h}" fill="{row_bg}"/>'
            )
            lines.append(
                f'<text x="{label_w-6}" y="{y_row+cell_h//2+4}" '
                f'text-anchor="end" font-size="11" fill="#1a1a1a">{skill[:22]}</text>'
            )
            
            for wi, w in enumerate(weeks):
                x = label_w + wi * cell_w
                task_match = [t for t in w["tasks"] if t.get("skill") == skill]
                
                if task_match:
                    task = task_match[0]
                    fill, text_col = self.colors.get(task["type"], ("#E6F1FB", "#185FA5"))
                    
                    lines.append(
                        f'<rect x="{x+1}" y="{y_row+2}" width="{cell_w-3}" '
                        f'height="{cell_h-4}" rx="3" fill="{fill}" stroke="{text_col}" '
                        f'stroke-width="0.8"/>'
                    )
                    lines.append(
                        f'<text x="{x+cell_w//2}" y="{y_row+cell_h//2+4}" '
                        f'text-anchor="middle" font-size="9" fill="{text_col}">'
                        f'{task["duration_h"]}h</text>'
                    )
        
        # Milestones
        for i, w in enumerate(weeks):
            if w.get("milestone"):
                x = label_w + i * cell_w + cell_w // 2
                y = header_h + 20 + n_skills * cell_h + 20
                
                lines.append(
                    f'<line x1="{x}" y1="{header_h+20}" x2="{x}" y2="{y-5}" '
                    f'stroke="#7F77DD" stroke-width="1.5" stroke-dasharray="4,3"/>'
                )
                lines.append(
                    f'<text x="{x}" y="{y}" text-anchor="middle" font-size="9" '
                    f'fill="#534AB7">{w["milestone"][:40]}</text>'
                )
        
        # Legend
        lx = label_w
        ly = header_h + 20 + n_skills * cell_h + 45
        legend_items = [
            ("Course section", "course_section"),
            ("Mini project", "mini_project"),
            ("Review/Buffer", "review"),
            ("Milestone", "milestone"),
        ]
        
        for k, (label, key) in enumerate(legend_items):
            fill, tc = self.colors.get(key, ("#E6F1FB", "#185FA5"))
            lines.append(
                f'<rect x="{lx+k*130}" y="{ly}" width="14" height="10" '
                f'rx="2" fill="{fill}" stroke="{tc}" stroke-width="0.8"/>'
            )
            lines.append(
                f'<text x="{lx+k*130+18}" y="{ly+9}" font-size="9" fill="#444">{label}</text>'
            )
        
        lines.append("</svg>")
        
        svg_str = "\n".join(lines)
        
        # Save
        path = self.config.paths.output_dir / "roadmap_timeline.svg"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(svg_str, encoding="utf-8")
        ok(f"Timeline SVG saved → {path}  ({svg_w}×{svg_h}px)")
        
        return svg_str
    
    def generate_cards_svg(self, roadmap: Dict) -> str:
        """
        Generate vertical card stack SVG.
        
        Args:
            roadmap: Roadmap dictionary
            
        Returns:
            SVG string
        """
        weeks = roadmap.get("weeks", [])
        
        if not weeks:
            return "<svg/>"
        
        # Dimensions
        svg_config = self.config.svg
        card_w = svg_config.card_width
        card_h = svg_config.card_height
        card_gap = svg_config.card_gap
        pad = svg_config.card_padding
        header_h = 70
        
        svg_w = card_w + pad * 2
        svg_h = header_h + len(weeks) * (card_h + card_gap) + pad
        
        lines = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{svg_w}" height="{svg_h}" '
            f'viewBox="0 0 {svg_w} {svg_h}" style="font-family:Arial,sans-serif;background:#F8F9FA;">',
        ]
        
        # Header
        lines.append(f'<rect x="0" y="0" width="{svg_w}" height="{header_h}" fill="#185FA5"/>')
        lines.append(
            f'<text x="{svg_w//2}" y="30" text-anchor="middle" '
            f'font-size="20" font-weight="bold" fill="white">AI Skill Mentor — Learning Roadmap</text>'
        )
        
        stats = roadmap.get("summary_stats", {})
        lines.append(
            f'<text x="{svg_w//2}" y="52" text-anchor="middle" '
            f'font-size="13" fill="#B5D4F4">'
            f'{roadmap.get("user", "User")} · {roadmap["total_weeks"]} weeks · '
            f'{roadmap["hours_per_week"]}h/week · '
            f'{stats.get("coverage_pct", 0)}% skills covered</text>'
        )
        lines.append(
            f'<text x="{svg_w//2}" y="64" text-anchor="middle" '
            f'font-size="10" fill="#85B7EB">Generated {roadmap["generated_at"][:10]}</text>'
        )
        
        # Week cards
        for wi, week in enumerate(weeks):
            cy = header_h + wi * (card_h + card_gap) + card_gap // 2
            card_fill = "#F1EFE8" if week["is_buffer"] else "#FFFFFF"
            card_stroke = "#D3D1C7" if week["is_buffer"] else "#B5D4F4"
            
            # Card background
            lines.append(
                f'<rect x="{pad}" y="{cy}" width="{card_w}" height="{card_h}" '
                f'rx="8" fill="{card_fill}" stroke="{card_stroke}" stroke-width="1"/>'
            )
            
            # Week badge
            badge_col = "#854F0B" if week["is_buffer"] else "#185FA5"
            badge_bg = "#FAEEDA" if week["is_buffer"] else "#E6F1FB"
            
            lines.append(
                f'<rect x="{pad+10}" y="{cy+10}" width="54" height="22" rx="4" '
                f'fill="{badge_bg}" stroke="{badge_col}" stroke-width="0.8"/>'
            )
            lines.append(
                f'<text x="{pad+37}" y="{cy+25}" text-anchor="middle" '
                f'font-size="11" font-weight="bold" fill="{badge_col}">Week {week["week_num"]}</text>'
            )
            
            # Theme
            lines.append(
                f'<text x="{pad+72}" y="{cy+22}" font-size="13" '
                f'font-weight="bold" fill="#1a1a1a">{week["theme"][:60]}</text>'
            )
            lines.append(
                f'<text x="{pad+72}" y="{cy+37}" font-size="10" '
                f'fill="#666">{week["total_hours"]}h total</text>'
            )
            
            # Tasks
            tx = pad + 10
            ty = cy + 52
            
            for task in week["tasks"][:4]:
                fill, tc = self.colors.get(task["type"], ("#E6F1FB", "#185FA5"))
                task_title = task["title"][:55]
                badge_w = min(len(task_title) * 6 + 20, 380)
                
                lines.append(
                    f'<rect x="{tx}" y="{ty}" width="{badge_w}" height="18" rx="3" fill="{fill}"/>'
                )
                lines.append(
                    f'<text x="{tx+6}" y="{ty+13}" font-size="10" fill="{tc}">'
                    f'{task_title}  {task["duration_h"]}h</text>'
                )
                
                ty += 22
                if ty > cy + card_h - 20:
                    break
            
            # Milestone
            if week.get("milestone"):
                lines.append(
                    f'<rect x="{pad+card_w-220}" y="{cy+card_h-28}" '
                    f'width="210" height="20" rx="4" fill="#EEEDFE"/>'
                )
                lines.append(
                    f'<text x="{pad+card_w-115}" y="{cy+card_h-14}" '
                    f'text-anchor="middle" font-size="9" fill="#3C3489">'
                    f'{week["milestone"][:45]}</text>'
                )
        
        lines.append("</svg>")
        
        svg_str = "\n".join(lines)
        
        # Save
        path = self.config.paths.output_dir / "roadmap_cards.svg"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(svg_str, encoding="utf-8")
        ok(f"Cards SVG saved → {path}  ({svg_w}×{svg_h}px)")
        
        return svg_str
    
    def generate_html_report(
        self,
        roadmap: Dict,
        timeline_svg: Optional[str] = None,
        cards_svg: Optional[str] = None
    ) -> str:
        """
        Generate interactive HTML report.
        
        Args:
            roadmap: Roadmap dictionary
            timeline_svg: Pre-generated timeline SVG (optional)
            cards_svg: Pre-generated cards SVG (optional)
            
        Returns:
            HTML string
        """
        weeks = roadmap.get("weeks", [])
        stats = roadmap.get("summary_stats", {})
        
        # Generate SVGs if not provided
        if timeline_svg is None:
            timeline_svg = self.generate_timeline_svg(roadmap)
        if cards_svg is None:
            cards_svg = self.generate_cards_svg(roadmap)
        
        # Build table rows
        table_rows = ""
        for w in weeks:
            tasks_html = "<br>".join(
                f'<span style="background:{"#E6F1FB" if t["type"]=="course_section" else "#EAF3DE"};'
                f'padding:2px 6px;border-radius:3px;font-size:11px;">'
                f'{t["title"][:50]} ({t["duration_h"]}h)</span>'
                for t in w["tasks"]
            )
            
            ms = (
                f'<span style="color:#534AB7;font-weight:bold">{w["milestone"]}</span>'
                if w.get("milestone") else ""
            )
            
            bg = "#FFF8F0" if w["is_buffer"] else "white"
            
            table_rows += f"""
            <tr style="background:{bg}">
              <td style="padding:8px;border:1px solid #eee;font-weight:bold;color:#185FA5">
                {'⏸' if w['is_buffer'] else ''} Week {w['week_num']}</td>
              <td style="padding:8px;border:1px solid #eee">{w['theme']}</td>
              <td style="padding:8px;border:1px solid #eee">{tasks_html}</td>
              <td style="padding:8px;border:1px solid #eee;text-align:center">{w['total_hours']}h</td>
              <td style="padding:8px;border:1px solid #eee">{ms}</td>
            </tr>"""
        
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Skill Mentor — Roadmap Report</title>
  <style>
    body {{ font-family: -apple-system, Arial, sans-serif; margin:0; background:#F0F2F5; color:#1a1a1a; }}
    .hero {{ background: linear-gradient(135deg,#185FA5,#0C447C); color:white; padding:40px; text-align:center; }}
    .hero h1 {{ margin:0 0 8px; font-size:28px; }}
    .hero p  {{ margin:0; opacity:.85; font-size:15px; }}
    .stats   {{ display:flex; gap:16px; padding:24px 40px; flex-wrap:wrap; background:white;
                border-bottom:1px solid #e0e0e0; }}
    .stat    {{ background:#F8F9FA; padding:16px 24px; border-radius:8px;
                border-left:4px solid #185FA5; min-width:140px; }}
    .stat .n {{ font-size:28px; font-weight:bold; color:#185FA5; }}
    .stat .l {{ font-size:12px; color:#666; margin-top:4px; }}
    .section {{ padding:32px 40px; }}
    .section h2 {{ color:#185FA5; border-bottom:2px solid #E6F1FB; padding-bottom:8px; }}
    .svg-wrap {{ overflow-x:auto; border:1px solid #ddd; border-radius:8px;
                 background:white; padding:16px; margin-top:16px; }}
    table    {{ width:100%; border-collapse:collapse; font-size:13px; }}
    th       {{ background:#185FA5; color:white; padding:10px 8px; text-align:left; }}
    .footer  {{ background:#1a1a1a; color:#aaa; text-align:center; padding:20px;
                font-size:12px; }}
    .data-note {{ background:#FFF8E1; border-left:4px solid #FFC107;
                  padding:12px 20px; margin:0 40px 16px; border-radius:4px;
                  font-size:12px; color:#555; }}
  </style>
</head>
<body>
<div class="hero">
  <h1>🎯 AI Skill Mentor — Learning Roadmap</h1>
  <p>{roadmap.get('user', 'User')} · Generated {roadmap['generated_at'][:10]} ·
     {roadmap['total_weeks']} weeks · {roadmap['hours_per_week']}h/week</p>
</div>

<div class="stats">
  <div class="stat"><div class="n">{roadmap['total_weeks']}</div><div class="l">Total weeks</div></div>
  <div class="stat"><div class="n">{stats.get('total_hours', 0):.0f}h</div><div class="l">Total hours</div></div>
  <div class="stat"><div class="n">{stats.get('skills_covered', 0)}/{stats.get('skills_total', 0)}</div><div class="l">Skills covered</div></div>
  <div class="stat"><div class="n">{stats.get('coverage_pct', 0)}%</div><div class="l">Coverage</div></div>
  <div class="stat"><div class="n">{stats.get('buffer_weeks', 0)}</div><div class="l">Review weeks</div></div>
  <div class="stat"><div class="n">{stats.get('mini_projects', 0)}</div><div class="l">Mini projects</div></div>
</div>

<div class="data-note">
  📌 <strong>Data transparency:</strong> Course hours marked "verified" come from
  official course pages. Hours marked "onet_estimate" use O*NET Job Zone calibrated
  values. Dropout thresholds from OULAD (Kuzilek et al., 2017, doi:10.1038/sdata.2017.171).
</div>

<div class="section">
  <h2>📅 Timeline View (Gantt)</h2>
  <div class="svg-wrap">{timeline_svg}</div>
</div>

<div class="section">
  <h2>🗂️ Weekly Cards</h2>
  <div class="svg-wrap">{cards_svg}</div>
</div>

<div class="section">
  <h2>📋 Full Week-by-Week Schedule</h2>
  <table>
    <thead><tr>
      <th>Week</th><th>Theme</th><th>Tasks</th><th>Hours</th><th>Milestone</th>
    </tr></thead>
    <tbody>{table_rows}</tbody>
  </table>
</div>

<div class="footer">
  AI-Powered Skill Mentor · L1 Scheduling Algorithm · L2 SVG Generator ·
  Real data: O*NET 28.3 + Coursera/Udemy Kaggle + OULAD (Kuzilek et al., 2017)
</div>
</body>
</html>"""
        
        # Save
        path = self.config.paths.output_dir / "roadmap_report.html"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(html, encoding="utf-8")
        ok(f"HTML report saved → {path}")
        
        return html


if __name__ == "__main__":
    # Test SVG generation
    print("Testing L2 SVG Generator...\n")
    
    # Mock roadmap
    test_roadmap = {
        "user": "Test User",
        "generated_at": "2024-01-15T10:00:00",
        "total_weeks": 4,
        "hours_per_week": 10,
        "deadline_weeks": 12,
        "weeks": [
            {
                "week_num": 1,
                "theme": "Focus: Python",
                "tasks": [
                    {"type": "course_section", "title": "Python Basics", "duration_h": 6.0, "skill": "Python"},
                    {"type": "mini_project", "title": "Mini project: Apply Python", "duration_h": 2.0, "skill": "Python"},
                ],
                "milestone": None,
                "is_buffer": False,
                "total_hours": 8.0,
                "skills": ["Python"],
            },
            {
                "week_num": 2,
                "theme": "Focus: SQL",
                "tasks": [
                    {"type": "course_section", "title": "SQL Fundamentals", "duration_h": 8.0, "skill": "SQL"},
                ],
                "milestone": "🏅 25% complete — 1 of 3 skills covered",
                "is_buffer": False,
                "total_hours": 8.0,
                "skills": ["SQL"],
            },
        ],
        "summary_stats": {
            "total_hours": 16.0,
            "skills_covered": 1,
            "skills_total": 3,
            "coverage_pct": 33.3,
            "buffer_weeks": 0,
            "mini_projects": 1,
        },
    }
    
    generator = SVGGenerator()
    results = generator.generate_all(test_roadmap)
    
    safe_print(f"\n[OK] Generated {len(results)} visualizations")
