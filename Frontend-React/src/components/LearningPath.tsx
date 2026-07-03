import { BookOpen, Target, CheckCircle, Clock, TrendingUp, Star, ArrowRight, AlertCircle, PlayCircle, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { resumeAPI } from '../api/resume.api';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../api/courses.api';
import { progressAPI } from '../api/progress.api';

interface LearningPathProps {
  onNavigate: (page: string) => void;
}

export function LearningPath({ onNavigate }: LearningPathProps) {
  const { token } = useAuth();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'no-resumes' | 'no-analyzed' | 'no-roadmap' | 'generic'>('generic');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explainingCourseId, setExplainingCourseId] = useState<string | null>(null);

  const fetchLearningPath = async () => {
    setIsLoading(true);
    setError(null);
    setErrorType('generic');
    try {
      if (!token) {
        setError('Session expired, please log in again');
        onNavigate('login');
        return;
      }

      // 1. Fetch user's resumes to find latest analyzed one
      const resumeList = await resumeAPI.getAnalysisHistory(null, token);
      const resumes = Array.isArray(resumeList) ? resumeList : (resumeList?.resumes || []);

      if (resumes.length === 0) {
        setErrorType('no-resumes');
        throw new Error('Upload and analyze your resume to generate a learning path.');
      }

      const latestAnalyzed = resumes.find((r: any) => r.status === 'analyzed');
      if (!latestAnalyzed) {
        setErrorType('no-analyzed');
        throw new Error('Your resume is still being analyzed. Check back soon.');
      }

      const resumeId = latestAnalyzed.id;

      // 2. Fetch roadmap — primary source: resume status (always has roadmap), fallback: /api/roadmap/:id
      let roadmapObj: any = {};
      let targetRole = 'Target Role';

      // Try resume status first (roadmap lives in extracted_data)
      const resumeDetail = await resumeAPI.pollResumeStatus(resumeId, token);
      targetRole = resumeDetail.jobTitle || 'Target Role';

      if (resumeDetail.roadmap && resumeDetail.roadmap.roadmap) {
        // Structure: { roadmap: { weeks: [...] }, cards_svg, timeline_svg }
        roadmapObj = resumeDetail.roadmap.roadmap;
      } else {
        // Fallback: try GET /api/roadmap/:resumeId
        try {
          const pathData = await resumeAPI.getRoadmap(resumeId, token);
          const roadmapData = pathData.roadmap_data || pathData;
          targetRole = roadmapData.job_title || targetRole;
          roadmapObj = roadmapData.roadmap || {};
        } catch (roadmapErr: any) {
          if (roadmapErr.status === 404) {
            setErrorType('no-roadmap');
            throw new Error('No roadmap generated yet. Run Analyze Resume to create your learning path.');
          }
          throw roadmapErr;
        }
      }

      // Extract weeks array
      const rawWeeks = roadmapObj.weeks || (Array.isArray(roadmapObj) ? roadmapObj : []);

      // 4. Map weeks to UI phases
      const mappedPhases = rawWeeks.map((week: any, index: number) => {
        const weekNum = week.week_num || week.week || week.week_number || (index + 1);
        const theme = week.theme || week.focus || '';
        // skills can be a space-separated string, comma-separated string, or array
        let skills: string[] = [];
        if (Array.isArray(week.skills)) {
          skills = week.skills;
        } else if (typeof week.skills === 'string') {
          skills = week.skills.includes(',')
            ? week.skills.split(',').map((s: string) => s.trim())
            : week.skills.split(/\s+/).filter((s: string) => s.length > 0);
        }
        // Extract courses from week if available
        const courses = (week.courses || week.resources || []).map((c: any) => ({
          title: c.course_title || c.title || 'Recommended Course',
          platform: c.platform || c.provider || 'Online',
          duration: c.hours ? `${c.hours}h` : (c.duration || 'Self-paced'),
          progress: 0,
          status: 'Not Started',
        }));
        // Fallback if no courses in data
        if (courses.length === 0) {
          courses.push({
            title: `${theme || 'Skills'} Course`,
            platform: 'Online',
            duration: week.total_hours ? `${week.total_hours}h` : '1 week',
            progress: 0,
            status: 'Not Started',
          });
        }

        return {
          title: `Week ${weekNum}: ${theme}`,
          duration: week.total_hours ? `${week.total_hours} hours` : '1 week',
          difficulty: week.difficulty || 'Intermediate',
          courses,
          skills,
          readinessGain: week.readiness_gain || '+5%',
          explanation: week.explanation || (week.milestones ? `Milestones: ${Array.isArray(week.milestones) ? week.milestones.join(', ') : week.milestones}` : ''),
        };
      });

      if (mappedPhases.length === 0) {
        setErrorType('no-roadmap');
        throw new Error('Roadmap data is empty. Try running a new resume analysis.');
      }

      setLearningPath({
        title: `${targetRole} Career Path`,
        targetRole,
        duration: `${mappedPhases.length} weeks`,
        readinessBoost: `+${mappedPhases.length * 5}%`,
        phases: mappedPhases,
      });

      // Fetch user's recommendations and progress
      try {
        const recs = await coursesAPI.getAllCourses({}, token);
        const prog = await progressAPI.getProgress(token);
        setRecommendations(recs || []);
        setProgressRecords(prog || []);
      } catch (err) {
        console.error('Failed to load courses/progress data:', err);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate learning path');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLearningPath();
  }, [token]);

  const getLiveStatus = (course: any) => {
    // 1. Try to find matched recommendation by course_id or course_title
    const rec = recommendations.find(r => 
      (r.course_id && course.id && r.course_id === course.id) ||
      (r.course_title && course.title && r.course_title.toLowerCase() === course.title.toLowerCase())
    );

    if (rec) {
      // Find progress record
      const prog = progressRecords.find(p => p.course_recommendation_id === rec.id);
      if (prog) {
        return {
          recommendationId: rec.id,
          status: prog.status === 'completed' ? 'Completed' : 'In Progress',
          progress: prog.completion_percentage || 0,
          isEnrolled: true
        };
      }
      return {
        recommendationId: rec.id,
        status: 'Not Enrolled',
        progress: 0,
        isEnrolled: false
      };
    }

    // Check defaults
    const defaultIds = ['c1', 'c2', 'c3', 'c4', 'c5'];
    const matchedDefault = recommendations.find(r => 
      defaultIds.includes(r.id) && 
      (r.course_id === course.id || r.course_title?.toLowerCase() === course.title?.toLowerCase())
    );

    if (matchedDefault) {
      const prog = progressRecords.find(p => p.course_recommendation_id === matchedDefault.id);
      if (prog) {
        return {
          recommendationId: matchedDefault.id,
          status: prog.status === 'completed' ? 'Completed' : 'In Progress',
          progress: prog.completion_percentage || 0,
          isEnrolled: true
        };
      }
      return {
        recommendationId: matchedDefault.id,
        status: 'Not Enrolled',
        progress: 0,
        isEnrolled: false
      };
    }

    return {
      recommendationId: null,
      status: 'Not Enrolled',
      progress: 0,
      isEnrolled: false
    };
  };

  const handleToggleComplete = async (course: any, currentStatus: string, recId: string | null) => {
    if (!token) {
      alert('Session expired, please log in again');
      onNavigate('login');
      return;
    }
    
    let targetRecId = recId;
    const courseId = course.id || course.course_id || '';
    setIsUpdatingProgress(courseId || course.title);

    try {
      // If we don't have a recommendation UUID (e.g. it is not persisted yet),
      // we can try to enroll or insert progress first.
      if (!targetRecId) {
        if (!courseId) {
          throw new Error('Course ID is missing from roadmap data');
        }
        const enrollResult = await coursesAPI.enrollCourse(courseId, token);
        targetRecId = enrollResult.enrollment?.course_recommendation_id || enrollResult.enrollment?.id;
      }

      if (!targetRecId) {
        throw new Error('Could not resolve course recommendation ID');
      }

      const nextStatus = currentStatus === 'Completed' ? 'in_progress' : 'completed';
      const nextProgress = nextStatus === 'completed' ? 100 : 0;

      await progressAPI.updateProgress(targetRecId, nextStatus, nextProgress, token);
      
      // Refresh progress data
      const prog = await progressAPI.getProgress(token);
      setProgressRecords(prog || []);
      
      // Also refresh courses recommendation list (status changes)
      const recs = await coursesAPI.getAllCourses({}, token);
      setRecommendations(recs || []);
    } catch (err: any) {
      console.error('Error updating progress:', err);
      alert(err.message || 'Failed to update progress');
    } finally {
      setIsUpdatingProgress(null);
    }
  };

  const handleExplainCourse = async (course: any, recId: string | null) => {
    if (!token) {
      alert('Session expired, please log in again');
      onNavigate('login');
      return;
    }

    const courseId = course.id || course.course_id || '';
    const key = courseId || course.title;

    // Toggle off if already showing
    if (explanations[key]) {
      setExplanations(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    let targetRecId = recId;
    setExplainingCourseId(key);

    try {
      // If we don't have a recommendation UUID (e.g. it is not persisted yet),
      // we can try to enroll or find recommendation first.
      if (!targetRecId) {
        if (!courseId) {
          throw new Error('Course ID is missing from roadmap data');
        }
        // Check if there's any existing recommendation in recommendations list
        const existingRec = recommendations.find(r => 
          r.course_id === courseId || 
          r.course_title?.toLowerCase() === course.title?.toLowerCase()
        );
        if (existingRec) {
          targetRecId = existingRec.id;
        } else {
          // Enroll to persist it
          const enrollResult = await coursesAPI.enrollCourse(courseId, token);
          targetRecId = enrollResult.enrollment?.course_recommendation_id || enrollResult.enrollment?.id;
          
          // Refresh list
          const recs = await coursesAPI.getAllCourses({}, token);
          setRecommendations(recs || []);
        }
      }

      if (!targetRecId) {
        throw new Error('Could not resolve course recommendation ID');
      }

      const response = await coursesAPI.explainCourse(targetRecId, {
        skill: course.skill || 'General',
        courseTitle: course.title,
        matchScore: 0.85,
        marketFreq: 0.75
      }, token);

      if (response.success && response.data) {
        // M5 response shape:
        // { why_skill: "...", why_course: "...", fallback_used: false }
        const explanationText = response.data.why_course || 'No explanation available';
        setExplanations(prev => ({
          ...prev,
          [key]: explanationText
        }));
      } else {
        throw new Error(response.error || 'Failed to generate explanation');
      }
    } catch (err: any) {
      console.error('Error explaining course:', err);
      alert(err.message || 'Failed to explain course');
    } finally {
      setExplainingCourseId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your career roadmap...</p>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50 flex flex-col items-center justify-center">
        <div className={`bg-white p-8 rounded-2xl shadow-lg border-2 max-w-md w-full text-center ${
          errorType === 'no-analyzed' ? 'border-yellow-200' : errorType === 'no-resumes' ? 'border-blue-200' : 'border-red-100'
        }`}>
          {errorType === 'no-resumes' ? (
            <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          ) : errorType === 'no-analyzed' ? (
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          ) : (
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          )}
          <h3 className={`mb-2 font-bold ${
            errorType === 'no-analyzed' ? 'text-yellow-700' : errorType === 'no-resumes' ? 'text-blue-700' : 'text-red-700'
          }`}>
            {errorType === 'no-resumes' ? 'No Resume Found' :
             errorType === 'no-analyzed' ? 'Analysis In Progress' :
             errorType === 'no-roadmap' ? 'No Roadmap Available' :
             'Roadmap Loading Failed'}
          </h3>
          <p className="text-gray-600 mb-6">{error || "Could not retrieve learning path."}</p>
          <button
            onClick={() => onNavigate('analysis')}
            className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            {errorType === 'no-resumes' ? 'Upload Resume' : errorType === 'no-analyzed' ? 'Check Analysis Status' : 'Go to Resume Upload'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('analysis')}
            className="text-green-700 hover:text-green-600 mb-4 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Analysis
          </button>
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            {learningPath.title}
          </h2>
          <p className="text-gray-600">Your personalized learning roadmap to achieve your career goals</p>
        </div>

        {/* Path Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 mb-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <Target className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl text-gray-900">{learningPath.targetRole}</div>
              <p className="text-sm text-gray-600">Target Role</p>
            </div>
            <div>
              <Clock className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl text-gray-900">{learningPath.duration}</div>
              <p className="text-sm text-gray-600">Est. Duration</p>
            </div>
            <div>
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl text-green-700">{learningPath.readinessBoost}</div>
              <p className="text-sm text-gray-600">Readiness Boost</p>
            </div>
            <div>
              <BookOpen className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl text-gray-900">{learningPath.phases.length}</div>
              <p className="text-sm text-gray-600">Learning Phases</p>
            </div>
          </div>
        </div>

        {/* Learning Phases */}
        <div className="space-y-6">
          {learningPath.phases.map((phase: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border-2 border-green-100 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-green-50 transition-colors"
                onClick={() => setExpandedPhase(expandedPhase === index ? null : index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-600 rounded-lg flex items-center justify-center text-white">
                        {index + 1}
                      </div>
                      <h3 className="text-gray-900 text-xl">{phase.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 ml-13">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {phase.duration}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(phase.difficulty)}`}>
                        {phase.difficulty}
                      </span>
                      <span className="text-sm text-green-700">{phase.readinessGain} Readiness</span>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedPhase === index ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>

              {expandedPhase === index && (
                <div className="border-t border-gray-200 p-6 bg-gradient-to-br from-green-50 to-lime-50">
                  {/* Explanation */}
                  {phase.explanation && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-green-200 text-sm text-gray-700">
                      <strong>AI Insight: </strong> {phase.explanation}
                    </div>
                  )}

                  {/* Skills to Learn */}
                  {phase.skills.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Skills You'll Learn
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-green-200 text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Courses */}
                  <div>
                    <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      Courses in This Phase
                    </h4>
                    <div className="space-y-3">
                      {phase.courses.map((course: any, idx: number) => {
                        const live = getLiveStatus(course);
                        const isToggling = isUpdatingProgress === (course.id || course.course_id || course.title);

                        return (
                          <div key={idx} className="p-4 bg-white rounded-lg border border-green-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="text-gray-900 mb-1">{course.title}</h5>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>{course.platform}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {course.duration}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`text-xs px-2 py-1 rounded border ${
                                  live.status === 'Completed'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : live.status === 'In Progress'
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                  {live.status}
                                </span>
                                {live.status === 'In Progress' && (
                                  <span className="text-xs text-blue-600">{live.progress}% Complete</span>
                                )}
                              </div>
                            </div>

                            {live.status === 'In Progress' && (
                              <div className="mb-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 transition-all duration-300"
                                  style={{ width: `${live.progress}%` }}
                                ></div>
                              </div>
                            )}

                            {/* AI Explanation Box */}
                            {explanations[course.id || course.course_id || course.title] && (
                              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                <strong>AI Explain: </strong> {explanations[course.id || course.course_id || course.title]}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleComplete(course, live.status, live.recommendationId)}
                                disabled={isToggling}
                                className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow transition-all text-sm flex items-center justify-center gap-2 ${
                                  live.status === 'Completed'
                                    ? 'bg-amber-600 hover:bg-amber-700'
                                    : 'bg-green-700 hover:bg-green-800'
                                }`}
                              >
                                {isToggling ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : live.status === 'Completed' ? (
                                  'Mark Incomplete'
                                ) : (
                                  'Mark Completed'
                                )}
                              </button>

                              <button
                                onClick={() => handleExplainCourse(course, live.recommendationId)}
                                disabled={explainingCourseId === (course.id || course.course_id || course.title)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg hover:shadow transition-all text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                <Sparkles className="w-4 h-4" />
                                {explainingCourseId === (course.id || course.course_id || course.title) ? 'Explaining...' : 'Ask AI Why'}
                              </button>

                              <button
                                onClick={() => onNavigate('courses')}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <Star className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-2xl mb-4 text-white">Ready to Start Your Journey?</h3>
            <p className="text-white/90 mb-6">
              Begin with Phase 1 and progress through the structured curriculum designed specifically for your career goals.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => onNavigate('courses')}
                className="px-8 py-3 bg-white text-green-700 rounded-lg hover:shadow-xl transition-all"
              >
                Start Phase 1
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
