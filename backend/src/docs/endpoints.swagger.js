/**
 * @swagger
 * tags:
 *   - name: Auth
 *   - name: Resumes
 *   - name: Jobs
 *   - name: Applications
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email: { type: string, example: recruiter@test.com }
 *               password: { type: string, example: Test12345678 }
 *               role: { type: string, enum: [job_seeker, recruiter, admin] }
 *     responses:
 *       201: { description: Created }
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /resumes:
 *   post:
 *     tags: [Resumes]
 *     summary: Upload resume (job seeker)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Created }
 *
 *   get:
 *     tags: [Resumes]
 *     summary: List my resumes (job seeker)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /resumes/{resumeId}/analyze:
 *   post:
 *     tags: [Resumes]
 *     summary: Start resume analysis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /resumes/{resumeId}/analysis:
 *   get:
 *     tags: [Resumes]
 *     summary: Get resume analysis result
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List public jobs
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /jobs/{jobId}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get job by id
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /jobs/recruiter:
 *   post:
 *     tags: [Jobs]
 *     summary: Recruiter creates a job
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, jobType, company]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               jobType: { type: string, enum: [full_time, part_time, contract, remote] }
 *               company: { type: string }
 *               requiredSkills:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201: { description: Created }
 */

/**
 * @swagger
 * /jobs/recruiter/mine:
 *   get:
 *     tags: [Jobs]
 *     summary: Recruiter lists own jobs
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /jobs/recruiter/{jobId}:
 *   patch:
 *     tags: [Jobs]
 *     summary: Recruiter updates a job
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 *
 *   delete:
 *     tags: [Jobs]
 *     summary: Recruiter deletes a job
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */

/**
 * @swagger
 * /job-applications:
 *   post:
 *     tags: [Applications]
 *     summary: Job seeker applies to a job
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobPostingId]
 *             properties:
 *               jobPostingId: { type: string }
 *               resumeId: { type: string, nullable: true }
 *     responses:
 *       201: { description: Created }
 */

/**
 * @swagger
 * /job-applications/mine:
 *   get:
 *     tags: [Applications]
 *     summary: Job seeker lists own applications
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /job-applications/recruiter/job/{jobId}:
 *   get:
 *     tags: [Applications]
 *     summary: Recruiter lists applications for a job they own
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */

/**
 * @swagger
 * /job-applications/recruiter/{appId}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Recruiter updates application status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, reviewed, interview, rejected, hired] }
 *               notes: { type: string }
 *     responses:
 *       200: { description: OK }
 */
/**
 * @swagger
 * tags:
 *   - name: Resumes
 *     description: Resume upload + analysis
 */

/**
 * @swagger
 * /resumes:
 *   post:
 *     tags: [Resumes]
 *     summary: Upload resume (Job Seeker)
 *     description: Calls uploadResume controller. Upload a PDF/DOCX resume.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Resume uploaded
 *       400:
 *         description: Missing file or invalid file
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags: [Resumes]
 *     summary: List my resumes (Job Seeker)
 *     description: Calls listMyResumes controller.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of resumes
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /resumes/{resumeId}/analyze:
 *   post:
 *     tags: [Resumes]
 *     summary: Analyze a resume (Job Seeker)
 *     description: Calls analyzeResume controller. Starts analysis / marks status processing.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: resumeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 69715cc92c6fe4db3bba364a
 *     responses:
 *       200:
 *         description: Analysis started
 *       400:
 *         description: Invalid resumeId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 */

/**
 * @swagger
 * /resumes/{resumeId}/analysis:
 *   get:
 *     tags: [Resumes]
 *     summary: Get resume analysis result (Job Seeker)
 *     description: Calls getResumeAnalysis controller.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: resumeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 69715cc92c6fe4db3bba364a
 *     responses:
 *       200:
 *         description: Resume analysis result
 *       400:
 *         description: Invalid resumeId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 */
/**
 * @swagger
 * tags:
 *   - name: Applications
 *     description: Job applications workflow
 */

/**
 * @swagger
 * /job-applications:
 *   post:
 *     tags: [Applications]
 *     summary: Apply to a job (Job Seeker)
 *     description: Calls createApplication controller.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobPostingId]
 *             properties:
 *               jobPostingId:
 *                 type: string
 *                 example: 69716aa430c699e3ec7319a6
 *               resumeId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Application created
 *       400:
 *         description: Invalid input or job not open
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Already applied
 */

/**
 * @swagger
 * /job-applications/mine:
 *   get:
 *     tags: [Applications]
 *     summary: List my applications (Job Seeker)
 *     description: Calls listMyApplications controller.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /job-applications/recruiter/job/{jobId}:
 *   get:
 *     tags: [Applications]
 *     summary: Recruiter views applications for their job
 *     description: Calls listJobApplicationsForRecruiter controller.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 69716aa430c699e3ec7319a6
 *     responses:
 *       200:
 *         description: Applications for the job
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 */

/**
 * @swagger
 * /job-applications/recruiter/{appId}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Recruiter updates application status
 *     description: Calls updateApplicationStatus controller.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 697170e5d1a2b3c4d5e6f789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, interview, rejected, hired]
 *                 example: interview
 *               notes:
 *                 type: string
 *                 example: Schedule interview next week
 *     responses:
 *       200:
 *         description: Application updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin management endpoints
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [job_seeker, recruiter, admin]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: Users list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /admin/users/{userId}/deactivate:
 *   patch:
 *     tags: [Admin]
 *     summary: Deactivate a user (soft disable)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 69714e9602d9cdc295239810
 *     responses:
 *       200:
 *         description: User deactivated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     tags: [Admin]
 *     summary: List all jobs (moderation)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, on_hold, filled]
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by title/company/location
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: Jobs list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /admin/jobs/{jobId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a job (moderation)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         example: 69716aa430c699e3ec7319a6
 *     responses:
 *       200:
 *         description: Job deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: View system stats (basic)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats returned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
