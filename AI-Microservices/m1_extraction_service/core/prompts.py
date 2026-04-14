from langchain_core.prompts import ChatPromptTemplate

SYSTEM_PROMPT = """You are an expert resume parser.
Extract ALL structured information from the resume text provided.
Be thorough — do not skip skills, even if they appear in project descriptions.
Normalize all skills to lowercase (e.g. "Python", "PYTHON" → "python").
Remove duplicates from skills list.
If a field is not present, return an empty list or null.
Return ONLY valid JSON matching the schema. No explanation, no markdown fences."""

def get_resume_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "Extract from this resume:\n\n{resume_text}\n\n{format_instructions}"),
    ])
