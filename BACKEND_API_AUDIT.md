# Backend API Audit Report

This report contains answers to the six specific questions regarding backend behaviors and a detailed route-by-route audit of the 10 core backend API endpoints.

---

## Answers to Specific Questions

### Q1: Does the resumes controller upload the file to Supabase Storage 'resumes' bucket? Show the exact code line.
**Yes.** The controller uploads the file to the `resumes` bucket.
* **File:** [resumes.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L22-L24)
* **Code Line:**
```javascript
    const { error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(filePath, file.buffer, { contentType: file.mimetype });
```

---

### Q2: What table stores the resume record after upload? What columns are inserted?
The resume record metadata is stored in the `resumes` table.
* **File:** [resumes.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L27-L30)
* **Columns inserted:** `user_id`, `file_path`, `original_name`, `status`
* **Code Line:**
```javascript
    const { data: resumeRecord, error: dbError } = await supabaseAdmin
      .from('resumes')
      .insert({ user_id: userId, file_path: filePath, original_name: file.originalname, status: 'processing' })
```

---

### Q3: What is the exact chain of microservice calls in resumes.controller.js after upload? List in order: service name → endpoint → input fields → output fields used.
The asynchronous analysis pipeline `_runAnalysisPipeline` calls the following microservices in order:

1. **Extraction Service**
   * **Service Name:** `extraction` (default port: `8001`)
   * **Endpoint:** `${SERVICES.extraction}/run` ([resumes.controller.js:53-56](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L53-L56))
   * **Input Fields:** `resumeFile` (sent as multipart/form-data with properties `file.buffer`, `filename: file.originalname`, `contentType: file.mimetype`)
   * **Output Fields Used:** `success` (for validation check) and `extractedData` (containing arrays/objects for `education`, `experience`, and `skills`).

2. **Normalization Service**
   * **Service Name:** `normalization` (default port: `8002`)
   * **Endpoint:** `${SERVICES.normalization}/run` ([resumes.controller.js:82-91](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L82-L91))
   * **Input Fields:**
     ```json
     {
       "userId": "uuid-string (resume record id)",
       "skills": ["raw-skill-strings"],
       "education": {
         "degree": "string",
         "field": "string",
         "university": "string",
         "year": 1234
       },
       "experience": {
         "titles": ["string"],
         "years": 0.0
       }
     }
     ```
   * **Output Fields Used:** `success` and `data.skills` (array of normalized skills containing `skillId`, `name` or `skill`).

3. **Gap Engine**
   * **Service Name:** `gapEngine` (default port: `8004`)
   * **Endpoint:** `${SERVICES.gapEngine}/run` ([resumes.controller.js:102-113](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L102-L113))
   * **Input Fields:**
     ```json
     {
       "jobTitle": "string",
       "userProfile": {
         "skills": [{ "skillId": "string" }],
         "experienceLevel": "string (e.g. 'X years')",
         "educationLevel": "string"
       }
     }
     ```
   * **Output Fields Used:** `success` and `data` (containing `missingSkills` list, `readinessScore`, and `matchedSkills`).

4. **Roadmap Service**
   * **Service Name:** `roadmap` (default port: `8005`)
   * **Endpoint:** `${SERVICES.roadmap}/run/roadmap` ([resumes.controller.js:125-135](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L125-L135))
   * **Input Fields:**
     ```json
     {
       "user_id": "uuid-string (resume record id)",
       "missing_skills": ["missing-skill-strings"],
       "hours_per_week": 10,
       "deadline_weeks": 8,
       "job_title": "string"
     }
     ```
   * **Output Fields Used:** `data` (representing the roadmap timeline, stored directly under `extracted_data.roadmap`).

5. **Course Recommender Service**
   * **Service Name:** `courseRec` (default port: `8006`)
   * **Endpoint:** `${SERVICES.courseRec}/run` ([resumes.controller.js:138-152](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L138-L152))
   * **Input Fields:**
     ```json
     {
       "user_id": "uuid-string (resume record id)",
       "user_profile": {
         "skills": ["normalized-skill-names"],
         "experience_years": 123,
         "education": "string",
         "location": ""
       },
       "job_title": "string",
       "top_n": 5
     }
     ```
   * **Output Fields Used:** `data.recommendations` (representing array of recommended courses, stored directly under `extracted_data.courseRecommendations`).

---

### Q4: Does any controller save course_recommendations to the DB? Which table, which controller, which line?
**Yes.** Two controller endpoints insert into the `course_recommendations` table:
1. **Controller:** `matches.controller.js`
   * **File:** [matches.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/matches.controller.js#L257-L271)
   * **Table:** `course_recommendations`
   * **Line:** 257 (inside `runMatching` function)
2. **Controller:** `resumes.controller.js`
   * **File:** [resumes.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L347-L363)
   * **Table:** `course_recommendations`
   * **Line:** 347 (inside `getRecommendedCourses` function)

---

### Q5: Does any controller save roadmap data to the DB? Which table, which controller, which line?
**Yes.** One controller inserts structured career roadmap data into the dedicated table:
* **Controller:** `matches.controller.js`
* **File:** [matches.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/matches.controller.js#L347-L355)
* **Table:** `roadmaps`
* **Line:** 347 (inside `runMatching` function)

*(Note: `resumes.controller.js` also writes the roadmap JSON data to the `resumes` table as a property within the `extracted_data` JSONB column on line 156, but does not write to the dedicated `roadmaps` table).*

---

### Q6: What does GET /api/matches return exactly? What table does it query and what columns?
* **Table queried:** `candidate_matches` (with a foreign-key join on `job_postings`)
* **Columns queried:**
  * From `candidate_matches`: `id`, `resume_id`, `match_score`, `overall_score`, `skill_match_score`, `matched_skills`, `missing_skills`, `created_at`
  * From `job_postings` (joined): `id`, `title`, `company`, `location`
* **Filter & Order:** Filters on `user_id` matching the authenticated user's ID, and sorts by `match_score` descending.
* **Exact JSON shape returned on success:**
  An array of objects matching this exact structure:
  ```json
  [
    {
      "id": "uuid-string",
      "resume_id": "uuid-string",
      "match_score": 85,
      "overall_score": 0.85,
      "skill_match_score": 0.90,
      "matched_skills": ["React", "TypeScript", "Node.js"],
      "missing_skills": ["Docker", "Kubernetes"],
      "created_at": "2026-06-14T17:53:09+03:00",
      "job_postings": {
        "id": "uuid-string",
        "title": "Frontend Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA"
      }
    }
  ]
  ```

---

## Detailed Route Audits

### Route File: auth.routes.js

#### POST /api/auth/signup
* **Controller function:** `signup` in [auth.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/auth.controller.js#L3)
* **Auth required:** No
* **Input:** `req.body` fields: `email` (required), `password` (required), `full_name` or `fullName` (required), `role` (optional, defaults to `'job_seeker'`).
* **Output:** (Status 201)
  ```json
  {
    "message": "Account created. Please verify your email." or "Account created and logged in successfully.",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "job_seeker"
    },
    "access_token": "jwt-token-string (optional, if auto-logged in)",
    "refresh_token": "uuid-string (optional, if auto-logged in)"
  }
  ```
* **Supabase tables read:** None directly (handles authentication via `supabase.auth.signUp()`).
* **Supabase tables written:** None directly (creates auth user in Supabase internal schema).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### POST /api/auth/login (and POST /api/auth/signin)
* **Controller function:** `login` in [auth.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/auth.controller.js#L29)
* **Auth required:** No
* **Input:** `req.body` fields: `email` (required), `password` (required).
* **Output:** (Status 200)
  ```json
  {
    "message": "Login successful",
    "access_token": "jwt-token-string",
    "refresh_token": "uuid-string",
    "expires_at": 1234567890,
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "job_seeker"
    }
  }
  ```
* **Supabase tables read:** None directly.
* **Supabase tables written:** None directly.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### POST /api/auth/logout (and POST /api/auth/signout)
* **Controller function:** `logout` in [auth.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/auth.controller.js#L51)
* **Auth required:** Yes (via `protect`)
* **Input:** None (uses headers `Authorization: Bearer <token>`).
* **Output:** (Status 200)
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
* **Supabase tables read:** None directly.
* **Supabase tables written:** None directly.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### GET /api/auth/me (and GET /api/auth/verify)
* **Controller function:** `getMe` in [auth.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/auth.controller.js#L57)
* **Auth required:** Yes (via `protect`)
* **Input:** None.
* **Output:** (Status 200)
  ```json
  {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "job_seeker",
      "first_name": "John",
      "last_name": "Doe"
    },
    "profile": {
      "id": "uuid-string",
      "location": "New York, NY",
      "years_of_experience": 3,
      "target_role": "Software Engineer",
      "headline": "Full-stack enthusiast",
      "bio": "Experienced developer..."
    } or null
  }
  ```
* **Supabase tables read:** `users` (joins `roles` to resolve role name), `job_seeker_profiles` (fetches detail matching `user_id`).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Safe fallback mechanism: if the database fetch fails, the catch block swallows the error and returns user details from `req.user` with `profile: null` instead of failing with a 500 error.

#### POST /api/auth/refresh
* **Controller function:** `refreshToken` in [auth.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/auth.controller.js#L105)
* **Auth required:** No
* **Input:** `req.body` fields: `refresh_token` (required).
* **Output:** (Status 200)
  ```json
  {
    "access_token": "jwt-token-string",
    "refresh_token": "uuid-string",
    "expires_at": 1234567890
  }
  ```
* **Supabase tables read:** None directly.
* **Supabase tables written:** None directly.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

---

### Route File: resumes.routes.js

#### POST /api/resumes/upload (and POST /api/resumes/analyze)
* **Controller function:** `uploadResume` in [resumes.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L13)
* **Auth required:** Yes (via `protect`)
* **Input:**
  * `req.file` via Multer: field `file` (on `/upload`) or `resume` (on `/analyze`).
  * `req.body` fields: `jobTitle` (optional, defaults to `'Software Engineer'`).
* **Output:** (Status 202)
  ```json
  {
    "message": "Resume uploaded. Processing started.",
    "resume_id": "uuid-string"
  }
  ```
* **Supabase tables read:** None on initial execution.
* **Supabase tables written:** `resumes` (inserts initial record with status `'processing'`, and updates in background asynchronously on completion/failure).
* **Downstream microservice calls:** Asynchronously triggers `_runAnalysisPipeline`, making HTTP POST requests to:
  1. Extraction Service (`:8001/run`) - sends `resumeFile` multipart, receives parsed data.
  2. Normalization Service (`:8002/run`) - sends parsed skills/edu/exp, receives normalized skills.
  3. Gap Engine (`:8004/run`) - sends job title and skills, receives gaps and readiness score.
  4. Roadmap Service (`:8005/run/roadmap`) - sends missing skills, receives roadmap timeline.
  5. Course Recommender (`:8006/run`) - sends user profile, receives recommendations.
* **Known issues or TODOs visible in code:**
  * Runs the processing pipeline as a non-blocking asynchronous callback. If a service crashes, the status is set to `'failed'` in the catch block.
  * In the course recommender input, the user location is hardcoded as an empty string (`location: ''`).

#### GET /api/resumes (and GET /api/resumes/history/:userId)
* **Controller function:** `getUserResumes` in [resumes.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L190)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.params` optional: `userId` (though the code actually ignores it and fetches using `req.user.id`).
* **Output:** (Status 200)
  ```json
  [
    {
      "id": "uuid-string",
      "status": "analyzed",
      "original_name": "resume.pdf",
      "analyzed_at": "2026-06-14T17:53:09Z",
      "created_at": "2026-06-14T17:50:00Z"
    }
  ]
  ```
* **Supabase tables read:** `resumes`.
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** The `/history/:userId` route is fully accessible but ignores the `userId` in the URL parameter, instead querying resumes owned by the authenticated `req.user.id`.

#### GET /api/resumes/:id/status (and GET /api/resumes/analysis/:id)
* **Controller function:** `getResumeStatus` in [resumes.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L172)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.params` fields: `id` (resume ID).
* **Output:** (Status 200)
  ```json
  {
    "id": "uuid-string",
    "status": "analyzed",
    "original_name": "resume.pdf",
    "analyzed_at": "2026-06-14T17:53:09Z",
    "normalized_skills": [ ... ],
    "extracted_data": { ... },
    "jobTitle": "Software Engineer",
    "readinessScore": 85,
    "matchedSkills": ["JavaScript", "HTML"],
    "missingSkills": ["Node.js"],
    "courseRecommendations": [ ... ],
    "roadmap": { ... }
  }
  ```
* **Supabase tables read:** `resumes` (requires user ownership check `user_id = req.user.id`).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### POST /api/resumes/learning-path
* **Controller function:** `createLearningPath` in [resumes.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L198)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.body` fields: `analysisId` (resume record ID).
* **Output:** (Status 200) Returns the exact roadmap JSON structure returned from the microservice.
* **Supabase tables read:** `candidate_matches` (joins `job_postings` to read the job title).
* **Supabase tables written:** None.
* **Downstream microservice calls:**
  * **Roadmap Service:** HTTP POST to `http://localhost:8005/run/roadmap` (or `process.env.M5_ROADMAP_URL`) sending:
    ```json
    {
      "user_id": "uuid-string (user id)",
      "missing_skills": ["missing-skill-strings"],
      "hours_per_week": 10,
      "deadline_weeks": 8,
      "job_title": "string"
    }
    ```
* **Known issues or TODOs visible in code:** The `hours_per_week` and `deadline_weeks` inputs sent to the roadmap service are hardcoded to `10` and `8` respectively.

#### GET /api/resumes/recommendations/:id
* **Controller function:** `getRecommendedCourses` in [resumes.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/resumes.controller.js#L243)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.params` fields: `id` (resume record ID).
* **Output:** (Status 200)
  ```json
  [
    {
      "id": "uuid-string",
      "skill_gap_id": "uuid-string",
      "skill_id": "uuid-string",
      "course_id": "course-slug",
      "course_title": "Course Title",
      "course_provider": "Coursera",
      "course_url": "https://...",
      "course_level": "Intermediate",
      "course_duration": 40,
      "course_rating": 4.5,
      "course_price": 0,
      "price_currency": "USD",
      "status": "Not Enrolled",
      "progress": 0
    }
  ]
  ```
* **Supabase tables read:** `candidate_matches` (joins `job_postings`), `resumes`, `skills` (checks if skill exists by case-insensitive name), `skill_gaps` (checks if gap exists for the profile and skill), `job_seeker_profiles` (obtains profile ID matching user).
* **Supabase tables written:**
  * `skills` (creates skill if missing by name, category set to `'other'`)
  * `skill_gaps` (creates a gap record with `gap_level: 'high'` if missing)
  * `course_recommendations` (inserts course details parsed from the recommendation)
* **Downstream microservice calls:**
  * **Course Recommender:** HTTP POST to `http://localhost:8006/run` (or `process.env.COURSE_REC_URL`) sending:
    ```json
    {
      "user_id": "uuid-string (user id)",
      "user_profile": {
        "skills": ["normalized-skill-names"],
        "experience_years": 0,
        "education": "",
        "location": ""
      },
      "job_title": "string (job posting title)",
      "top_n": 5
    }
    ```
* **Known issues or TODOs visible in code:**
  * Hardcodes `experience_years` as 0, `education` as `""`, and `location` as `""` in the course recommender input.
  * If saving recommendations fail or none are saved, falls back to raw recommendations with mocked incrementing IDs (`c1`, `c2`, etc.).

---

### Route File: matches.routes.js

#### POST /api/matches/run
* **Controller function:** `runMatching` in [matches.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/matches.controller.js#L21)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.body` fields: `resume_id` (required), `job_id` (required).
* **Output:** (Status 200)
  ```json
  {
    "match_id": "uuid-string",
    "match_score": 85,
    "readiness_score": 90,
    "matched_skills": ["React", "TypeScript"],
    "missing_skills": ["Docker"],
    "recommended_courses": [ ... ],
    "recommended_jobs": [ ... ],
    "roadmap": { ... },
    "errors": [ ... ]
  }
  ```
* **Supabase tables read:** `users`, `job_seeker_profiles`, `resumes` (fetches `normalized_skills`), `job_postings`, `skills` (checks by name).
* **Supabase tables written:**
  * `candidate_matches` (upserts match score metrics)
  * `readiness_scores` (inserts readiness scores)
  * `skills` (inserts new skill if missing by name)
  * `skill_gaps` (inserts skill gap record with `gap_level: 'critical'`)
  * `course_recommendations` (inserts details of recommended courses)
  * `roadmaps` (inserts augmented roadmap)
  * `notifications` (inserts notification row signaling roadmap is ready)
* **Downstream microservice calls:**
  1. **CV Matching:** HTTP POST to `http://localhost:8003/match` sending candidate resume details.
  2. **Skill Gap:** HTTP POST to `http://localhost:8004/analyze-role-gap` sending role name, user skills, and experience.
  3. **Course Recommender:** HTTP POST to `http://localhost:8006/run` requesting up to 5 courses.
  4. **Job Recommender:** HTTP POST to `http://localhost:8007/run` requesting up to 5 jobs.
  5. **Roadmap Service:** HTTP POST to `http://localhost:8005/run/roadmap` requesting timeline roadmap.
  6. **Roadmap Explanation:** HTTP POST to `http://localhost:8005/run/explain` (for each roadmap step) to enrich with why skill is needed.
* **Known issues or TODOs visible in code:**
  * Employs heavy fallback logic (if cv_matching fails, defaults score to `75`; if skill_gap fails, manually intersects skills).
  * Candidate education is hardcoded to `'Bachelor'` for cv_matching, skill_gap, course_rec, and job_rec payloads.
  * Roadmap request has hardcoded fields: `hours_per_week: 10`, `deadline_weeks: 8`. Explanation request has hardcoded fields: `match_score: 0.85`, `market_freq: 1.0`.

#### GET /api/matches
* **Controller function:** `getMatchResults` in [matches.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/matches.controller.js#L397)
* **Auth required:** Yes (via `protect`)
* **Input:** None.
* **Output:** (Status 200) See the exact output in **Q6** response.
* **Supabase tables read:** `candidate_matches` (joins `job_postings`).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

---

### Route File: courses.routes.js

#### GET /api/courses
* **Controller function:** `getAllCourses` in [courses.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/courses.controller.js#L97)
* **Auth required:** Yes (via `protect`)
* **Input:** None.
* **Output:** (Status 200)
  ```json
  [
    {
      "id": "uuid-string",
      "course_id": "ML-001",
      "course_title": "Advanced Machine Learning Specialization",
      "course_provider": "Coursera",
      "course_url": "https://...",
      "course_level": "Advanced",
      "course_duration": 160,
      "course_rating": 4.8,
      "course_price": 49,
      "price_currency": "USD",
      "status": "In Progress",
      "progress": 50
    }
  ]
  ```
* **Supabase tables read:** `job_seeker_profiles` (locates/creates profile), `skill_gaps`, `course_recommendations` (matching user's gaps), `learning_progress` (to extract current user's enrollment status/percentage).
* **Supabase tables written:** `job_seeker_profiles` (creates one if missing for user).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** If the user has no personalized recommendations saved, falls back to a hardcoded local array `DEFAULT_COURSES`.

#### GET /api/courses/:courseId
* **Controller function:** `getCourseById` in [courses.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/courses.controller.js#L155)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.params` fields: `courseId`.
* **Output:** (Status 200)
  ```json
  {
    "id": "c1",
    "course_id": "ML-001",
    "course_title": "Advanced Machine Learning",
    "course_provider": "Coursera",
    "course_url": "https://...",
    "course_level": "Advanced",
    "course_duration": 160,
    "course_rating": 4.8,
    "course_price": 49,
    "price_currency": "USD",
    "proficiency_gain_expected": "Advanced",
    "description": "..."
  }
  ```
* **Supabase tables read:** `course_recommendations` (only if the ID doesn't match default courses starting with `c1` to `c5`).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Resolves static mock items (e.g. `c1` to `c5`) directly from memory before querying the DB.

#### POST /api/courses/:courseId/enroll
* **Controller function:** `enrollInCourse` in [courses.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/courses.controller.js#L176)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.params` fields: `courseId`.
* **Output:** (Status 201)
  ```json
  {
    "message": "Enrolled successfully",
    "enrollment": {
      "job_seeker_profile_id": "uuid-string",
      "course_recommendation_id": "uuid-string",
      "status": "in_progress",
      "completion_percentage": 0,
      "enrolled_at": "2026-06-14T17:53:09Z"
    }
  }
  ```
* **Supabase tables read:** `job_seeker_profiles` (locates/creates profile), `skill_gaps` (fetches first gap to associate with default course if necessary).
* **Supabase tables written:**
  * `job_seeker_profiles` (creates profile if missing)
  * `course_recommendations` (inserts default course details if enrolling in `c1`-`c5` to make it a persistent DB recommendation)
  * `learning_progress` (upserts progress record)
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** If enrolling in a default course (ID starts with `'c'`), the code queries the first available record in `skill_gaps` to fetch a `gapId` for associating. If no skill gaps exist in the table, `gapId` defaults to `null`.

#### PUT /api/courses/:courseId/progress
* **Controller function:** `updateProgress` in [courses.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/courses.controller.js#L253)
* **Auth required:** Yes (via `protect`)
* **Input:**
  * `req.params` fields: `courseId`.
  * `req.body` fields: `progress` (completion percentage integer).
* **Output:** (Status 200)
  ```json
  {
    "message": "Progress updated",
    "data": {
      "job_seeker_profile_id": "uuid-string",
      "course_recommendation_id": "uuid-string",
      "completion_percentage": 100,
      "status": "completed",
      "completed_at": "2026-06-14T17:53:09Z"
    }
  }
  ```
* **Supabase tables read:** `job_seeker_profiles` (locates/creates profile).
* **Supabase tables written:**
  * `job_seeker_profiles` (creates profile if missing)
  * `learning_progress` (updates completion percentage, status, and sets `completed_at` to timestamp if progress >= 100).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### POST /api/courses/
* **Controller function:** `addCourse` in [courses.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/courses.controller.js#L281)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.body` fields (full properties representing a `course_recommendations` table row).
* **Output:** (Status 201)
  ```json
  {
    "id": "uuid-string",
    "course_title": "Added Course Title",
    ...
  }
  ```
* **Supabase tables read:** None.
* **Supabase tables written:** `course_recommendations` (inserts a new recommendation record).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Does not validate input fields before inserting into the DB.

---

### Route File: roadmap.routes.js

#### GET /api/roadmap/:resumeId
* **Controller function:** `getRoadmapByResumeId` in [roadmap.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/roadmap.controller.js#L3)
* **Auth required:** Yes (via `authenticate`, which maps to `protect`)
* **Input:** `req.params` fields: `resumeId`.
* **Output:** (Status 200)
  ```json
  {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "resume_id": "uuid-string",
    "job_id": "uuid-string",
    "roadmap_data": { ... },
    "explanation": "Timeline career roadmap generated successfully.",
    "created_at": "...",
    "updated_at": "..."
  }
  ```
* **Supabase tables read:** `roadmaps` (filters on `resume_id` and `user_id`, orders by `created_at` descending and retrieves the single latest record).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

---

### Route File: progress.routes.js

#### GET /api/progress
* **Controller function:** `getProgress` in [progress.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/progress.controller.js#L12)
* **Auth required:** Yes (via `protect`)
* **Input:** None.
* **Output:** (Status 200)
  ```json
  [
    {
      "id": "uuid-string",
      "job_seeker_profile_id": "uuid-string",
      "course_recommendation_id": "uuid-string",
      "status": "in_progress",
      "completion_percentage": 40,
      "enrolled_at": "...",
      "completed_at": null,
      "course_recommendations": {
        "id": "uuid-string",
        "course_title": "Course Title",
        ...
      }
    }
  ]
  ```
* **Supabase tables read:** `job_seeker_profiles` (to fetch profile ID), `learning_progress` (joins `course_recommendations`).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### POST /api/progress/update
* **Controller function:** `updateProgress` in [progress.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/progress.controller.js#L30)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.body` fields: `courseId` (required), `status` (optional, defaults to `'in_progress'`), `progress` (optional, defaults to `0`).
* **Output:** (Status 200)
  ```json
  {
    "id": "uuid-string",
    "job_seeker_profile_id": "uuid-string",
    "course_recommendation_id": "uuid-string",
    "status": "in_progress",
    "completion_percentage": 50,
    "enrolled_at": "..."
  }
  ```
* **Supabase tables read:** `job_seeker_profiles` (to fetch profile ID).
* **Supabase tables written:** `learning_progress` (upserts enrollment details with conflict target `job_seeker_profile_id,course_recommendation_id`).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Unlike `courses.controller.js`'s update progress route, this function does not support automated completion detection (`progress >= 100`) to mark status as `'completed'` or set a `completed_at` timestamp.

---

### Route File: notifications.routes.js

#### GET /api/notifications
* **Controller function:** `getUserNotifications` in [notifications.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/notifications.controller.js#L3)
* **Auth required:** Yes (via `authenticate`, which maps to `protect`)
* **Input:** None.
* **Output:** (Status 200)
  ```json
  [
    {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "type": "new_match",
      "title": "Career Roadmap Ready",
      "body": "Your career roadmap for Software Engineer is ready!",
      "is_read": false,
      "created_at": "2026-06-14T17:50:00Z"
    }
  ]
  ```
* **Supabase tables read:** `notifications` (filters on `user_id` and orders by `created_at` descending).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

---

### Route File: skills.routes.js

#### GET /api/skills
* **Controller function:** `getAllSkills` in [skills.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/skills.controller.js#L12)
* **Auth required:** Yes (via `protect`)
* **Input:** None.
* **Output:** (Status 200)
  ```json
  [
    {
      "id": "uuid-string",
      "name": "JavaScript",
      "category": "programming"
    }
  ]
  ```
* **Supabase tables read:** `skills` (ordered by `name` alphabetically).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### GET /api/skills/me
* **Controller function:** `getMySkills` in [skills.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/skills.controller.js#L25)
* **Auth required:** Yes (via `protect`)
* **Input:** None.
* **Output:** (Status 200)
  ```json
  [
    {
      "id": "uuid-string",
      "job_seeker_profile_id": "uuid-string",
      "skill_id": "uuid-string",
      "proficiency": "intermediate",
      "years_of_experience": 3,
      "source": "manual",
      "added_at": "...",
      "skills": {
        "id": "uuid-string",
        "name": "React",
        "category": "frontend"
      }
    }
  ]
  ```
* **Supabase tables read:** `job_seeker_profiles` (to get profile ID), `user_skills` (joins `skills`).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### POST /api/skills/me
* **Controller function:** `addMySkill` in [skills.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/skills.controller.js#L43)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.body` fields: `skillName` (required), `proficiency` (optional, defaults to `'intermediate'`), `yearsOfExperience` (optional, defaults to `1`).
* **Output:** (Status 200)
  ```json
  {
    "id": "uuid-string",
    "job_seeker_profile_id": "uuid-string",
    "skill_id": "uuid-string",
    "proficiency": "intermediate",
    "years_of_experience": 3,
    "source": "manual",
    "added_at": "2026-06-14T17:53:09Z"
  }
  ```
* **Supabase tables read:** `job_seeker_profiles` (to get profile ID), `skills` (to check if skill exists by name).
* **Supabase tables written:**
  * `skills` (inserts skill record with category `'other'` if missing by name)
  * `user_skills` (upserts user skill mapping record with conflict target `job_seeker_profile_id,skill_id`).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

---

### Route File: jobs.routes.js

#### GET /api/jobs
* **Controller function:** `getAllJobs` in [jobs.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/jobs.controller.js#L7)
* **Auth required:** No (Public Route)
* **Input:** `req.query` fields: `location` (optional), `jobType` or `type` (optional), `status` (optional, defaults to `'open'`).
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "data": {
      "jobs": [
        {
          "id": "uuid-string",
          "title": "Software Engineer",
          "job_description": "We are looking for...",
          "location": "Remote",
          "company": "Tech Corp",
          "required_skills": ["JavaScript", "Node.js"],
          "job_type": "full_time",
          "status": "open",
          "recruiter_id": "uuid-string",
          "created_at": "..."
        }
      ]
    }
  }
  ```
* **Supabase tables read:** `job_postings`.
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Normalizes `jobType`/`type` query input (lowercases, replaces dashes with underscores).

#### GET /api/jobs/:jobId
* **Controller function:** `getJobById` in [jobs.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/jobs.controller.js#L42)
* **Auth required:** No (Public Route)
* **Input:** `req.params` fields: `jobId`.
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-string",
      "title": "Software Engineer",
      ...
    }
  }
  ```
* **Supabase tables read:** `job_postings`.
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### POST /api/jobs
* **Controller function:** `createJob` in [jobs.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/jobs.controller.js#L68)
* **Auth required:** Yes (via `protect`, must have role `'recruiter'` or `'admin'`)
* **Input:** `req.body` fields: `title` (required), `job_description` or `description` (optional), `location` (optional), `company` (optional), `required_skills` (optional), `job_type` or `jobType` (optional), `status` (optional, defaults to `'open'`).
* **Output:** (Status 201)
  ```json
  {
    "success": true,
    "data": {
      "job": {
        "id": "uuid-string",
        "title": "Software Engineer",
        "recruiter_id": "uuid-string",
        ...
      }
    }
  }
  ```
* **Supabase tables read:** None.
* **Supabase tables written:** `job_postings` (inserts new job posting, saving current user's ID as `recruiter_id`).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Checks roles directly via `req.user.role`. Hardcodes default location as `'Remote'` and company as `'Company'`.

#### PUT /api/jobs/:jobId
* **Controller function:** `updateJob` in [jobs.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/jobs.controller.js#L125)
* **Auth required:** Yes (via `protect`, must be `'admin'` or the owner recruiter matching `recruiter_id`)
* **Input:**
  * `req.params` fields: `jobId`.
  * `req.body` fields: `title`, `job_description` or `description`, `location`, `company`, `required_skills`, `job_type` or `jobType`, `status` (all optional).
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-string",
      "title": "Updated Title",
      ...
    }
  }
  ```
* **Supabase tables read:** `job_postings` (checks recruiter ownership before updating).
* **Supabase tables written:** `job_postings` (updates matching columns).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Normalizes `jobType`/`job_type` in the updates object (replaces dashes with underscores).

#### DELETE /api/jobs/:jobId
* **Controller function:** `deleteJob` in [jobs.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/jobs.controller.js#L192)
* **Auth required:** Yes (via `protect`, must be `'admin'` or the owner recruiter matching `recruiter_id`)
* **Input:** `req.params` fields: `jobId`.
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "message": "Job deleted"
  }
  ```
* **Supabase tables read:** `job_postings` (checks recruiter ownership before deleting).
* **Supabase tables written:** `job_postings` (deletes the record).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### POST /api/jobs/:jobId/apply
* **Controller function:** `applyToJob` in [jobs.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/jobs.controller.js#L231)
* **Auth required:** Yes (via `protect`)
* **Input:** `req.params` fields: `jobId`.
* **Output:** (Status 201)
  ```json
  {
    "success": true,
    "message": "Application submitted successfully",
    "data": {
      "id": "uuid-string",
      "job_posting_id": "uuid-string",
      "job_seeker_profile_id": "uuid-string",
      "user_id": "uuid-string",
      "resume_id": "uuid-string" or null,
      "status": "pending",
      "applied_at": "..."
    }
  }
  ```
* **Supabase tables read:** `job_seeker_profiles` (to get profile ID), `resumes` (gets latest resume ID for current user, ordered by `created_at` descending).
* **Supabase tables written:** `job_applications` (inserts new job application record).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Handles unique constraints (user applying to the same job twice) by checking error code `'23505'` and returning a `409 Conflict` status code.

#### GET /api/jobs/:jobId/applicants
* **Controller function:** `getJobApplicants` in [jobs.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/jobs.controller.js#L290)
* **Auth required:** Yes (via `protect`, must be `'admin'` or the owner recruiter matching `recruiter_id`)
* **Input:** `req.params` fields: `jobId`.
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "data": {
      "candidates": [
        {
          "name": "John Doe",
          "email": "john.doe@example.com",
          "score": 85,
          "matchedSkills": ["React"],
          "missingSkills": ["Docker"]
        }
      ]
    }
  }
  ```
* **Supabase tables read:** `job_postings` (checks recruiter ownership), `job_applications` (joins `users` to read name and email), `candidate_matches` (joins application data on `user_id` to retrieve matching score and skills metadata).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** If no matching record in `candidate_matches` is found for an applicant, the code defaults their score to `75`, and sets matched/missing skills to empty arrays.

#### POST /api/jobs/:jobId/approve
* **Controller function:** `approveJob` in [jobs.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/jobs.controller.js#L360)
* **Auth required:** Yes (via `protect`, must have role `'admin'`)
* **Input:** `req.params` fields: `jobId`.
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "message": "Job posting approved and is now live",
    "data": {
      "id": "uuid-string",
      "status": "open",
      ...
    }
  }
  ```
* **Supabase tables read:** None.
* **Supabase tables written:** `job_postings` (updates `status` to `'open'`).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

---

### Route File: users.routes.js

#### PUT /api/users/:userId
* **Controller function:** `updateProfile` in [users.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/users.controller.js#L7)
* **Auth required:** Yes (via `protect`, must be the user matching `userId` or `'admin'`)
* **Input:**
  * `req.params` fields: `userId`.
  * `req.body` fields: `name`, `email`, `location` (all optional).
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      },
      "profile": {
        "location": "San Francisco, CA"
      }
    }
  }
  ```
* **Supabase tables read:** None directly.
* **Supabase tables written:**
  * `users` (updates `first_name`, `last_name` and `email` if name or email changes)
  * `job_seeker_profiles` (updates `location` if location changes).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Splits `name` input into `first_name` and `last_name` based on the position of the first space character.

#### PUT /api/users/:userId/goals
* **Controller function:** `updateGoals` in [users.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/users.controller.js#L76)
* **Auth required:** Yes (via `protect`, must be the user matching `userId` or `'admin'`)
* **Input:**
  * `req.params` fields: `userId`.
  * `req.body` fields: `goals` (array of career goals, defaults to empty array).
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "message": "Goals updated successfully",
    "data": {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "goals": ["Learn Docker", "Become Tech Lead"],
      ...
    }
  }
  ```
* **Supabase tables read:** None.
* **Supabase tables written:** `job_seeker_profiles` (updates the `goals` JSON/array column for user).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.

#### GET /api/users/:userId/saved-jobs
* **Controller function:** `getSavedJobs` in [users.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/users.controller.js#L111)
* **Auth required:** Yes (via `protect`, must be the user matching `userId` or `'admin'`)
* **Input:** `req.params` fields: `userId`.
* **Output:** (Status 200)
  ```json
  [
    {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "job_posting_id": "uuid-string",
      "saved_at": "...",
      "job_postings": {
        "id": "uuid-string",
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "Remote",
        "job_type": "full_time",
        "status": "open",
        "created_at": "..."
      }
    }
  ]
  ```
* **Supabase tables read:** `saved_jobs` (joins `job_postings`).
* **Supabase tables written:** None.
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Returns the array of saved jobs directly to support frontend mapping logic.

#### POST /api/users/:userId/saved-jobs
* **Controller function:** `saveJob` in [users.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/users.controller.js#L149)
* **Auth required:** Yes (via `protect`, must be the user matching `userId` or `'admin'`)
* **Input:**
  * `req.params` fields: `userId`.
  * `req.body` fields: `jobId` (required).
* **Output:** (Status 201)
  ```json
  {
    "success": true,
    "message": "Job saved successfully",
    "data": {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "job_posting_id": "uuid-string",
      "saved_at": "..."
    }
  }
  ```
* **Supabase tables read:** None.
* **Supabase tables written:** `saved_jobs` (inserts a new saved job record).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** Catches duplicate saved jobs by looking for database error code `'23505'` and returning a `409 Conflict`.

#### DELETE /api/users/:userId/saved-jobs/:jobId
* **Controller function:** `removeSavedJob` in [users.controller.js](file:///d:/Grad/Repo/AI-Skill-Mentor-Job-Seekers/backend/src/controllers/users.controller.js#L193)
* **Auth required:** Yes (via `protect`, must be the user matching `userId` or `'admin'`)
* **Input:** `req.params` fields: `userId`, `jobId`.
* **Output:** (Status 200)
  ```json
  {
    "success": true,
    "message": "Job removed from saved list"
  }
  ```
* **Supabase tables read:** None.
* **Supabase tables written:** `saved_jobs` (deletes record matching user ID and job posting ID).
* **Downstream microservice calls:** None.
* **Known issues or TODOs visible in code:** None.
