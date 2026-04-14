import os
from dotenv import load_dotenv
load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.output_parsers import PydanticOutputParser
from schemas import ResumeData
from .prompts import get_resume_prompt

def get_llm():
    """Return Groq LLM. Falls back to Ollama if GROQ_API_KEY not set."""
    if os.getenv("GROQ_API_KEY"):
        return ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0,           # deterministic output
            max_tokens=2048,
        )
    else:
        # local fallback — run: ollama pull llama3
        from langchain_ollama import ChatOllama
        return ChatOllama(model="llama3", temperature=0)

def extract_resume_data(text: str) -> ResumeData:
    """
    Parser + prompt + LangChain execution.
    """
    parser = PydanticOutputParser(pydantic_object=ResumeData)
    prompt = get_resume_prompt()
    llm = get_llm()
    
    chain = prompt | llm | parser

    result: ResumeData = chain.invoke({
        "resume_text": text,
        "format_instructions": parser.get_format_instructions(),
    })
    
    return result
