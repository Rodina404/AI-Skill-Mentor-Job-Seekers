# AI Skill Mentor for Job Seekers

### Project Overview
**AI Skill Mentor** is an intelligent career platform designed to help job seekers detect skill gaps in their resumes (CVs) and receive personalized course recommendations and career roadmaps. It integrates modern front-end design, a secure Node.js backend, and a series of Python-based NLP/AI microservices to deliver end-to-end career analysis.

---

### System Architecture & Tech Stack

```
                     +---------------------------------------+
                     |                Browser                |
                     +-------------------+-------------------+
                                         |
                                         v
                         +---------------+---------------+
                         |      Nginx Ingress (Minikube) |
                         +---------------+---------------+
                                         |
                       +-----------------+-----------------+
                       | / (Frontend)                      | /api (Backend)
                       v                                   v
             +---------+---------+               +---------+---------+
             |  Frontend (React) |               |  Backend (Node)   | <---+ (External Supabase API)
             |    Port: 3000     |               |    Port: 5000     |
             +-------------------+               +----+----+----+----+
                                                      |    |    |
       +------------------+------------------+--------+    |    +--------+------------------+------------------+
       |                  |                  |             |             |                  |                  |
       v                  v                  v             v             v                  v                  v
+------+-----+     +------+-----+     +------+-----+     +------+-----+     +------+-----+     +------+-----+     +------+-----+
|    M1      |     |  Skill     |     |    CV      |     |   Gap      |     |    M5      |     |  Course    |     |    Job     |
| Extraction |     |  Normaliz. |     |  Matching  |     |  Engine    |     |  Roadmap   |     |  Recommend.|     |  Recommend.|
| Port: 8001 |     | Port: 8002 |     | Port: 8003 |     | Port: 8004 |     | Port: 8005 |     | Port: 8006 |     | Port: 8007 |
+------------+     +------------+     +------------+     +------------+     +------------+     +------------+     +------------+
```

1. **Frontend-React**: Built with React, TypeScript, and Vite. Serves the interactive user dashboard. (Port `3000` / K8s Port `80`)
2. **Backend**: Built with Node.js & Express.js. Handles client requests, performs auth, and interacts with the database. (Port `5000`)
3. **Database & Auth**: Supabase (Cloud-hosted PostgreSQL database with Row-Level Security policies).
4. **AI Microservices**: 7 Python FastAPI services that run specialized AI/NLP workloads:
   - **`m1-extraction`** (Port `8001`): Parses CV text and extracts key details (uses LangChain and Groq/Ollama fallbacks).
   - **`skill-normalization`** (Port `8002`): Matches parsed CV skills to a canonical taxonomy using SentenceTransformers.
   - **`cv-matching`** (Port `8003`): Calculates matching percentages between CVs and job descriptions using FuzzyWuzzy matching.
   - **`gap-engine`** (Port `8004`): Computes skill gaps between candidate profiles and job titles.
   - **`roadmap-service`** (Port `8005`): Leverages LLMs (Anthropic Claude, OpenAI, Qwen, etc.) to generate personalized learning paths.
   - **`course-recommendation`** (Port `8006`): Provides structured course suggestions based on skill gaps.
   - **`job-recommendation`** (Port `8007`): Matches candidate profiles to existing job openings.

---

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Docker Desktop** (For containerized runs or Minikube)
- **Minikube** & **kubectl** (For Kubernetes deployment)

---

### Environment Setup

The application services rely on environment variables for API keys and database access.

1. **Create the Environment Files**:
   - Copy `.env.example` in the root folder to `.env` and fill in your keys.
   - Copy `backend/.env.example` to `backend/.env` (it requires your Supabase credentials).
   - For microservices, ensure `.env` is created in their respective subdirectories if you plan to run them:
     - `AI-Microservices/m1_extraction_service/.env` (requires `GROQ_API_KEY`)
     - `AI-Microservices/gap-engin-service/.env` (requires `GROQ_API_KEY` and optional Adzuna API keys)
     - `AI-Microservices/m5_roadmap_service/.env` (requires at least one LLM key such as `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`)

2. **Install Node Dependencies**:
   ```bash
   # Install Backend dependencies
   cd backend
   npm install

   # Install Frontend dependencies
   cd ../Frontend-React
   npm install
   ```

3. **Install Python Dependencies (Virtual Environments)**:
   For local process execution, it is highly recommended to set up virtual environments (`venv` or `.venv`) inside each microservice folder. For example, for the roadmap service:
   ```powershell
   cd AI-Microservices/m5_roadmap_service
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

---

### Running the Application

There are three ways to run this application:

#### Option 1: Native Process Developer Dashboard (Recommended for Local Dev)
We provide a PowerShell script that manages the startup of all 9 services concurrently and renders a live status dashboard:
```powershell
# Run from the repository root
.\start-local-dev.ps1
```
- **What it does**:
  1. Identifies and terminates any existing processes binding to ports `5000, 3000, 8001-8007`.
  2. Creates a local `logs/` directory to store individual stdout and stderr logs for each service.
  3. Scans each microservice for local python virtual environments (`.venv` or `venv`) to use the correct Python interpreter, falling back to global Python/uvicorn if none is present.
  4. Launches all services concurrently in the background.
  5. Displays a live status dashboard in the console.
- **Windows IPv6 Patch**: Health check URLs query `127.0.0.1` directly (instead of `localhost`) to prevent loopback connection timeouts due to Windows IPv6 resolution issues.

#### Option 2: Docker Compose (Containerized Local Run)
To run the entire stack inside Docker containers:
```bash
# Run from the repository root
docker-compose up --build
```
- Make sure you have created the global `.env` file in the root directory and populated it with valid API keys.
- Frontend will be accessible at `http://localhost:3000` and the Express Backend at `http://localhost:5000`.

#### Option 3: Deploying to Minikube (Kubernetes Production Simulation)
To deploy the stack on local Kubernetes:
1. Ensure Docker Desktop is active.
2. Base64-encode your credentials and put them into [k8s/secrets.yaml](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/k8s/secrets.yaml).
3. Run the Minikube deployment script:
   ```powershell
   .\k8s\deploy-minikube.ps1
   ```
- **What it does**:
  - Automatically starts Minikube with required CPU/memory limits.
  - Builds the Docker images directly inside Minikube's Docker daemon.
  - Enables the Nginx Ingress addon.
  - Deploys all Pods, Services, ConfigMaps, Secrets, and Ingresses.
  - Outputs the final URL (e.g. `http://<minikube-ip>`) to access the platform.
- For troubleshooting or advanced K8s configuration, see [k8s/DEPLOYMENT.md](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/k8s/DEPLOYMENT.md).

---

### Troubleshooting & Common Issues

- **Offline Services in Dashboard**: If running natively on Windows, the dashboard might show services as `OFFLINE` if Windows resolves `localhost` to IPv6 (`[::1]`) while the python services listen on IPv4 only. We have modified the start script to query `127.0.0.1` to bypass this. Ensure you run the updated `.\start-local-dev.ps1`.
- **Port Conflicts**: If port binding fails, check that ports `3000, 5000` or `8001-8007` are not in use by external processes. The `start-local-dev.ps1` script will try to automatically terminate them on launch.
- **Missing python packages**: If any microservice fails to run because of a missing package (e.g., `ImportError`), make sure you have activated the virtual environment for that service and run `pip install -r requirements.txt`.
