import time
import traceback
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

from core.file_parser import parse_resume_bytes
from core.chunker import chunk_if_needed
from core.lc_extractor import extract_resume_data

router = APIRouter()

def _error(status_code: int, message: str) -> JSONResponse:
    """Return a structured error JSON response."""
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "version": "1.0", "error": {"code": status_code, "message": message}},
    )

@router.post("/run")
async def extract_resume(
    resumeFile: UploadFile = File(None),
    resumeText: str = Form(None),
    userId: str = Form(None),
) -> JSONResponse:
    if not resumeFile and not (resumeText and resumeText.strip()):
        return _error(400, "Must provide either 'resumeFile' (PDF/DOCX) or 'resumeText'.")

    if userId:
        print(f"[INFO] Processing request for userId: {userId}")

    file_bytes: bytes | None = None
    filename: str | None = None

    if resumeFile:
        filename = resumeFile.filename or ""
        if not (filename.lower().endswith(".pdf") or filename.lower().endswith(".docx") or filename.lower().endswith(".txt")):
            return _error(415, f"Unsupported file type: '{Path(filename).suffix}'. Only PDF, DOCX, and TXT are accepted.")
        file_bytes = await resumeFile.read()

    start_ts = time.time()

    try:
        # 1. Parsing
        if file_bytes and filename:
            parsed = parse_resume_bytes(file_bytes, filename)
            raw_text = parsed["rawText"]
        else:
            raw_text = resumeText or ""
        
        if not str(raw_text).strip():
            raise ValueError("empty")
            
        # 2. Chunking
        chunked_text = chunk_if_needed(raw_text)
        
        # 3. LangChain Extraction
        result = extract_resume_data(chunked_text)

    except ValueError as exc:
        sanitized = str(exc)
        if "empty" in sanitized.lower() or "no text" in sanitized.lower():
            return _error(422, "The file was parsed but contained no extractable text. It may be a scanned/image-only PDF.")
        return _error(422, f"File parsing error: {sanitized}")
    except Exception:
        traceback.print_exc()
        return _error(500, "An unexpected error occurred while processing the resume.")

    elapsed_ms = int((time.time() - start_ts) * 1000)

    # Validate output
    if file_bytes and not result.skills and not result.experience and not result.education:
        return _error(422, "The file was parsed but produced no extractable data.")

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "version": "1.0",
            "userId": userId or None,
            "extractedData": {
                "fullName": result.full_name,
                "email": result.email,
                "summary": result.summary,
                "cleanSkills": result.skills,
                "education": [e.model_dump() for e in result.education],
                "experience": [e.model_dump() for e in result.experience],
                "projects": [e.model_dump() for e in result.projects],
                "coursesAndCertifications": result.courses_and_certifications,
                "languages": result.languages,
            },
            "meta": {
                "charsProcessed": len(chunked_text),
                "processingTimeMs": elapsed_ms,
            },
        },
    )
