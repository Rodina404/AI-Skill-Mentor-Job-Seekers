const { supabaseAdmin } = require('../config/supabase');
const axios = require('axios');

const SERVICES = {
  matching:  process.env.CV_MATCHING_URL  || 'http://localhost:8003',
  gapEngine: process.env.GAP_ENGINE_URL   || 'http://localhost:8004',
  roadmap:   process.env.M5_ROADMAP_URL   || 'http://localhost:8005',
  courseRec: process.env.COURSE_REC_URL   || 'http://localhost:8006',
  jobRec:    process.env.JOB_REC_URL      || 'http://localhost:8007',
};

const runMatching = async (req, res) => {
  const { resume_id, job_id } = req.body;
  const userId = req.user.id;
  if (!resume_id || !job_id)
    return res.status(400).json({ error: 'resume_id and job_id are required' });

  try {
    const { data: resume } = await supabaseAdmin
      .from('resumes').select('normalized_skills, extracted_data')
      .eq('id', resume_id).eq('user_id', userId).single();
    if (!resume?.normalized_skills)
      return res.status(400).json({ error: 'Resume not yet analyzed' });

    const { data: job } = await supabaseAdmin
      .from('job_postings').select('*').eq('id', job_id).single();
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const { data: matchResult } = await axios.post(`${SERVICES.matching}/match`, {
      candidate_skills: resume.normalized_skills,
      job_requirements: job.required_skills,
      job_description: job.description
    }, { timeout: 30000 });

    const { data: gapResult } = await axios.post(`${SERVICES.gapEngine}/analyze`, {
      candidate_skills: resume.normalized_skills,
      required_skills: job.required_skills,
      match_score: matchResult.score
    }, { timeout: 30000 });

    const { data: matchRecord } = await supabaseAdmin
      .from('candidate_matches').upsert({
        user_id: userId, resume_id, job_id,
        match_score: matchResult.score,
        matched_skills: gapResult.matched_skills,
        missing_skills: gapResult.missing_skills,
        readiness_score: gapResult.readiness_score,
        created_at: new Date().toISOString()
      }).select().single();

    res.status(200).json({
      match_id: matchRecord.id,
      match_score: matchResult.score,
      readiness_score: gapResult.readiness_score,
      matched_skills: gapResult.matched_skills,
      missing_skills: gapResult.missing_skills
    });
  } catch (err) {
    console.error('runMatching error:', err.message);
    res.status(500).json({ error: 'Matching failed', details: err.message });
  }
};

const getMatchResults = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('candidate_matches')
    .select('id, match_score, readiness_score, matched_skills, missing_skills, created_at, job_postings(id, title, company, location)')
    .eq('user_id', req.user.id)
    .order('match_score', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

module.exports = { runMatching, getMatchResults };
