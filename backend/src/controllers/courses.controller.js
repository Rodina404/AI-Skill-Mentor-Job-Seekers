const { supabaseAdmin } = require('../config/supabase');

const DEFAULT_COURSES = [
  {
    id: 'c1',
    course_id: 'ML-001',
    course_title: 'Advanced Machine Learning Specialization',
    course_provider: 'Coursera',
    course_url: 'https://coursera.org/specializations/advanced-machine-learning',
    course_level: 'Advanced',
    course_duration: 160, // 4 months * 40h
    course_rating: 4.8,
    course_price: 49,
    price_currency: 'USD',
    proficiency_gain_expected: 'Advanced',
    description: 'Master advanced ML algorithms, deep learning, and neural networks.',
  },
  {
    id: 'c2',
    course_id: 'AWS-001',
    course_title: 'AWS Solutions Architect Certification',
    course_provider: 'AWS Training',
    course_url: 'https://aws.amazon.com/training/',
    course_level: 'Intermediate',
    course_duration: 60,
    course_rating: 4.9,
    course_price: 150,
    price_currency: 'USD',
    proficiency_gain_expected: 'Intermediate',
    description: 'Learn to design and deploy scalable systems on AWS.',
  },
  {
    id: 'c3',
    course_id: 'SD-001',
    course_title: 'System Design Interview Masterclass',
    course_provider: 'Udemy',
    course_url: 'https://udemy.com/course/system-design/',
    course_level: 'Advanced',
    course_duration: 80,
    course_rating: 4.7,
    course_price: 19,
    price_currency: 'USD',
    proficiency_gain_expected: 'Advanced',
    description: 'Prepare for system design interviews at top tech companies.',
  },
  {
    id: 'c4',
    course_id: 'K8S-001',
    course_title: 'Kubernetes for Developers',
    course_provider: 'Linux Foundation',
    course_url: 'https://training.linuxfoundation.org/',
    course_level: 'Intermediate',
    course_duration: 50,
    course_rating: 4.6,
    course_price: 299,
    price_currency: 'USD',
    proficiency_gain_expected: 'Intermediate',
    description: 'Deploy and manage containerized applications with Kubernetes.',
  },
  {
    id: 'c5',
    course_id: 'FS-001',
    course_title: 'Full Stack Web Development Bootcamp',
    course_provider: 'Udemy',
    course_url: 'https://udemy.com/course/full-stack/',
    course_level: 'Beginner',
    course_duration: 120,
    course_rating: 4.8,
    course_price: 15,
    price_currency: 'USD',
    proficiency_gain_expected: 'Beginner',
    description: 'Build modern web applications from scratch using React and Node.js.',
  }
];

const getProfileId = async (userId) => {
  const { data: profile, error } = await supabaseAdmin
    .from('job_seeker_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    // Auto-create profile if missing
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('job_seeker_profiles')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (createError) throw new Error(`Could not locate or create job seeker profile: ${createError.message}`);
    return newProfile.id;
  }
  return profile.id;
};

const getAllCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = await getProfileId(userId);

    // 1. Fetch user's skill gaps
    const { data: gaps, error: gapsErr } = await supabaseAdmin
      .from('skill_gaps')
      .select('id')
      .eq('job_seeker_profile_id', profileId);

    if (gapsErr) throw gapsErr;

    let courses = [];
    if (gaps && gaps.length > 0) {
      // 2. Fetch recommendations for these gaps
      const gapIds = gaps.map(g => g.id);
      const { data: recs, error: recsErr } = await supabaseAdmin
        .from('course_recommendations')
        .select('*')
        .in('skill_gap_id', gapIds);

      if (!recsErr && recs) {
        courses = recs;
      }
    }

    // 3. Fallback to default list if no personalized ones exist
    if (courses.length === 0) {
      courses = DEFAULT_COURSES;
    }

    // 4. Fetch user's enrollment progress to overlay status
    const { data: progressList, error: progressErr } = await supabaseAdmin
      .from('learning_progress')
      .select('*')
      .eq('job_seeker_profile_id', profileId);

    if (!progressErr && progressList) {
      courses = courses.map(course => {
        const progressRecord = progressList.find(p => p.course_recommendation_id === course.id);
        return {
          ...course,
          status: progressRecord ? (progressRecord.status === 'completed' ? 'Completed' : 'In Progress') : 'Not Enrolled',
          progress: progressRecord ? progressRecord.completion_percentage : 0
        };
      });
    } else {
      courses = courses.map(course => ({ ...course, status: 'Not Enrolled', progress: 0 }));
    }

    res.json(courses);
  } catch (err) {
    console.error('getAllCourses error:', err.message);
    res.status(500).json({ error: 'Failed to fetch courses', details: err.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check in default list first
    const defaultCourse = DEFAULT_COURSES.find(c => c.id === courseId);
    if (defaultCourse) return res.json(defaultCourse);

    const { data: course, error } = await supabaseAdmin
      .from('course_recommendations')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error || !course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const profileId = await getProfileId(userId);

    // Verify course recommendation exists (or use c1-c5 defaults)
    let targetCourseId = courseId;
    if (courseId.startsWith('c')) {
      // Create a persistent recommendation in Supabase if enrolling in default
      const defaultCourse = DEFAULT_COURSES.find(c => c.id === courseId);
      if (defaultCourse) {
        // Find or create a generic skill gap to associate with
        let gapId = null;
        const { data: testGap } = await supabaseAdmin.from('skill_gaps').select('id').limit(1);
        if (testGap && testGap.length > 0) gapId = testGap[0].id;

        const { data: savedRec, error: saveErr } = await supabaseAdmin
          .from('course_recommendations')
          .insert({
            course_id: defaultCourse.course_id,
            course_title: defaultCourse.course_title,
            course_provider: defaultCourse.course_provider,
            course_url: defaultCourse.course_url,
            course_level: defaultCourse.course_level,
            course_duration: defaultCourse.course_duration,
            course_rating: defaultCourse.course_rating,
            course_price: defaultCourse.course_price,
            skill_gap_id: gapId,
            user_id: userId
          })
          .select('id')
          .single();

        if (!saveErr && savedRec) {
          targetCourseId = savedRec.id;
        }
      }
    }

    // Insert learning progress record (check if already enrolled first)
    const { data: existingProgress } = await supabaseAdmin
      .from('learning_progress')
      .select('*')
      .eq('job_seeker_profile_id', profileId)
      .eq('course_recommendation_id', targetCourseId)
      .maybeSingle();

    if (existingProgress) {
      return res.status(200).json({ message: 'Already enrolled', enrollment: existingProgress });
    }

    const { data: enrollment, error } = await supabaseAdmin
      .from('learning_progress')
      .insert({
        job_seeker_profile_id: profileId,
        course_recommendation_id: targetCourseId,
        status: 'in_progress',
        completion_percentage: 0,
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (err) {
    console.error('enrollInCourse error:', err.message);
    res.status(500).json({ error: 'Enrollment failed', details: err.message });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = await getProfileId(userId);

    const { data, error } = await supabaseAdmin
      .from('learning_progress')
      .select('*, course_recommendations(*)')
      .eq('job_seeker_profile_id', profileId);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { progress } = req.body;
    const profileId = await getProfileId(userId);

    const isCompleted = progress >= 100;
    
    const { data, error } = await supabaseAdmin
      .from('learning_progress')
      .update({
        completion_percentage: progress,
        status: isCompleted ? 'completed' : 'in_progress',
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('job_seeker_profile_id', profileId)
      .eq('course_recommendation_id', courseId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Progress updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addCourse = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('course_recommendations')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Explain recommended course why it is recommended using AI (M5)
 * POST /courses/:courseId/explain
 */
const explainCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { skill, courseTitle, matchScore, marketFreq } = req.body;

    if (!courseTitle) {
      return res.status(400).json({ error: 'courseTitle is required' });
    }

    // 1. Fetch user's latest roadmap from Supabase
    const { data: roadmap, error: roadmapErr } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (roadmapErr || !roadmap) {
      return res.status(404).json({ error: 'Roadmap not found for user. Please generate a learning path first.' });
    }

    // 2. Call M5 Roadmap Service explain endpoint
    const m5Url = process.env.M5_ROADMAP_URL || 'http://localhost:8005';
    const axios = require('axios');
    const response = await axios.post(`${m5Url}/run/explain`, {
      user_id: userId,
      skill: skill || 'General',
      course_title: courseTitle,
      match_score: Number(matchScore || 0.85),
      market_freq: Number(marketFreq || 0.75),
      roadmap_data: roadmap.roadmap_data || roadmap
    });

    res.json(response.data);
  } catch (err) {
    console.error('explainCourse error:', err.message);
    res.status(500).json({ error: 'Failed to generate course explanation', details: err.message });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  enrollInCourse,
  getEnrolledCourses,
  updateProgress,
  addCourse,
  explainCourse
};
