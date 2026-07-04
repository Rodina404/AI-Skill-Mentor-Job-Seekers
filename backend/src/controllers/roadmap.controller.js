const { supabaseAdmin } = require('../config/supabase');
const axios = require('axios');

const M5_ROADMAP_URL = process.env.M5_ROADMAP_URL || 'http://localhost:8005';

const getRoadmapByResumeId = async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;
  
  try {
    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('resume_id', resumeId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error || !data) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    res.json(data);
  } catch (err) {
    console.error('getRoadmapByResumeId error:', err.message);
    res.status(500).json({ error: 'Failed to fetch roadmap', details: err.message });
  }
};

/**
 * Explain why a roadmap course is recommended using AI (M5).
 * POST /roadmap/explain
 * Body: { skill, course_title }
 *
 * This endpoint does NOT require enrollment or a course_recommendation_id.
 * It builds the same payload shape that matches.controller.js uses when
 * calling /run/explain (see lines 327-333 there) and forwards it to M5.
 */
const explainRoadmapCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, course_title } = req.body;

    if (!course_title) {
      return res.status(400).json({ error: 'course_title is required' });
    }

    // Same defaults used in matches.controller.js enrichment loop
    // M5 ExplainRequest requires roadmap_data (Dict); pass a minimal stub
    const explainPayload = {
      user_id: userId,
      skill: skill || 'General',
      course_title,
      match_score: 0.85,
      market_freq: 1.0,
      roadmap_data: { phases: [], metadata: { source: 'explain_endpoint' } }
    };

    console.log('[roadmap/explain] Calling M5:', JSON.stringify(explainPayload));
    const { data: explainRes } = await axios.post(
      `${M5_ROADMAP_URL}/run/explain`,
      explainPayload,
      { timeout: 15000 }
    );

    // M5 returns { success, data: { why_skill, why_course, fallback_used } }
    if (explainRes.success && explainRes.data) {
      return res.json({ success: true, data: explainRes.data });
    }

    // If M5 returned a top-level why_skill / why_course (no wrapper)
    if (explainRes.why_skill || explainRes.why_course) {
      return res.json({ success: true, data: explainRes });
    }

    return res.status(502).json({ error: 'Unexpected response from M5 explain service', raw: explainRes });
  } catch (err) {
    console.error('explainRoadmapCourse error:', err.message);
    const detail = err.response?.data || err.message;
    res.status(500).json({ error: 'Failed to generate course explanation', details: detail });
  }
};

module.exports = { getRoadmapByResumeId, explainRoadmapCourse };
