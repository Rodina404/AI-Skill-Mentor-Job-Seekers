"""
conftest.py

Pytest shared fixtures for the Resume Extraction Pipeline test suite.
Provides realistic sample resume text, a generated PDF path, and a generated DOCX path
so tests are fully self-contained without requiring external files.
"""

import io
import random
import pytest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent


# ---------------------------------------------------------------------------
# Helper: generate minimal PDF bytes via fpdf2
# ---------------------------------------------------------------------------

def _make_pdf_bytes(text: str) -> bytes:
    """Return a valid PDF containing *text* using fpdf2."""
    from fpdf import FPDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    for line in text.split("\n"):
        safe = "".join(c if ord(c) < 256 else "?" for c in line)
        pdf.multi_cell(0, 6, txt=safe)
    buf = io.BytesIO()
    pdf.output(buf)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Helper: generate minimal DOCX bytes via python-docx
# ---------------------------------------------------------------------------

def _make_docx_bytes(text: str) -> bytes:
    """Return a valid DOCX file containing *text* using python-docx."""
    import docx as docxlib
    doc = docxlib.Document()
    for line in text.split("\n"):
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def sample_resume_text() -> str:
    """
    Return a ~300-word realistic resume string covering a Data Science profile.
    Includes skills (Python, pandas, scikit-learn), education (MSc), and experience.
    """
    return (
        "Jane Smith\n"
        "jane.smith@email.com | +1-555-123-4567 | linkedin.com/in/janesmith | github.com/janesmith\n"
        "Cairo, Egypt\n\n"
        "OBJECTIVE\n"
        "Data scientist with 2 years of experience in machine learning and statistical modelling. "
        "Passionate about deriving actionable insights from complex datasets. "
        "Seeking to apply predictive analytics expertise at a data-driven organisation.\n\n"
        "EDUCATION\n"
        "MSc in Data Science, University of Edinburgh, 2022, GPA: 3.8/4.0\n"
        "Relevant Coursework: Machine Learning, Statistical Inference, Big Data Analytics\n\n"
        "SKILLS\n"
        "Languages: Python, R, SQL\n"
        "Frameworks/Libraries: pandas, scikit-learn, NumPy, TensorFlow, Matplotlib\n"
        "Tools: Jupyter Notebook, Tableau, Power BI, Git\n"
        "Cloud: AWS S3, Google BigQuery\n"
        "Soft Skills: Analytical Thinking, Data Storytelling, Communication\n\n"
        "PROJECTS\n"
        "Churn Prediction Engine\n"
        "  Built a customer churn prediction pipeline using LightGBM achieving 89% AUC.\n"
        "  Stack: Python, pandas, LightGBM, scikit-learn\n"
        "  Link: github.com/janesmith/churn-engine\n\n"
        "Sentiment Analysis API\n"
        "  Deployed an LSTM-based sentiment classifier as a FastAPI REST service on AWS.\n"
        "  Stack: Python, Keras, FastAPI, AWS EC2\n"
        "  Link: github.com/janesmith/sentiment-api\n\n"
        "EXPERIENCE\n"
        "Instabug — Data Science Intern | 2021–2022\n"
        "  Contributed to production ML pipelines reducing inference latency by 18%.\n"
        "  Redesigned data ingestion architecture improving throughput by 30%.\n"
        "  Increased test coverage from 60% to 87% through unit and integration tests.\n\n"
        "CERTIFICATIONS\n"
        "IBM Data Science Professional Certificate — Coursera, 2021\n"
        "Applied Machine Learning — Coursera (University of Michigan), 2022\n"
    )


@pytest.fixture(scope="session")
def sample_pdf_path(tmp_path_factory, sample_resume_text: str) -> Path:
    """Return Path to a valid temporary PDF fixture generated from sample_resume_text."""
    pdf_bytes = _make_pdf_bytes(sample_resume_text)
    p = tmp_path_factory.mktemp("fixtures") / "sample_resume.pdf"
    p.write_bytes(pdf_bytes)
    return p


@pytest.fixture(scope="session")
def sample_docx_path(tmp_path_factory, sample_resume_text: str) -> Path:
    """Return Path to a valid temporary DOCX fixture generated from sample_resume_text."""
    docx_bytes = _make_docx_bytes(sample_resume_text)
    p = tmp_path_factory.mktemp("fixtures") / "sample_resume.docx"
    p.write_bytes(docx_bytes)
    return p
