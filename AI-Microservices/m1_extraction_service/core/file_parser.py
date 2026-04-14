import io
import pdfplumber
import docx

# L1 - Parsing
def parse_resume_bytes(file_bytes: bytes, filename: str) -> dict:
    text = ""
    sections = {} # Optional enhancement
    
    try:
        if filename.lower().endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        elif filename.lower().endswith(".docx"):
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif filename.lower().endswith(".txt"):
            text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raise ValueError("Unsupported file format")
            
    except Exception as e:
        raise ValueError(f"Failed to parse document: {str(e)}")
        
    return {"rawText": text.strip(), "sections": sections}
