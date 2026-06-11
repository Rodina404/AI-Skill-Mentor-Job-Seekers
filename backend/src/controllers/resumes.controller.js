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

    _runAnalysisPipeline(resumeRecord.id, file).catch(err => {
      console.error(`Pipeline failed for resume ${resumeRecord.id}:`, err.message);
      supabaseAdmin.from('resumes').update({ status: 'failed' }).eq('id', resumeRecord.id);
    });
  } catch (err) {
    console.error('uploadResume error:', err.message);
    res.status(500).json({ error: 'Resume upload failed', details: err.message });
  }
};

const _runAnalysisPipeline = async (resumeId, file) => {
  const formData = new FormData();
  formData.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });

  const { data: extracted } = await axios.post(
    `${SERVICES.extraction}/extract`, formData,
    { headers: formData.getHeaders(), timeout: 60000 }
  );

  const { data: normalized } = await axios.post(
    `${SERVICES.normalization}/run`,
    { raw_skills: extracted.skills, experience: extracted.experience },
    { timeout: 30000 }
  );

  await supabaseAdmin.from('resumes').update({
    status: 'analyzed',
    extracted_data: extracted,
    normalized_skills: normalized.skills,
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

module.exports = { uploadResume, getResumeStatus, getUserResumes };
