import { BookOpen, Target, CheckCircle, Clock, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface LearningPathProps {
  onNavigate: (page: string) => void;
}

export function LearningPath({ onNavigate }: LearningPathProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  const learningPath = {
    title: 'Senior Software Engineer Career Path',
    targetRole: 'Senior Software Engineer',
    duration: '12 weeks',
    readinessBoost: '+27%',
    phases: [
      {
        title: 'Phase 1: System Design Fundamentals',
        duration: '4 weeks',
        difficulty: 'Advanced',
        courses: [
          {
            title: 'System Design Interview Masterclass',
            platform: 'Udemy',
            duration: '8 weeks',
            progress: 0,
            status: 'Not Started',
          },
        ],
        skills: ['Scalability', 'Load Balancing', 'Microservices', 'API Design'],
        readinessGain: '+18%',
      },
      {
        title: 'Phase 2: Advanced Machine Learning',
        duration: '4 weeks',
        difficulty: 'Advanced',
        courses: [
          {
            title: 'Advanced Machine Learning Specialization',
            platform: 'Coursera',
            duration: '4 months',
            progress: 0,
            status: 'Not Started',
          },
        ],
        skills: ['Neural Networks', 'Deep Learning', 'TensorFlow', 'Model Optimization'],
        readinessGain: '+23%',
      },
      {
        title: 'Phase 3: Cloud & DevOps',
        duration: '4 weeks',
        difficulty: 'Intermediate',
        courses: [
          {
            title: 'AWS Solutions Architect Certification',
            platform: 'AWS Training',
            duration: '6 weeks',
            progress: 0,
            status: 'Not Started',
          },
          {
            title: 'Kubernetes for Developers',
            platform: 'Linux Foundation',
            duration: '5 weeks',
            progress: 0,
            status: 'Not Started',
          },
        ],
        skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD'],
        readinessGain: '+35%',
      },
    ],
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
          {learningPath.phases.map((phase, index) => (
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
                  {/* Skills to Learn */}
                  <div className="mb-6">
                    <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Skills You'll Learn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills.map((skill, idx) => (
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
                      {phase.courses.map((course, idx) => (
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
                Save to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
