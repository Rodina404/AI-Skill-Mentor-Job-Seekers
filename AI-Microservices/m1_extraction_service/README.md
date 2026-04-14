# m1_extraction_service

FastAPI microservice executing a LangChain extraction pipeline over incoming CV documents (PDFs and DOCX files).

## Architecture

- **`core/`**: Pipeline functionality resolving chunking / logic parsing.
- **`routes/`**: Handles external `POST /run` invocation point payload routing.
