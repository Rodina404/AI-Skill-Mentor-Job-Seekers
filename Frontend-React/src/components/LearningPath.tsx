import { BookOpen, Target, CheckCircle, Clock, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { resumeAPI } from '../api/resume.api';

interface LearningPathProps {
  onNavigate: (page: string) => void;
}

export function LearningPath({ onNavigate }: LearningPathProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLearningPath = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired, please log in again');
        onNavigate('login');
        return;
      }

      let analysisId = localStorage.getItem('latestAnalysisId');
      
      if (!analysisId) {
        // Fallback: fetch matches to get latest resume ID
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/matches`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (response.ok) {
          const matches = await response.json();
          if (matches && matches.length > 0) {
            analysisId = matches[0].resume_id;
            if (analysisId) {
              localStorage.setItem('latestAnalysisId', analysisId);
            }
          }
        }
      }

      if (!analysisId) {
        throw new Error("No resume analysis found. Please upload and analyze your resume first.");
      }

      // Fetch the learning path
      const pathData = await resumeAPI.getRoadmap(analysisId, token);
      
      const actualRoadmapData = pathData.roadmap_data || pathData;
      const targetRole = actualRoadmapData.job_title || 'Target Role';
      const rawRoadmap = actualRoadmapData.roadmap || [];
      
      const mappedPhases = rawRoadmap.map((item: any, index: number) => {
        const title = item.week ? `Week ${item.week}: ${item.skill || item.title || 'Skill Mastery'}` : (item.title || `Phase ${index + 1}`);
        const skills = Array.isArray(item.skills) ? item.skills : (item.skill ? [item.skill] : ['General']);
        return {
          title,
          duration: item.duration || '1 week',
          difficulty: item.difficulty || 'Intermediate',
          courses: [
            {
              title: item.course_title || 'Recommended Course',
              platform: item.platform || 'Coursera',
              duration: item.course_duration || '6 hours',
              progress: 0,
              status: 'Not Started',
            }
          ],
          skills,
          readinessGain: item.readinessGain || '+5%',
          explanation: item.explanation || 'Mastering this skill is critical for your career path.'
        };
      });

      setLearningPath({
        title: `${targetRole} Career Path`,
        targetRole,
        duration: `${rawRoadmap.length} weeks`,
        readinessBoost: '+25%',
        phases: mappedPhases.length > 0 ? mappedPhases : [
          {
            title: 'Phase 1: Foundation',
            duration: '4 weeks',
            difficulty: 'Intermediate',
            courses: [
              {
                title: 'General Fundamentals Course',
                platform: 'Coursera',
                duration: '10 hours',
                progress: 0,
                status: 'Not Started',
              }
            ],
            skills: ['Core Concepts'],
            readinessGain: '+10%',
            explanation: 'Begin your learning journey with foundational concepts.'
          }
        ]
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate learning path');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPath();
  }, []);

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
        <p className="text-gray-600 font-medium">Generating your career roadmap...</p>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-red-100 max-w-md w-full text-center">
          <h3 className="text-red-700 mb-2 font-bold">Roadmap Generation Failed</h3>
          <p className="text-gray-600 mb-6">{error || "Could not retrieve learning path."}</p>
          <button
            onClick={() => onNavigate('analysis')}
            className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            Go to Resume Upload
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

                  {/* Courses */}
                  <div>
                    <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      Courses in This Phase
                    </h4>
                    <div className="space-y-3">
                      {phase.courses.map((course: any, idx: number) => (
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
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
                              {course.status}
                            </span>
                          </div>
                          <button
                            onClick={() => onNavigate('courses')}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                          >
                            View Course Details
                          </button>
                        </div>
                      ))}
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
