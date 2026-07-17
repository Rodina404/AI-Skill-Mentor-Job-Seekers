const { supabaseAdmin } = require('../config/supabase');
const axios = require('axios');
const { persistAndConfirmJobRecommendations } = require('../repositories/jobRecommendations.repository');

const SERVICES = {
  matching:  process.env.CV_MATCHING_URL  || 'http://localhost:8003',
  gapEngine: process.env.GAP_ENGINE_URL   || 'http://localhost:8004',
  roadmap:   process.env.M5_ROADMAP_URL   || 'http://localhost:8005',
  courseRec: process.env.COURSE_REC_URL   || 'http://localhost:8006',
  jobRec:    process.env.JOB_REC_URL      || 'http://localhost:8007',
};

const getSkillName = s => typeof s === 'string' ? s : (s.skill || s.name || s.skillId || '');

const getNormalizedCourseLevel = level => {
  const lvl = String(level || '').toLowerCase();
  if (lvl.includes('begin') || lvl.includes('intro') || lvl.includes('found')) return 'beginner';
  if (lvl.includes('adv') || lvl.includes('exp') || lvl.includes('expert')) return 'advanced';
  return 'intermediate';
};

const runMatching = async (req, res) => {
  const { resume_id, job_id } = req.body;
  const userId = req.user.id;
  if (!resume_id || !job_id) {
    return res.status(400).json({ error: 'resume_id and job_id are required' });
  }

  const errors = [];
  let matchScore = 0;
  let gapResult = { readiness: 0, required_skills: [], matched_skills: [], missing_skills: [] };
  let courseRecommendations = [];
  let jobRecommendations = [];
  let roadmapResult = null;

  try {
    // 1. Fetch user, profile, resume, and job postings
    console.log(`[Pipeline] Fetching details for user: ${userId}, resume: ${resume_id}, job: ${job_id}`);
    
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users').select('first_name, last_name').eq('id', userId).single();
    if (userErr || !user) throw new Error(`User not found: ${userErr?.message}`);

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('job_seeker_profiles').select('id, years_of_experience, location').eq('user_id', userId).single();
    if (profileErr || !profile) throw new Error(`Job seeker profile not found: ${profileErr?.message}`);

    const { data: resume, error: resumeErr } = await supabaseAdmin
      .from('resumes').select('normalized_skills').eq('id', resume_id).single();
    if (resumeErr || !resume) throw new Error(`Resume not found: ${resumeErr?.message}`);

    const { data: job, error: jobErr } = await supabaseAdmin
      .from('job_postings').select('*').eq('id', job_id).single();
    if (jobErr || !job) throw new Error(`Job posting not found: ${jobErr?.message}`);

    const candidateSkills = (resume.normalized_skills || []).map(s => getSkillName(s));
    const requiredSkills = Array.isArray(job.required_skills)
      ? job.required_skills
      : (typeof job.required_skills === 'string' ? JSON.parse(job.required_skills) : []);

    // 2. Call cv_matching_service
    try {
      console.log('[Pipeline] Calling cv_matching_service...');
      const matchPayload = {
        jobId: job_id,
        jobDescription: job.job_description || job.description || '',
        candidates: [{
          candidateId: resume_id,
          name: `${user.first_name} ${user.last_name}`,
          skills: candidateSkills,
          experience: parseFloat(profile.years_of_experience) || 0.0,
          education: 'Bachelor'
        }]
      };
      
      const { data: matchResponse } = await axios.post(`${SERVICES.matching}/match`, matchPayload, { timeout: 30000 });
      if (matchResponse.success && matchResponse.data?.rankedCandidates?.length > 0) {
        const scoreVal = matchResponse.data.rankedCandidates[0].score;
        matchScore = scoreVal <= 1.0 ? Math.round(scoreVal * 100) : Math.round(scoreVal);
      } else {
        throw new Error(matchResponse.error?.message || 'Empty ranked candidates');
      }
    } catch (err) {
      console.error('[Pipeline] cv_matching_service error:', err.message);
      errors.push({ step: 'cv_matching_service', message: err.message });
      matchScore = 75; // Fallback score
    }

    // 3. Call skill_gap_engine
    try {
      console.log('[Pipeline] Calling skill_gap_engine...');
      const gapPayload = {
        role: job.title,
        skills: candidateSkills,
        experience: profile.years_of_experience ? `${profile.years_of_experience} years` : '0 years',
        education: 'Bachelor'
      };
      
      const { data: gapResponse } = await axios.post(`${SERVICES.gapEngine}/analyze-role-gap`, gapPayload, { timeout: 30000 });
      if (gapResponse.success && gapResponse.data) {
        gapResult = gapResponse.data;
      } else {
        throw new Error('Gap analysis failed');
      }
    } catch (err) {
      console.error('[Pipeline] skill_gap_engine error:', err.message);
      errors.push({ step: 'skill_gap_engine', message: err.message });
      // Construct fallback gap results
      const matched = candidateSkills.filter(s => requiredSkills.includes(s));
      const missing = requiredSkills.filter(s => !candidateSkills.includes(s));
      gapResult = {
        readiness: requiredSkills.length > 0 ? (matched.length / requiredSkills.length) : 0.5,
        required_skills: requiredSkills,
        matched_skills: matched,
        missing_skills: missing,
        confidence: 0.8
      };
    }

    const readinessScoreVal = gapResult.readiness <= 1.0 ? Math.round(gapResult.readiness * 100) : Math.round(gapResult.readiness);

    // 4. Save to candidate_matches
    let matchRecordId = null;
    try {
      const candidateMatchesPayload = {
        job_posting_id: job_id,
        job_seeker_profile_id: profile.id,
        resume_id: resume_id,
        overall_score: matchScore / 100.0,
        skill_match_score: readinessScoreVal / 100.0,
        experience_match_score: 0.80,
        education_match_score: 0.80,
        matched_skills: gapResult.matched_skills,
        missing_skills: gapResult.missing_skills,
        confidence_score: gapResult.confidence || 0.85,
        user_id: userId,
        match_score: matchScore,
        calculated_at: new Date().toISOString()
      };
      console.log('[Pipeline] Saving candidate_matches with payload:', JSON.stringify(candidateMatchesPayload, null, 2));
      const { data: matchRecord, error: saveErr } = await supabaseAdmin
        .from('candidate_matches').upsert(candidateMatchesPayload, { onConflict: 'job_posting_id,job_seeker_profile_id' }).select('id').single();

      if (saveErr) throw saveErr;
      matchRecordId = matchRecord.id;
    } catch (err) {
      console.error('[Pipeline] Save candidate_matches failed:', err.stack || err.message);
      console.error('[Pipeline] Save candidate_matches error details:', err.details || '', err.hint || '');
      errors.push({ step: 'db_save_candidate_matches', message: err.message });
    }

    // 5. Save to readiness_scores
    try {
      console.log('[Pipeline] Saving readiness_scores...');
      const { error: readErr } = await supabaseAdmin
        .from('readiness_scores').insert({
          job_seeker_profile_id: profile.id,
          job_posting_id: job_id,
          overall_score: readinessScoreVal,
          skill_score: readinessScoreVal,
          experience_score: 80,
          education_score: 80,
          score_breakdown: {},
          user_id: userId,
          calculated_at: new Date().toISOString()
        });
      if (readErr) throw readErr;
    } catch (err) {
      console.error('[Pipeline] Save readiness_scores failed:', err.message);
      errors.push({ step: 'db_save_readiness_scores', message: err.message });
    }

    // 6. Save to skill_gaps
    const missingSkillIds = [];
    const missingSkillNames = gapResult.missing_skills.map(s => getSkillName(s));
    
    for (const skillName of missingSkillNames) {
      if (!skillName) continue;
      try {
        let skillId = null;
        // Find or create skill
        const { data: existingSkill, error: findErr } = await supabaseAdmin
          .from('skills').select('id').ilike('name', skillName).limit(1);

        if (existingSkill && existingSkill.length > 0) {
          skillId = existingSkill[0].id;
        } else {
          const { data: newSkill, error: insErr } = await supabaseAdmin
            .from('skills').insert({ name: skillName, category: 'other' }).select('id').single();
          if (insErr) {
            console.error(`[Pipeline] Failed to insert skill ${skillName}:`, insErr.message);
          }
          if (newSkill) skillId = newSkill.id;
        }

        if (skillId) {
          // Save to skill_gaps
          const { data: gapRecord, error: gapErr } = await supabaseAdmin
            .from('skill_gaps').insert({
              job_seeker_profile_id: profile.id,
              skill_id: skillId,
              job_posting_id: job_id,
              gap_level: 'critical',
              user_id: userId,
              calculated_at: new Date().toISOString()
            }).select('id').single();

          if (gapErr) {
            console.error(`[Pipeline] Failed to insert skill_gap for skillId ${skillId}:`, gapErr.message);
          }

          if (!gapErr && gapRecord) {
            missingSkillIds.push({ skillId, skillGapId: gapRecord.id, skillName });
          }
        }
      } catch (err) {
        console.error(`[Pipeline] Failed to save skill gap for ${skillName}:`, err.message);
      }
    }

    // 7. Call course_recommendation_service
    try {
      console.log('[Pipeline] Calling course_recommendation_service...');
      const coursePayload = {
        user_id: userId,
        user_profile: {
          skills: candidateSkills,
          experience_years: parseInt(profile.years_of_experience) || 0,
          education: 'Bachelor',
          location: profile.location || ''
        },
        job_title: job.title,
        top_n: 5,
        skill_gap: {
          matched_skills: gapResult.matched_skills || [],
          missing_skills: gapResult.missing_skills || [],
          required_skills: gapResult.required_skills || [],
          readiness_score: readinessScoreVal
        }
      };
      
      const { data: courseRes } = await axios.post(`${SERVICES.courseRec}/run`, coursePayload, { timeout: 30000 });
      if (courseRes.success && courseRes.data?.recommendations) {
        courseRecommendations = courseRes.data.recommendations;

        // Save recommendations to database
        for (const rec of courseRecommendations) {
          // Map to correct skill gap
          let matchingGap = missingSkillIds.find(m => {
            const skillLower = String(m.skillName).toLowerCase();
            return String(rec.title).toLowerCase().includes(skillLower) || 
                   String(rec.description || '').toLowerCase().includes(skillLower);
          });
          
          if (!matchingGap && missingSkillIds.length > 0) {
            matchingGap = missingSkillIds[0];
          }

          if (!matchingGap) {
            console.log('[Pipeline] Skipping course recommendation because no missing skills/gaps are available:', rec.title);
            continue;
          }
          
          const { error: courseInsErr } = await supabaseAdmin.from('course_recommendations').insert({
            skill_gap_id: matchingGap.skillGapId,
            skill_id: matchingGap.skillId,
            course_id: rec.course_id || String(rec.title).toLowerCase().replace(/\s+/g, '-'),
            course_title: rec.title || rec.course_title || 'General Course',
            course_provider: rec.provider || rec.platform || rec.course_provider || 'Coursera',
            course_url: rec.url || rec.course_url || 'https://coursera.org',
            course_level: getNormalizedCourseLevel(rec.level || rec.course_level),
            course_duration: parseInt(rec.duration) || 40,
            course_rating: rec.rating || rec.course_rating || 4.5,
            course_price: rec.price || rec.course_price || 0,
            price_currency: rec.currency || rec.price_currency || 'USD',
            user_id: userId,
            recommended_at: new Date().toISOString()
          });

          if (courseInsErr) {
            console.error(`[Pipeline] Failed to insert course recommendation for ${rec.title}:`, courseInsErr.message);
          }
        }
      }
    } catch (err) {
      console.error('[Pipeline] course_recommendation_service error:', err.message);
      errors.push({ step: 'course_recommendation_service', message: err.message });
    }

    // 8. Call job_recommendation_service
    try {
      console.log('[Pipeline] Calling job_recommendation_service...');
      const jobPayload = {
        user_id: userId,
        user_profile: {
          skills: candidateSkills,
          experience_years: parseInt(profile.years_of_experience) || 0,
          education: 'Bachelor',
          location: profile.location || ''
        },
        job_title: job.title,
        top_n: 5,
        skill_gap: {
          matched_skills: gapResult.matched_skills || [],
          missing_skills: gapResult.missing_skills || [],
          required_skills: gapResult.required_skills || [],
          readiness_score: readinessScoreVal
        }
      };

      const { data: jobRes } = await axios.post(`${SERVICES.jobRec}/run`, jobPayload, { timeout: 30000 });
      if (jobRes.success && jobRes.data?.recommendations) {
        jobRecommendations = jobRes.data.recommendations;
      } else {
        throw new Error(jobRes.error?.message || 'Job recommendation service returned no recommendations');
      }

      const persistence = await persistAndConfirmJobRecommendations({
        userId,
        resumeId: resume_id,
        jobPostingId: job_id,
        recommendations: jobRecommendations
      });
      console.log(`[Pipeline] Persisted job recommendations in session ${persistence.sessionId}`);
    } catch (err) {
      console.error('[Pipeline] job_recommendation_service error:', err.message);
      return res.status(err.statusCode || 502).json({
        success: false,
        error: {
          code: err.code || 'JOB_RECOMMENDATION_PERSISTENCE_FAILED',
          message: err.message
        },
        errors: [...errors, { step: 'job_recommendation_service', message: err.message }]
      });
    }

    // 9 & 10. Call m5_roadmap_service and explain endpoints
    try {
      console.log('[Pipeline] Calling m5_roadmap_service (roadmap)...');
      const roadmapPayload = {
        user_id: userId,
        missing_skills: missingSkillNames,
        hours_per_week: 10,
        deadline_weeks: 8,
        job_title: job.title
      };

      const { data: roadmapRes } = await axios.post(`${SERVICES.roadmap}/run/roadmap`, roadmapPayload, { timeout: 45000 });
      if (roadmapRes.success && roadmapRes.data) {
        roadmapResult = roadmapRes.data;

        // Call explain endpoint for each item in the generated roadmap to enrich it
        if (Array.isArray(roadmapResult.roadmap)) {
          console.log('[Pipeline] Enrichment - Calling m5_roadmap_service (explain) for roadmap steps...');
          for (const item of roadmapResult.roadmap) {
            try {
              const explainPayload = {
                user_id: userId,
                skill: getSkillName(item),
                course_title: item.course_title || item.title || 'Recommended Course',
                match_score: 0.85,
                market_freq: 1.0
              };
              const { data: explainRes } = await axios.post(`${SERVICES.roadmap}/run/explain`, explainPayload, { timeout: 15000 });
              if (explainRes.success) {
                item.explanation = explainRes.data.why_skill;
                item.course_fit = explainRes.data.why_course;
              }
            } catch (explainErr) {
              console.error(`[Pipeline] Explain failed for skill ${item.skill || item.title}:`, explainErr.message);
            }
          }
        }

        // 11. Save augmented roadmap to database
        console.log('[Pipeline] Saving roadmap to database...');
        await supabaseAdmin.from('roadmaps').insert({
          user_id: userId,
          resume_id: resume_id,
          job_id: job_id,
          roadmap_data: roadmapResult,
          explanation: 'Timeline career roadmap generated successfully.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[Pipeline] m5_roadmap_service error:', err.message, err.response?.data ? JSON.stringify(err.response.data) : '');
      errors.push({ step: 'm5_roadmap_service', message: err.message, response: err.response?.data });
    }

    // 12. Create notification row
    try {
      console.log('[Pipeline] Creating notification...');
      const { error: notifErr } = await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        type: 'new_match',
        title: 'Career Roadmap Ready',
        body: `Your career roadmap for ${job.title} is ready!`,
        is_read: false,
        created_at: new Date().toISOString()
      });
      if (notifErr) throw notifErr;
    } catch (err) {
      console.error('[Pipeline] Notification creation failed:', err.message);
    }

    // 13. Return combined JSON response
    res.status(200).json({
      match_id: matchRecordId,
      match_score: matchScore,
      readiness_score: readinessScoreVal,
      matched_skills: gapResult.matched_skills,
      missing_skills: gapResult.missing_skills,
      recommended_courses: courseRecommendations,
      recommended_jobs: jobRecommendations,
      roadmap: roadmapResult,
      errors: errors
    });

  } catch (err) {
    console.error('[Pipeline] Core pipeline crashed:', err.message);
    res.status(500).json({ error: 'Matching pipeline crashed', details: err.message, errors });
  }
};

const getMatchResults = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('candidate_matches')
    .select('id, resume_id, match_score, overall_score, skill_match_score, matched_skills, missing_skills, created_at, job_postings(id, title, company, location)')
    .eq('user_id', req.user.id)
    .order('match_score', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

module.exports = { runMatching, getMatchResults };
