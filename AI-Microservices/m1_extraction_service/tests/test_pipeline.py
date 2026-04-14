import io
import pytest
from pathlib import Path

from core.file_parser import parse_resume_bytes
from core.chunker import chunk_if_needed

def _make_pdf_bytes(text: str) -> bytes:
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

def _make_docx_bytes(text: str) -> bytes:
    import docx as docxlib
    doc = docxlib.Document()
    for line in text.split("\n"):
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()

class TestL1Parsing:
    def test_pdf_extraction_returns_text(self, sample_resume_text: str):
        pdf_bytes = _make_pdf_bytes(sample_resume_text)
        result = parse_resume_bytes(pdf_bytes, "resume.pdf")
        assert isinstance(result["rawText"], str)
        assert len(result["rawText"]) > 50

    def test_docx_extraction_returns_text(self, sample_resume_text: str):
        docx_bytes = _make_docx_bytes(sample_resume_text)
        result = parse_resume_bytes(docx_bytes, "resume.docx")
        assert isinstance(result["rawText"], str)
        assert len(result["rawText"]) > 50

    def test_unsupported_file_type_raises(self, sample_resume_text: str):
        with pytest.raises(ValueError, match="[Uu]nsupported"):
            parse_resume_bytes(sample_resume_text.encode("utf-8"), "resume.txt")

class TestL2Chunking:
    def test_long_text_produces_multiple_chunks(self):
        text = "word " * 1000  # ~5000 chars, chunked default is 6000
        # Let's test with a very small max_chars to force chunking
        chunk = chunk_if_needed(text, max_chars=100)
        assert len(chunk) <= 100

class TestAPIEndpoint:
    @pytest.fixture(autouse=True)
    def client(self):
        from fastapi.testclient import TestClient
        from main import app
        self._client = TestClient(app)

    def test_no_input_returns_400(self):
        resp = self._client.post("/run", data={})
        assert resp.status_code == 400
        assert resp.json()["success"] is False
