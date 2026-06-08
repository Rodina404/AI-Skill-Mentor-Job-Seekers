import os
import time
import logging
from dotenv import load_dotenv
load_dotenv()

from groq import RateLimitError
from langchain_groq import ChatGroq
from langchain_core.output_parsers import PydanticOutputParser
from schemas import ResumeData
from .prompts import get_resume_prompt

logger = logging.getLogger(__name__)

_RETRY_WAITS = [15, 30, 45, 60, 90]  # seconds between retries


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


def extract_resume_data(text: str, _retry_waits=None) -> ResumeData:
    """
    Extract structured resume data using LangChain + Groq.

    Retries automatically on Groq RateLimitError (HTTP 429) with
    configurable exponential backoff. Non-rate-limit errors are
    re-raised immediately.

    Args:
        text: Raw resume text to extract from.
        _retry_waits: List of wait times in seconds between retries.
                      Defaults to [15, 30, 45, 60, 90].
                      Inject a shorter list in tests to avoid sleeping.

    Returns:
        ResumeData Pydantic model with all extracted fields.

    Raises:
        groq.RateLimitError: If all retries are exhausted.
        Any other exception raised by the LangChain chain.
    """
    waits = _retry_waits if _retry_waits is not None else _RETRY_WAITS
    parser = PydanticOutputParser(pydantic_object=ResumeData)
    prompt = get_resume_prompt()
    llm = get_llm()
    chain = prompt | llm | parser

    last_exc = None
    for attempt, wait in enumerate(waits, start=1):
        try:
            return chain.invoke({
                "resume_text": text,
                "format_instructions": parser.get_format_instructions(),
            })
        except RateLimitError as exc:
            last_exc = exc
            logger.warning(
                "[M1] Groq RateLimitError on attempt %d/%d — waiting %ds before retry. Detail: %s",
                attempt, len(waits), wait, exc,
            )
            time.sleep(wait)
        except Exception:
            raise  # non-rate-limit errors fail immediately

    raise last_exc
