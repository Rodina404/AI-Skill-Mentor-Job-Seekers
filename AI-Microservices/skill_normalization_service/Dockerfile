# ── Stage 1: Builder ──────────────────────────────────────────────────────────
# Use the full image for building because torch needs native libs
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU-only torch explicitly to avoid pulling the massive CUDA build
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir \
        torch==2.1.0 --index-url https://download.pytorch.org/whl/cpu && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# torch needs these at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
COPY . .

# Cache the sentence-transformer model at build time so the container
# doesn't download it on every cold start
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8002/health')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
