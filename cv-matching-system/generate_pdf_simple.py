"""
Generate PDF documentation using reportlab
Run: python generate_pdf_simple.py
"""

import sys
from datetime import datetime

def generate_pdf():
    """Generate PDF using reportlab"""
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Preformatted
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
        
        print("📄 Generating CV Matching System Documentation PDF...")
        print("-" * 60)
        
        # Create PDF
        pdf_file = "CV_Matching_System_Documentation.pdf"
        doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                              rightMargin=0.5*inch, leftMargin=0.5*inch,
                              topMargin=0.75*inch, bottomMargin=0.75*inch)
        
        # Container for PDF elements
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#764ba2'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        subheading_style = ParagraphStyle(
            'CustomSubHeading',
            parent=styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=10,
            spaceBefore=10,
            fontName='Helvetica-Bold'
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=10,
            leading=14
        )
        
        # Title
        elements.append(Spacer(1, 0.3*inch))
        elements.append(Paragraph("🎯 CV Matching System", title_style))
        elements.append(Paragraph("Intelligent Candidate-Job Matching Platform", styles['Normal']))
        elements.append(Paragraph("Technical Documentation", styles['Normal']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Overview
        elements.append(Paragraph("1. Executive Summary", heading_style))
        elements.append(Paragraph(
            "The CV Matching System is an intelligent platform that automatically matches job candidates "
            "with job descriptions using advanced machine learning and natural language processing techniques. "
            "The system combines semantic analysis with rule-based matching to provide accurate, explainable candidate-job fit assessments.",
            normal_style
        ))
        
        # Key Stats
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("Key Statistics:", subheading_style))
        stats_data = [
            ['5 Processing Stages', '10+ Python Modules'],
            ['4 Scoring Factors', '100% Explainable Results'],
            ['384-D Embeddings', 'Sub-second Search']
        ]
        stats_table = Table(stats_data, colWidths=[3*inch, 3*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f4ff')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#333333')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#667eea'))
        ]))
        elements.append(stats_table)
        
        # System Overview
        elements.append(PageBreak())
        elements.append(Paragraph("2. Pipeline Architecture", heading_style))
        
        elements.append(Paragraph("Five-Stage Processing Pipeline:", subheading_style))
        
        stages = [
            ("Stage 1: Input Data", "Job Description + Candidate Database"),
            ("Stage 2: Parsing", "Hybrid Regex + Transformer Parser"),
            ("Stage 3: Embedding", "HuggingFace Embeddings + FAISS Vector Store"),
            ("Stage 4: Matching", "Semantic Search using Cosine Similarity"),
            ("Stage 5: Scoring", "Multi-Factor Weighted Score Calculation")
        ]
        
        for stage, desc in stages:
            elements.append(Paragraph(f"<b>{stage}</b><br/>{desc}", normal_style))
            elements.append(Spacer(1, 0.05*inch))
        
        # Data Flow
        elements.append(Paragraph("Data Flow:", subheading_style))
        flow_text = """
        Job Description → Parser (Extract Skills) → Embeddings (384-D Vector)
        ↓
        FAISS Vector Store (Indexed)
        ↓
        Candidate Database → Format Text → Embeddings (384-D Vector)
        ↓
        Semantic Search (Cosine Similarity) → Scoring Engine (Weighted Factors)
        ↓
        Ranked Results (0-100% Match)
        """
        elements.append(Preformatted(flow_text, styles['Normal']))
        
        # Tools & Technologies
        elements.append(PageBreak())
        elements.append(Paragraph("3. Tools & Technologies", heading_style))
        
        tech_data = [
            ['Tool/Library', 'Version', 'Purpose'],
            ['Python', '3.8+', 'Programming Language'],
            ['LangChain', '0.1.x', 'NLP Framework & Agents'],
            ['Transformers', '4.36+', 'HuggingFace Models'],
            ['HuggingFace', 'Latest', 'Embeddings (all-MiniLM-L6-v2)'],
            ['FAISS', '1.7.4+', 'Vector Indexing & Search'],
            ['FuzzyWuzzy', '0.18+', 'Fuzzy String Matching'],
            ['Flask', '2.3+', 'Web Framework'],
            ['NumPy', '1.24+', 'Numerical Computing'],
            ['Scikit-learn', '1.3+', 'ML Utilities']
        ]
        
        tech_table = Table(tech_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
        tech_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')])
        ]))
        elements.append(tech_table)
        
        # Techniques
        elements.append(PageBreak())
        elements.append(Paragraph("4. Key Techniques & Algorithms", heading_style))
        
        elements.append(Paragraph("Hybrid Job Parsing:", subheading_style))
        parsing_text = """
Combines regex (fast) + transformers (accurate):
• Regex Phase: Fast extraction of skill patterns (2-5ms)
• Transformer Phase: Context-aware extraction (50-200ms)
• Negation Handling: Prevents "NOT required" false positives
• Synonym Normalization: DL → Deep Learning, ML → Machine Learning
        """
        elements.append(Preformatted(parsing_text, styles['Normal']))
        
        elements.append(Paragraph("Vector Embeddings & Similarity Search:", subheading_style))
        embedding_text = """
Model: sentence-transformers/all-MiniLM-L6-v2
Dimension: 384-dimensional vectors
Speed: ~5000 sentences/second (CPU)
Similarity Metric: Cosine Similarity
Range: 0.0 (different) to 1.0 (identical)
        """
        elements.append(Preformatted(embedding_text, styles['Normal']))
        
        elements.append(Paragraph("Multi-Factor Weighted Scoring:", subheading_style))
        scoring_text = """
final_score = (
    semantic_similarity × 0.40 +
    skill_matching × 0.35 +
    tools_matching × 0.15 +
    experience_level × 0.10
) × 100

Result: 0-100% match percentage
        """
        elements.append(Preformatted(scoring_text, styles['Normal']))
        
        # Features
        elements.append(PageBreak())
        elements.append(Paragraph("5. Key Features", heading_style))
        
        features = [
            "🎯 Hybrid Parsing - Speed + Accuracy for requirement extraction",
            "📊 Semantic Intelligence - Beyond keyword matching",
            "⚡ Fast & Scalable - Sub-second search for 1000+ candidates",
            "🔒 Self-Contained - No external APIs, complete privacy",
            "🎓 Explainable Results - Detailed skill breakdown",
            "⚙️ Flexible Configuration - Tunable weights and thresholds",
            "🚀 Production Ready - Flask REST API + Web UI",
            "📈 Continuous Improvement - Built-in logging & benchmarking"
        ]
        
        for feature in features:
            elements.append(Paragraph(f"• {feature}", normal_style))
        
        # Performance
        elements.append(PageBreak())
        elements.append(Paragraph("6. Performance Metrics", heading_style))
        
        perf_data = [
            ['Operation', 'Time (ms)', 'Scale'],
            ['Job Parsing (Regex)', '2-5', 'Per job'],
            ['Job Parsing (Transformer)', '50-200', 'Per job'],
            ['Text Embedding', '0.2', 'Per candidate'],
            ['Semantic Search', '5-10', 'For 1000 candidates'],
            ['Score Calculation', '1-2', 'Per candidate'],
            ['Full Match (1000 cand.)', '300-800', 'Total time']
        ]
        
        perf_table = Table(perf_data, colWidths=[2.5*inch, 1.5*inch, 2*inch])
        perf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')])
        ]))
        elements.append(perf_table)
        
        # Conclusion
        elements.append(PageBreak())
        elements.append(Paragraph("7. Conclusion", heading_style))
        
        conclusion_text = """
The CV Matching System combines state-of-the-art NLP techniques with practical engineering 
to deliver an accurate, fast, and explainable candidate matching solution. By leveraging 
transformer-based embeddings, semantic similarity search, and multi-factor scoring, the 
system goes far beyond simple keyword matching.

The hybrid parsing approach balances speed and accuracy, while the modular architecture 
enables easy customization and extension. The system is production-ready with comprehensive 
logging, configurable parameters, and a clean REST API for integration.

Key advantages include semantic understanding, explainable results, fast processing, 
complete privacy, and production-grade reliability.
        """
        elements.append(Paragraph(conclusion_text, normal_style))
        
        # Footer
        elements.append(Spacer(1, 0.3*inch))
        elements.append(Paragraph(
            f"CV Matching System - Technical Documentation<br/>© April 2026 | Graduation Project",
            ParagraphStyle('footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
        ))
        
        # Build PDF
        doc.build(elements)
        
        print("✓ PDF generated successfully!")
        print("-" * 60)
        print(f"📁 File: {pdf_file}")
        print(f"📊 Ready for presentation!")
        
    except ImportError as e:
        print(f"❌ Missing library: {e}")
        print("\nInstall with:")
        print("  pip install reportlab")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    generate_pdf()
