from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_if_needed(text: str, max_chars: int = 6000) -> str:
    """
    Most resumes fit in one LLM call.
    If over limit, take the most information-dense first chunk.
    For very long CVs, you could map-reduce — but 6000 chars
    covers 99% of real resumes comfortably.
    """
    if len(text) <= max_chars:
        return text

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=max_chars,
        chunk_overlap=200,
        separators=["\n\n", "\n", " "]
    )
    chunks = splitter.split_text(text)
    return chunks[0]  # first chunk has header, skills, education — most useful
