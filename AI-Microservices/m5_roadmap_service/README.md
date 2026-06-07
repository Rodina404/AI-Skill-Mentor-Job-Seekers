# M5 Roadmap Service

A FastAPI microservice for the AI Skill Mentor project. Provides endpoints for generating learning roadmaps, tracking progress, computing notifications, and getting explanations.

## Setup
1. `pip install -r requirements.txt`
2. Configure `.env` from `.env.example`.
3. `uvicorn main:app --reload`

## Endpoints

### `GET /health`
Returns health status payload.

### `POST /run/roadmap`
Generates a learning roadmap from missing skills and constraints.
**Request Body:** `RoadmapRequest`
**Response Body:** `RoadmapResponse`

### `POST /run/progress`
Update and track progress.
**Request Body:** `ProgressRequest`
**Response Body:** `ProgressResponse`

### `POST /run/notify`
Generates dropout prevention and milestone notifications.
**Request Body:** `NotifyRequest`
**Response Body:** `NotifyResponse`

### `POST /run/explain`
Fetches explainability using generative AI.
**Request Body:** `ExplainRequest`
**Response Body:** `ExplainResponse`
