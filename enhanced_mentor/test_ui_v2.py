from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

@router.get("/v2/test-ui", response_class=HTMLResponse)
async def get_test_ui_v2():
    """Returns the enhanced AI Skill Mentor UI with intelligent recommendations."""
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Skill Mentor PRO - Smart Career Pathfinder</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.8em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .header p {
            font-size: 1.1em;
            opacity: 0.95;
        }
        .content {
            padding: 50px 40px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section-title {
            font-size: 1.4em;
            font-weight: 700;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            font-weight: 600;
            color: #555;
            margin-bottom: 8px;
            font-size: 0.95em;
        }
        input[type="file"], textarea {
            width: 100%;
            padding: 14px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-family: inherit;
            font-size: 14px;
            transition: all 0.3s;
        }
        textarea {
            resize: vertical;
            min-height: 140px;
        }
        input[type="file"]:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        .status {
            margin-top: 16px;
            padding: 14px 16px;
            border-radius: 10px;
            font-weight: 600;
            display: none;
            font-size: 0.95em;
        }
        .status.show { display: block; }
        .status.success { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
        .status.error { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
        .status.info { background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8; }
        
        .skills-container {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            display: none;
            border-left: 5px solid #667eea;
        }
        .skills-container.show { display: block; }
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 12px;
        }
        .skill-tag {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }
        
        .results {
            display: none;
        }
        .results.show { display: block; }
        
        .item-card {
            background: #f8f9fa;
            border-left: 5px solid #667eea;
            padding: 24px;
            margin-bottom: 18px;
            border-radius: 10px;
            transition: all 0.3s;
        }
        .item-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            transform: translateY(-2px);
        }
        
        .item-title {
            font-size: 1.15em;
            font-weight: 700;
            color: #333;
            margin-bottom: 10px;
        }
        .item-meta {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 12px;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        .item-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 0.85em;
            font-weight: 600;
            margin-right: 8px;
            margin-bottom: 8px;
        }
        .badge.match { background: #d4edda; color: #155724; }
        .badge.missing { background: #f8d7da; color: #721c24; }
        .badge.level { background: #e7f3ff; color: #004085; }
        .badge.recent { background: #fff3cd; color: #856404; }
        
        .item-desc {
            color: #555;
            line-height: 1.6;
            margin-bottom: 14px;
            font-size: 0.95em;
        }
        .item-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .item-links a {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 0.85em;
            font-weight: 600;
            transition: all 0.2s;
        }
        .item-links a:hover {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .loading {
            text-align: center;
            padding: 30px;
            display: none;
        }
        .loading.show { display: block; }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .no-results {
            background: #f0f0f0;
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            color: #666;
            font-size: 1.05em;
        }
        
        .progress-indicator {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 10px;
        }
        .step {
            flex: 1;
            padding: 12px;
            text-align: center;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9em;
            background: #e7f3ff;
            color: #004085;
        }
        .step.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .step.completed {
            background: #d4edda;
            color: #155724;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>🚀 Skill Mentor PRO</h1>
        <p>AI-Powered Resume Analysis & Intelligent Career Recommendations</p>
    </div>

    <div class="content">
        <div class="progress-indicator">
            <div class="step active">1️⃣ Upload</div>
            <div class="step">2️⃣ Analyze</div>
            <div class="step">3️⃣ Jobs</div>
            <div class="step">4️⃣ Courses</div>
        </div>

        <div class="section">
            <div class="section-title">📄 Step 1: Upload Your Resume</div>
            <div class="form-group">
                <label>Select PDF Resume File</label>
                <input type="file" id="resumeFile" accept=".pdf">
            </div>
            <button class="btn" onclick="handleAnalyze()">🔍 Analyze Resume & Find Opportunities</button>
            <div id="uploadStatus" class="status"></div>
        </div>

        <div class="section">
            <div class="section-title">📝 Step 2: Resume Content</div>
            <textarea id="resumeText" placeholder="Resume text will appear here after upload..."></textarea>
            <div id="skillsContainer" class="skills-container">
                <strong>🎯 Intelligent Skill Extraction:</strong>
                <div id="skillsList" class="skill-tags"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">💼 Step 3: Job Recommendations</div>
            <div id="jobsLoading" class="loading">
                <div class="spinner"></div>
                <p>Analyzing job market fit...</p>
            </div>
            <div id="jobsResults" class="results"></div>
        </div>

        <div class="section">
            <div class="section-title">📚 Step 4: Skill Development Courses</div>
            <p style="color: #666; margin-bottom: 16px; font-size: 0.95em;">Courses ordered by progression level - start with foundations and advance systematically</p>
            <div id="coursesLoading" class="loading">
                <div class="spinner"></div>
                <p>Building your learning path...</p>
            </div>
            <div id="coursesResults" class="results"></div>
        </div>
    </div>
</div>

<script>
async function handleAnalyze() {
    const resumeFile = document.getElementById('resumeFile');
    const resumeText = document.getElementById('resumeText');
    const uploadStatus = document.getElementById('uploadStatus');
    const statusEl = uploadStatus;

    try {
        statusEl.className = 'status show info';
        statusEl.textContent = '⏳ Processing resume...';

        let text = '';
        let skills = [];

        if (resumeFile.files[0]) {
            const formData = new FormData();
            formData.append('file', resumeFile.files[0]);
            const uploadResp = await fetch('/api/v2/upload-cv', { method: 'POST', body: formData });
            if (!uploadResp.ok) throw new Error('Upload failed');
            const uploadData = await uploadResp.json();
            text = uploadData.full_text;
            skills = uploadData.extracted_skills || [];
            resumeText.value = text;
        } else if (resumeText.value.trim()) {
            text = resumeText.value.trim();
            const extractResp = await fetch('/api/v2/extract-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (!extractResp.ok) throw new Error('Extraction failed');
            const extractData = await extractResp.json();
            skills = extractData.skills || [];
        } else {
            throw new Error('Please upload a PDF or paste resume text');
        }

        if (skills.length) {
            document.getElementById('skillsContainer').classList.add('show');
            document.getElementById('skillsList').innerHTML = skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
        } else {
            document.getElementById('skillsContainer').classList.remove('show');
        }

        statusEl.className = 'status show success';
        statusEl.textContent = '✅ Resume analyzed! Finding best-fit jobs...';

        await fetchJobs(text, skills);
    } catch (e) {
        statusEl.className = 'status show error';
        statusEl.textContent = '❌ Error: ' + e.message;
    }
}

async function fetchJobs(text, skills) {
    const jobsLoading = document.getElementById('jobsLoading');
    const jobsResults = document.getElementById('jobsResults');
    jobsLoading.classList.add('show');
    jobsResults.innerHTML = '';

    try {
        const resp = await fetch('/api/v2/recommend-jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_profile: text, top_n: 10 })
        });
        if (!resp.ok) throw new Error('Job fetch failed');
        const data = await resp.json();

        if (!data.success || !data.data || data.data.length === 0) {
            jobsResults.innerHTML = '<div class="no-results">No matching jobs found. Try uploading a different resume.</div>';
            jobsResults.classList.add('show'); // Ensure message is visible
            jobsLoading.classList.remove('show');
            return;
        }

        jobsResults.innerHTML = data.data.map((job, idx) => `
            <div class="item-card">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="flex:1;">
                        <div class="item-title">${idx + 1}. ${job.job_title || 'Unknown'}</div>
                        <div class="item-meta">
                            <span>🏢 ${job.company || 'N/A'}</span>
                            <span>📍 ${job.location || 'Remote'}</span>
                            ${job.recent_days !== null && job.recent_days !== undefined ? `<span class="badge recent">📅 ${job.recent_days}d ago</span>` : ''}
                        </div>
                    </div>
                    <div style="font-size:2em; font-weight:700; color:#667eea; min-width:60px; text-align:right;">
                        ${Math.round((job.readiness_score || 0) * 100)}%
                    </div>
                </div>
                <div class="item-desc">${job.description || 'Position details available'}</div>
                <div style="margin-bottom:12px;">
                    ${(job.matched_skills || []).map(s => `<span class="badge match">✓ ${s}</span>`).join('')}
                    ${(job.missing_skills || []).slice(0, 3).map(s => `<span class="badge missing">→ ${s}</span>`).join('')}
                </div>
                <div class="item-links">
                    ${job.url ? `<a href="${job.url}" target="_blank">View Job</a>` : ''}
                    ${job.linkedin_url ? `<a href="${job.linkedin_url}" target="_blank">LinkedIn</a>` : ''}
                </div>
            </div>
        `).join('');

        jobsResults.classList.add('show'); // <-- BUG FIX: Display the results

        let targetJob = data.data.find(j => j.missing_skills && j.missing_skills.length > 0);
        let targetSkills = targetJob ? targetJob.missing_skills : [];
        
        if (targetSkills.length > 0) {
            await fetchCourses(skills, targetSkills);
        } else {
            document.getElementById('coursesLoading').classList.remove('show');
            document.getElementById('coursesResults').innerHTML = '<div class="no-results">You are a 100% match for the top jobs! No critical skill gaps found to recommend courses for.</div>';
            document.getElementById('coursesResults').classList.add('show');
        }
    } catch (e) {
        jobsResults.innerHTML = `<div class="no-results">Error: ${e.message}</div>`;
        jobsResults.classList.add('show');
    } finally {
        jobsLoading.classList.remove('show');
    }
}

async function fetchCourses(userSkills, targetSkills) {
    const coursesLoading = document.getElementById('coursesLoading');
    const coursesResults = document.getElementById('coursesResults');
    coursesLoading.classList.add('show');
    coursesResults.innerHTML = '';

    try {
        const resp = await fetch('/api/v2/ai/recommend/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ missingSkills: targetSkills, top_n: 10 })
        });
        if (!resp.ok) throw new Error('Course fetch failed');
        const data = await resp.json();

        if (!data || data.length === 0) {
            coursesResults.innerHTML = '<div class="no-results">No courses found. Your skills already match requirements!</div>';
            coursesResults.classList.add('show');
            coursesLoading.classList.remove('show');
            return;
        }

        let html = '';
        data.forEach(skillGroup => {
            html += `<h3 style="margin-top: 20px; color: var(--text-dark); font-size: 1.2em; font-weight: 600;">📚 Recommended for: ${skillGroup.skillName}</h3>`;
            html += skillGroup.courses.map((course, idx) => {
                const levelEmoji = {'All Levels': '📚', 'Beginner': '🌱', 'Intermediate': '🌿', 'Advanced': '🌳'}[course.level] || '📚';
                return `
                    <div class="item-card">
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <div style="flex:1;">
                                <div class="item-title">${idx + 1}. ${course.title || 'Unknown'}</div>
                                <div class="item-meta">
                                    <span>📚 ${course.provider}</span>
                                    <span>${levelEmoji} ${course.level}</span>
                                    <span>⭐ ${course.rating || 'N/A'}</span>
                                    <span>⏱️ ${course.duration}</span>
                                </div>
                            </div>
                            <div style="font-size:1.5em; font-weight:700; color:#48bb78; min-width:50px; text-align:right;">
                                ${Math.round((course.score || 0) * 100)}%
                            </div>
                        </div>
                        <div class="item-desc">${course.description || 'Course details available'}</div>
                        <div class="item-links">
                            <a href="${course.url || '#'}" target="_blank">View Course</a>
                        </div>
                    </div>
                `;
            }).join('');
        });

        coursesResults.innerHTML = html;
        
        coursesResults.classList.add('show'); // <-- BUG FIX: Display the results
    } catch (e) {
        coursesResults.innerHTML = `<div class="no-results">Error: ${e.message}</div>`;
        coursesResults.classList.add('show');
    } finally {
        coursesLoading.classList.remove('show');
    }
}
</script>

</body>
</html>
    """
