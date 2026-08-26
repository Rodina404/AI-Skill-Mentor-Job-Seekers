# AI Matching Sequence

This sequence diagram details the AI Candidate Discovery pipeline, from recruiter trigger through candidate pool retrieval, batch evaluation via `cv-matching-service`, score validation, and atomic RPC database persistence.

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as Recruiter User
    participant React as React Frontend (RecruiterProfile)
    participant Ingress as NGINX Ingress (:8080)
    participant Express as Express Backend (:5000)
    participant MatchingService as recruiterMatching.service.js
    participant CandidatePool as candidatePool.repository.js
    participant CVMatchingAI as cv-matching-service (:8003)
    participant MatchRepo as recruiterMatches.repository.js
    participant Database as Supabase PostgreSQL (RPC)

    %% Trigger Matching
    Recruiter->>React: Click "AI Matches" -> "Run Candidate Matching"
    React->>Ingress: POST /api/jobs/:jobId/match-candidates (Bearer Token)
    Ingress->>Express: Forward POST /api/jobs/:jobId/match-candidates
    Express->>MatchingService: runRecruiterJobMatching({ jobId, recruiterId, userRole })
    
    %% Ownership Check
    MatchingService->>Database: Fetch job by jobId & verify recruiter_id == recruiterId
    Database-->>MatchingService: Job Posting Verified

    %% Candidate Pool Fetching
    MatchingService->>CandidatePool: getCandidatePool({ batchSize: 50, offset: 0 })
    CandidatePool->>Database: Query job_seeker_profiles WHERE is_discoverable = true JOIN users JOIN resumes (status='analyzed')
    Database-->>CandidatePool: 27 Discoverable Candidate Profiles with Normalized Skills
    CandidatePool-->>MatchingService: Array of Eligible Candidate Objects

    %% Microservice Batch Inference
    MatchingService->>CVMatchingAI: POST /match { jobId, jobDescription, candidates: [...] }
    Note over CVMatchingAI: FuzzyWuzzy & Text Similarity Model processes matching matrix
    CVMatchingAI-->>MatchingService: HTTP 200 OK { rankedCandidates: [{ candidateId, score, matchingSkills, missingSkills }] }

    %% Validation & Global Sorting
    MatchingService->>MatchingService: Validate candidateId strings, clamp scores [0-100], deduplicate & sort descending

    %% Database Atomic Synchronization (RPC)
    MatchingService->>MatchRepo: persistRecruiterMatches({ jobId, rankedCandidates, completionStatus: 'complete' })
    MatchRepo->>Database: CALL sync_recruiter_candidate_matches(p_job_id, p_matches, p_calculated_at)
    Note over Database: Transactional Upsert into candidate_matches & Delete Obsolete Rows
    Database-->>MatchRepo: { success: true, upserted_count: 27 }
    MatchRepo-->>MatchingService: Persistence Verified

    %% Response Delivery
    MatchingService-->>Express: Return Ranked Matching Payload
    Express-->>React: HTTP 200 OK ({ success: true, data: { rankedCandidates: [...] } })
    React-->>Recruiter: Render Ranked Candidate Cards with Match Percentages (0-100%)
```
