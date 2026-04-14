"""
Generate a PDF explanation of the Skill Normalization FastAPI Service

This script creates a comprehensive yet brief PDF document explaining:
- What the code does
- Architecture (4-layer pipeline)
- API endpoints
- Integration with graduation project
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from datetime import datetime

# Create PDF document
pdf_path = "Skill_Normalization_System_Explanation.pdf"
doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                        rightMargin=0.75*inch, leftMargin=0.75*inch,
                        topMargin=0.75*inch, bottomMargin=0.75*inch)

# Container for PDF elements
story = []

# Define styles
styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=24,
    textColor=colors.HexColor('#1f4788'),
    spaceAfter=12,
    alignment=TA_CENTER,
    fontName='Helvetica-Bold'
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=14,
    textColor=colors.HexColor('#2563eb'),
    spaceAfter=8,
    spaceBefore=12,
    fontName='Helvetica-Bold'
)

body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['BodyText'],
    fontSize=11,
    alignment=TA_JUSTIFY,
    spaceAfter=10,
    leading=16
)

# ============================================================================
# PAGE 1: TITLE & OVERVIEW
# ============================================================================

story.append(Paragraph("Skill Normalization & User Profile Building System", title_style))
story.append(Spacer(1, 0.2*inch))

story.append(Paragraph("<b>FastAPI Microservice for Graduation Project</b>", heading_style))
story.append(Spacer(1, 0.1*inch))

overview_text = """
This system normalizes raw skill data (with variations, typos, and synonyms) into a 
structured user profile containing canonical, deduplicated skills with confidence scores.
<br/><br/>
<b>Key Purpose:</b> Extract and standardize job-seeker skills for accurate matching with job 
opportunities in the 5-module graduation recommendation system.
"""
story.append(Paragraph(overview_text, body_style))
story.append(Spacer(1, 0.3*inch))

# ============================================================================
# WHAT THE CODE DOES
# ============================================================================

story.append(Paragraph("What The Code Does", heading_style))

what_text = """
The system takes <b>pre-extracted skill data</b> from a user's resume (skills array, 
education, work experience) and processes it through a <b>4-layer intelligent pipeline</b>:
<br/><br/>
✓ Accepts messy, unstructured input (e.g., "deep learnin", "ML", "artificial intelligence")<br/>
✓ Normalizes to canonical skill names (all map to "Machine Learning")<br/>
✓ Deduplicates and scores confidence (1.0 = certain match, 0.7 = semantic match)<br/>
✓ Returns structured JSON: userId, normalized skills[], education, experience<br/>
"""
story.append(Paragraph(what_text, body_style))
story.append(Spacer(1, 0.2*inch))

# ============================================================================
# ARCHITECTURE: 4-LAYER PIPELINE
# ============================================================================

story.append(Paragraph("Architecture: 4-Layer Processing Pipeline", heading_style))

arch_text = """
The normalization pipeline uses intelligent rule-based and embedding-based matching:
"""
story.append(Paragraph(arch_text, body_style))
story.append(Spacer(1, 0.1*inch))

# Create architecture table
arch_data = [
    ['Layer', 'Name', 'How It Works', 'Speed'],
    ['L1', 'Rule Mapping', 'Dict lookup of 170+ synonym rules (python→Python)', '< 1ms'],
    ['L2', 'Decision Logic', 'Route: matched skills vs unknown skills for L3', '< 1ms'],
    ['L3', 'Embedding Match', 'Cosine similarity (all-MiniLM model) vs 95 canonical skills', '~50ms'],
    ['L4', 'Profile Building', 'Deduplicate, select highest confidence, structure output', '< 1ms'],
]

arch_table = Table(arch_data, colWidths=[0.7*inch, 1.2*inch, 2.8*inch, 0.9*inch])
arch_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
]))
story.append(arch_table)
story.append(Spacer(1, 0.2*inch))

# ============================================================================
# FILE STRUCTURE
# ============================================================================

story.append(Paragraph("Code Structure", heading_style))

struct_text = """
<b>Location:</b> <font face="Courier">backend/skills' System/fastapi_service/</font>
<br/><br/>
<b>Main Files:</b><br/>
• <b>main.py</b> (673 lines) - FastAPI application with /health and /run endpoints<br/>
• <b>modules/</b> - Original Python modules (unchanged wrapper approach)<br/>
  – embedding_engine.py: Computes skill embeddings using sentence-transformers<br/>
  – normalizer.py: L1-L4 pipeline with deduplication<br/>
  – profile_builder.py: Structures final user profile<br/>
• <b>skills.json</b> - Database of 95 canonical skills with metadata<br/>
• <b>rules.json</b> - 170+ L1 rule mappings (synonyms, variations)<br/>
• <b>requirements.txt</b> - 7 dependencies (FastAPI, uvicorn, pydantic, etc.)<br/>
"""
story.append(Paragraph(struct_text, body_style))
story.append(Spacer(1, 0.2*inch))

# ============================================================================
# API ENDPOINTS
# ============================================================================

story.append(PageBreak())
story.append(Paragraph("API Endpoints", heading_style))

endpoint_text = """
The service exposes two REST endpoints on <b>http://localhost:8003</b>:
"""
story.append(Paragraph(endpoint_text, body_style))
story.append(Spacer(1, 0.1*inch))

# Endpoint 1: Health
story.append(Paragraph("<b>1. GET /health</b>", ParagraphStyle('SubHeading', parent=styles['Heading3'], fontSize=12, textColor=colors.HexColor('#059669'))))
health_text = """
<b>Purpose:</b> Check service status<br/>
<b>Response:</b><br/>
<font face="Courier" size="9">{<br/>
&nbsp;&nbsp;"status": "ok",<br/>
&nbsp;&nbsp;"service": "Skill Normalization & User Profile Building",<br/>
&nbsp;&nbsp;"version": "1.0.0"<br/>
}</font>
"""
story.append(Paragraph(health_text, body_style))
story.append(Spacer(1, 0.15*inch))

# Endpoint 2: Run
story.append(Paragraph("<b>2. POST /run</b>", ParagraphStyle('SubHeading', parent=styles['Heading3'], fontSize=12, textColor=colors.HexColor('#059669'))))
run_text = """
<b>Purpose:</b> Normalize skills and build user profile<br/>
<b>Input (JSON):</b><br/>
<font face="Courier" size="9">{<br/>
&nbsp;&nbsp;"userId": "USER_123",<br/>
&nbsp;&nbsp;"skills": ["python", "sql", "deep learning"],<br/>
&nbsp;&nbsp;"education": {"degree": "BSc", "field": "CS"},<br/>
&nbsp;&nbsp;"experience": {"titles": ["Developer"], "years": 2}<br/>
}</font>
<br/><br/>
<b>Output (JSON):</b> UserProfile with normalized skills array, where each skill contains:<br/>
<font face="Courier" size="9">{<br/>
&nbsp;&nbsp;"skillId": "S_python",<br/>
&nbsp;&nbsp;"name": "Python",<br/>
&nbsp;&nbsp;"confidence": 1.0&nbsp;&nbsp;// 1.0 = exact match, 0.7+ = semantic match<br/>
}</font>
"""
story.append(Paragraph(run_text, body_style))
story.append(Spacer(1, 0.1*inch))

# ============================================================================
# EXAMPLE FLOW
# ============================================================================

story.append(Paragraph("Example Processing Flow", heading_style))

flow_text = """
<b>Input:</b> User submitting resume with skills: ["ML", "tensorflow", "deep learnin"]
<br/><br/>
<b>Processing:</b><br/>
• L1: "ML" → Rule match → "Machine Learning" ✓<br/>
• L1: "tensorflow" → Rule match → "TensorFlow" ✓<br/>
• L1: "deep learnin" → No rule match → Go to L3<br/>
• L3: Embedding similarity search → Matches "Deep Learning" (0.92 similarity) ✓<br/>
• L4: Deduplicate, keep highest confidence scores<br/>
<br/>
<b>Output:</b> 3 normalized skills: Machine Learning, TensorFlow, Deep Learning<br/>
All with confidence ≥ 0.9 (high confidence)
"""
story.append(Paragraph(flow_text, body_style))
story.append(Spacer(1, 0.2*inch))

# ============================================================================
# INTEGRATION WITH PROJECT
# ============================================================================

story.append(Paragraph("Integration with Graduation Project", heading_style))

integration_text = """
This system is <b>Module 3</b> of a 5-module job seeker recommendation platform:
<br/><br/>
<b>Module 1:</b> Resume PDF Parser → Extract skills, education, experience<br/>
<b>Module 2:</b> CV Data Extraction → Structure extracted data<br/>
<b>→ Module 3 (This System):</b> Skill Normalization → Standardize for matching<br/>
<b>Module 4:</b> Profile Matcher → Compare user profile against job descriptions<br/>
<b>Module 5:</b> Job Ranker → Rank and recommend best matching jobs<br/>
<br/>
The normalized user profile from this service feeds directly into Module 4 for 
intelligent job-seeker matching.
"""
story.append(Paragraph(integration_text, body_style))
story.append(Spacer(1, 0.2*inch))

# ============================================================================
# RUNNING THE SERVICE
# ============================================================================

story.append(Paragraph("Running the Service", heading_style))

run_service_text = """
<b>Installation:</b><br/>
<font face="Courier" size="10">cd "backend/skills' System/fastapi_service"<br/>
pip install -r requirements.txt</font>
<br/><br/>
<b>Start Server:</b><br/>
<font face="Courier" size="10">uvicorn main:app --port 8003 --reload</font>
<br/><br/>
<b>Access API Docs:</b> Open browser to <font face="Courier">http://localhost:8003/docs</font>
<br/><br/>
<b>Test Endpoint:</b><br/>
<font face="Courier" size="10">curl -X POST http://localhost:8003/run \<br/>
&nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
&nbsp;&nbsp;-d '{"userId":"test","skills":["python"],...}'</font>
"""
story.append(Paragraph(run_service_text, body_style))
story.append(Spacer(1, 0.2*inch))

# ============================================================================
# KEY FEATURES
# ============================================================================

story.append(Paragraph("Key Features", heading_style))

features_text = """
✓ <b>No Module Refactoring:</b> Pure HTTP wrapper around existing Python modules<br/>
✓ <b>Fast Processing:</b> 50-100ms per request (20+ skills)<br/>
✓ <b>Robust Matching:</b> Handles typos, abbreviations, synonyms, + semantic similarity<br/>
✓ <b>Confidence Scoring:</b> Quantifies match certainty (1.0 = exact, 0.7 = semantic)<br/>
✓ <b>Auto-Deduplication:</b> Removes duplicate normalizations, keeps best match<br/>
✓ <b>Interactive Docs:</b> Auto-generated Swagger UI at /docs<br/>
✓ <b>Error Handling:</b> Proper HTTP status codes (422 validation, 500 server errors)<br/>
✓ <b>Production-Ready:</b> Docker support, environment variables, comprehensive logging<br/>
"""
story.append(Paragraph(features_text, body_style))
story.append(Spacer(1, 0.3*inch))

# ============================================================================
# FOOTER
# ============================================================================

footer_style = ParagraphStyle(
    'Footer',
    parent=styles['Normal'],
    fontSize=9,
    textColor=colors.grey,
    alignment=TA_CENTER
)
story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", footer_style))
story.append(Paragraph("AI-Skill-Mentor Job Seekers | Graduation Project", footer_style))

# Build PDF
doc.build(story)
print(f"✓ PDF generated successfully: {pdf_path}")
print(f"  Location: {pdf_path}")
print(f"  Size: {len(open(pdf_path, 'rb').read()) / 1024:.1f} KB")
