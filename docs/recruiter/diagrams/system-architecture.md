# System Architecture Diagram

This diagram documents the deployed system architecture of the AI Skill Mentor platform, illustrating the network topology, service mesh, Ingress routing, Express API gateway, and microservices ecosystem.

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer"]
        Browser["User Browser (Recruiter / Seeker)"]
    end

    subgraph IngressLayer["Ingress & Routing (Kubernetes Minikube)"]
        Ingress["NGINX Ingress Controller<br/>(Port 80 / localhost:8080)"]
    end

    subgraph FrontendApp["Frontend Application"]
        ReactApp["React 18 + Vite + Tailwind CSS<br/>(frontend-service :80)"]
    end

    subgraph GatewayLayer["Backend API Gateway"]
        Express["Express.js REST API<br/>(express-backend-service :5000)"]
        AuthMiddleware["Auth & RBAC Middleware"]
        Controllers["Controllers Layer"]
        Services["Services Layer"]
        Repositories["Repositories Layer"]
        Express --> AuthMiddleware --> Controllers --> Services --> Repositories
    end

    subgraph AIMicroservices["AI / NLP Microservices Mesh (FastAPI)"]
        M1["m1-extraction-service<br/>(:8001)"]
        M2["skill-normalization-service<br/>(:8002)"]
        M3["cv-matching-service<br/>(:8003)"]
        M4["gap-engine-service<br/>(:8004)"]
        M5["m5-roadmap-service<br/>(:8005)"]
        M6["course-recommendation-service<br/>(:8006)"]
        M7["job-recommendation-service<br/>(:8007)"]
    end

    subgraph DatabaseLayer["Data & Object Persistence (Supabase)"]
        PostgresDB[(PostgreSQL Database<br/>RLS + Foreign Keys)]
        AuthService["Supabase GoTrue Auth"]
        Storage["Supabase Private S3 Storage<br/>(Resume Bucket)"]
    end

    %% Network Flows
    Browser -->|HTTP Requests| Ingress
    Ingress -->|Path: /| ReactApp
    Ingress -->|Path: /api/*| Express
    ReactApp -.->|API Calls| Express

    %% Gateway to AI Services
    Services -->|HTTP POST /match| M3
    Services -->|HTTP POST /extract| M1
    Services -->|HTTP POST /normalize| M2
    Services -->|HTTP POST /analyze| M4
    Services -->|HTTP POST /generate| M5
    Services -->|HTTP POST /recommend| M6
    Services -->|HTTP POST /recommend| M7

    %% Gateway to Supabase
    Express -->|Auth Verification & JWT| AuthService
    Repositories -->|PostgreSQL Queries / RPC| PostgresDB
    Services -->|Presigned URL Generation| Storage
```
