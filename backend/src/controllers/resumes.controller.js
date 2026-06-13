const { supabaseAdmin } = require('../config/supabase');
const axios = require('axios');
const FormData = require('form-data');

const SERVICES = {
  extraction:    process.env.M1_EXTRACTION_URL    || 'http://localhost:8001',
  normalization: process.env.SKILL_NORM_URL        || 'http://localhost:8002',
};

const uploadResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    console.log(`[Upload] File received: originalname=${file.originalname}, mimetype=${file.mimetype}, size=${file.buffer ? file.buffer.length : 'undefined'} bytes`);

    const filePath = `${userId}/${Date.now()}_${file.originalname}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(filePath, file.buffer, { contentType: file.mimetype });
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: resumeRecord, error: dbError } = await supabaseAdmin
      .from('resumes')
      .insert({ user_id: userId, file_path: filePath, original_name: file.originalname, status: 'processing' })
      .select().single();
    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

    res.status(202).json({ message: 'Resume uploaded. Processing started.', resume_id: resumeRecord.id });

    _runAnalysisPipeline(resumeRecord.id, file).catch(async (err) => {
      console.error(`Pipeline failed for resume ${resumeRecord.id}:`, err.message);
      const { error } = await supabaseAdmin.from('resumes').update({ status: 'failed' }).eq('id', resumeRecord.id);
      if (error) {
        console.error(`Failed to update resume status to failed for ID ${resumeRecord.id}:`, error.message);
      }
    });
  } catch (err) {
    console.error('uploadResume error:', err.message);
    res.status(500).json({ error: 'Resume upload failed', details: err.message });
  }
};

const _runAnalysisPipeline = async (resumeId, file) => {
  const formData = new FormData();
  formData.append('resumeFile', file.buffer, { filename: file.originalname, contentType: file.mimetype });

  console.log(`[Pipeline] Sending resume ${resumeId} to extraction service...`);
  const { data: extracted } = await axios.post(
    `${SERVICES.extraction}/run`, formData,
    { headers: formData.getHeaders(), timeout: 60000 }
  );

  if (!extracted.success) {
    throw new Error(`Extraction failed: ${JSON.stringify(extracted.error)}`);
  }

  const extractedData = extracted.extractedData || {};
  console.log(`[Pipeline] Extraction complete. Sending to normalization service...`);

  const edu = (extractedData.education && extractedData.education.length > 0)
    ? extractedData.education[0]
    : { degree: "", field: "", university: "", year: 0 };
  
  const educationInput = {
    degree: edu.degree || "",
    field: edu.field || "",
    university: edu.university || "",
    year: edu.year ? parseInt(edu.year) || 0 : 0
  };

  const exp = extractedData.experience || { titles: [], years: 0.0 };
  const experienceInput = {
    titles: exp.titles || [],
    years: parseFloat(exp.years) || 0.0
  };

  const { data: normalized } = await axios.post(
    `${SERVICES.normalization}/run`,
    {
      userId: resumeId,
      skills: extractedData.skills || [],
      education: educationInput,
      experience: experienceInput
    },
    { timeout: 30000 }
  );

  if (!normalized.success) {
    throw new Error(`Normalization failed`);
  }

  console.log(`[Pipeline] Normalization complete. Saving to database...`);

  await supabaseAdmin.from('resumes').update({
    status: 'analyzed',
    extracted_data: extractedData,
    normalized_skills: normalized.data?.skills || [],
    analyzed_at: new Date().toISOString()
  }).eq('id', resumeId);

  console.log(`Resume ${resumeId} analysis complete.`);
};

const getResumeStatus = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('resumes').select('id, status, original_name, analyzed_at, normalized_skills')
    .eq('id', id).eq('user_id', req.user.id).single();
  if (error || !data) return res.status(404).json({ error: 'Resume not found' });
  res.json(data);
};

const getUserResumes = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('resumes').select('id, status, original_name, analyzed_at, created_at')
    .eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

const createLearningPath = async (req, res) => {
  try {
    const { analysisId } = req.body; // resume ID
    const userId = req.user.id;

    const { data: match, error: matchErr } = await supabaseAdmin
      .from('candidate_matches')
      .select('*, job_postings(id, title)')
      .eq('resume_id', analysisId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (matchErr || !match) {
      return res.status(404).json({ error: 'No analysis results found for this resume. Please run matching first.' });
    }

    const missingSkillsList = (match.missing_skills || []).map(s => {
      if (typeof s === 'string') return s;
      return s.skill || s.name || '';
    }).filter(Boolean);

    const roadmapRequest = {
      user_id: userId,
      missing_skills: missingSkillsList,
      hours_per_week: 10,
      deadline_weeks: 8,
      job_title: match.job_postings?.title || 'Target Role'
    };

    const roadmapUrl = process.env.M5_ROADMAP_URL || 'http://localhost:8005';
    const { data: response } = await axios.post(`${roadmapUrl}/run/roadmap`, roadmapRequest, { timeout: 30000 });

    if (!response.success) {
      return res.status(500).json({ error: 'Failed to generate roadmap', details: response.error });
    }

    res.json(response.data);
  } catch (err) {
    console.error('createLearningPath error:', err.message);
    res.status(500).json({ error: 'Learning path generation failed', details: err.message });
  }
};

const getRecommendedCourses = async (req, res) => {
  try {
    const { id: analysisId } = req.params; // resume ID
    const userId = req.user.id;

    const { data: match, error: matchErr } = await supabaseAdmin
      .from('candidate_matches')
      .select('*, job_postings(id, title)')
      .eq('resume_id', analysisId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (matchErr || !match) {
      return res.status(404).json({ error: 'No analysis results found' });
    }

    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('normalized_skills')
      .eq('id', analysisId)
      .single();

    const normalizedSkillsList = (resume?.normalized_skills || []).map(s => {
      if (typeof s === 'string') return s;
      return s.name || s.skill || '';
    }).filter(Boolean);

    const courseRecRequest = {
      user_id: userId,
      user_profile: {
        skills: normalizedSkillsList,
        experience_years: 0,
        education: "",
        location: ""
      },
      job_title: match.job_postings?.title || 'Target Role',
      top_n: 5
    };

    const courseRecUrl = process.env.COURSE_REC_URL || 'http://localhost:8006';
    const { data: response } = await axios.post(`${courseRecUrl}/run`, courseRecRequest, { timeout: 30000 });

    if (!response.success) {
      return res.status(500).json({ error: 'Failed to fetch course recommendations', details: response.error });
    }

    const { data: profile } = await supabaseAdmin
      .from('job_seeker_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    const profileId = profile?.id;
    const recommendations = response.data?.recommendations || [];

    const savedRecommendations = [];
    for (const rec of recommendations) {
      let skillId = null;
      const { data: existingSkill } = await supabaseAdmin
        .from('skills')
        .select('id')
        .ilike('name', rec.skill || 'General')
        .limit(1);

      if (existingSkill && existingSkill.length > 0) {
        skillId = existingSkill[0].id;
      } else {
        const { data: newSkill } = await supabaseAdmin
          .from('skills')
          .insert({ name: rec.skill || 'General' })
          .select('id')
          .single();
        if (newSkill) skillId = newSkill.id;
      }

      let gapId = null;
      if (profileId && skillId) {
        const { data: existingGap } = await supabaseAdmin
          .from('skill_gaps')
          .select('id')
          .eq('job_seeker_profile_id', profileId)
          .eq('skill_id', skillId)
          .limit(1);

        if (existingGap && existingGap.length > 0) {
          gapId = existingGap[0].id;
        } else {
          const { data: newGap } = await supabaseAdmin
            .from('skill_gaps')
            .insert({
              job_seeker_profile_id: profileId,
              skill_id: skillId,
              gap_level: 'high',
              job_posting_id: match.job_id
            })
            .select('id')
            .single();
          if (newGap) gapId = newGap.id;
        }
      }

      if (gapId && skillId) {
        const { data: savedRec, error: saveErr } = await supabaseAdmin
          .from('course_recommendations')
          .insert({
            skill_gap_id: gapId,
            skill_id: skillId,
            course_id: rec.course_id || String(rec.title).toLowerCase().replace(/\s+/g, '-'),
            course_title: rec.title || rec.course_title,
            course_provider: rec.platform || rec.course_provider || 'Coursera',
            course_url: rec.url || rec.course_url || 'https://coursera.org',
            course_level: rec.level || rec.course_level || 'Intermediate',
            course_duration: rec.duration || rec.course_duration || 40,
            course_rating: rec.rating || rec.course_rating || 4.5,
            course_price: rec.price || rec.course_price || 0,
            price_currency: rec.currency || rec.price_currency || 'USD'
          })
          .select()
          .single();

        if (!saveErr && savedRec) {
          savedRecommendations.push(savedRec);
        }
      }
    }

    if (savedRecommendations.length === 0) {
      res.json(recommendations.map((rec, i) => ({
        id: `c${i+1}`,
        course_title: rec.title,
        course_provider: rec.platform,
        course_url: rec.url || 'https://coursera.org',
        course_level: rec.level,
        course_duration: rec.duration,
        course_rating: rec.rating,
        course_price: rec.price || 0,
        price_currency: 'USD',
        status: 'Not Enrolled',
        progress: 0
      })));
    } else {
      res.json(savedRecommendations.map(rec => ({ ...rec, status: 'Not Enrolled', progress: 0 })));
    }
  } catch (err) {
    console.error('getRecommendedCourses error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recommendations', details: err.message });
  }
};

module.exports = {
  uploadResume,
  getResumeStatus,
  getUserResumes,
  createLearningPath,
  getRecommendedCourses
};
