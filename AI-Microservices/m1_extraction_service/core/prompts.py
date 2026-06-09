from langchain_core.prompts import ChatPromptTemplate

SYSTEM_PROMPT = """You are an expert resume parser.
Extract ALL structured information from the resume text provided.
Be thorough — do not skip technical skills or soft skills.
Differentiate clearly between technical 'skills' and 'soft_skills' (e.g., leadership, teamwork, communication).
Normalize all extracted skills and soft_skills to lowercase.
Remove duplicates from both skills lists.
Ensure projects only returns a flat list of project names as strings.
If a field is not present, return null or empty list [].
Return ONLY valid JSON matching the schema. No explanation, no markdown fences."""

def get_resume_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "Extract from this resume:\n\n{resume_text}\n\n{format_instructions}"),
    ])
