FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data and models directories
RUN mkdir -p ./data ./models

EXPOSE 8006

ENV PORT=8003
ENV DATA_PATH=./data
ENV MODEL_PATH=./models

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
