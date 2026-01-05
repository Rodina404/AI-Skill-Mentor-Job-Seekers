import { Mail, MapPin, Briefcase, Calendar, Target, Award, TrendingUp, Edit, FileText, Clock } from 'lucide-react';

interface UserProfileProps {
  onNavigate: (page: string) => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const skills = [
    { name: 'JavaScript', level: 92, category: 'Programming' },
    { name: 'Python', level: 85, category: 'Programming' },
    { name: 'React', level: 88, category: 'Framework' },
    { name: 'Node.js', level: 78, category: 'Backend' },
    { name: 'Machine Learning', level: 65, category: 'AI/ML' },
    { name: 'SQL', level: 82, category: 'Database' },
  ];

  const careerGoals = [
    'Transition to Senior Software Engineer role',
    'Master Machine Learning and AI technologies',
    'Lead a development team within 2 years',
    'Contribute to open-source projects',
  ];

  const achievements = [
    { title: 'Resume Analyzed', date: '2025-01-15', icon: Award },
    { title: 'Completed 3 Courses', date: '2025-01-10', icon: TrendingUp },
    { title: 'Profile 85% Complete', date: '2025-01-05', icon: Target },
  ];

  const analysisHistory = [
    {
      title: 'Software Engineer Position',
      date: '2025-01-15',
      score: 67,
      skillsAnalyzed: 12,
      gapsFound: 4,
    },
    {
      title: 'Data Scientist Role',
      date: '2025-01-12',
      score: 72,
      skillsAnalyzed: 10,
      gapsFound: 3,
    },
    {
      title: 'Full Stack Developer',
      date: '2025-01-10',
      score: 78,
      skillsAnalyzed: 14,
      gapsFound: 2,
    },
  ];

  const jobHistory = [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      appliedDate: '2025-01-14',
      status: 'Under Review',
      matchScore: 92,
    },
    {
      title: 'Product Manager',
      company: 'StartupXYZ',
      appliedDate: '2025-01-11',
      status: 'Saved',
      matchScore: 85,
    },
    {
      title: 'UX Designer',
      company: 'DesignStudio',
      appliedDate: '2025-01-09',
      status: 'Applied',
      matchScore: 82,
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-green-700 to-green-600 rounded-2xl flex items-center justify-center text-white text-4xl">
                JD
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl text-gray-900 mb-2">John Doe</h2>
                  <p className="text-gray-600 mb-4">Full Stack Developer</p>
                </div>
                <button className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-sm">john.doe@example.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Joined January 2025</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onNavigate('analysis')}
                  className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Analyze Resume
                </button>
                <button
                  onClick={() => onNavigate('history')}
                  className="px-6 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all"
                >
                  View Full History
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-green-600" />
                Skills Profile
              </h3>

              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-gray-900">{skill.name}</span>
                        <span className="ml-2 text-sm text-gray-500">({skill.category})</span>
                      </div>
                      <span className="text-sm text-green-700">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-700 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all">
                Add New Skill
              </button>
            </div>

            {/* Analysis History */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                Resume Analysis History
              </h3>

              <div className="space-y-4">
                {analysisHistory.map((analysis, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-lime-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-gray-900 mb-1">{analysis.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{analysis.date}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl text-green-700">{analysis.score}%</div>
                        <p className="text-xs text-gray-500">Readiness</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Skills Analyzed:</span>
                        <span className="ml-1 text-green-700">{analysis.skillsAnalyzed}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Gaps Found:</span>
                        <span className="ml-1 text-orange-700">{analysis.gapsFound}</span>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
                      View Full Analysis
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Application History */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-green-600" />
                Job Application History
              </h3>

              <div className="space-y-4">
                {jobHistory.map((job, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-lime-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-gray-900 mb-1">{job.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{job.company}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Applied {job.appliedDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl text-green-700">{job.matchScore}%</div>
                        <p className="text-xs text-gray-500 mb-2">Match</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          job.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                          job.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm">
                      View Job Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Goals */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                Career Goals
              </h3>

              <div className="space-y-3">
                {careerGoals.map((goal, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-700 to-green-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{goal}</p>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all">
                Update Goals
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Career Readiness */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6">Career Readiness</h3>
              
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.67)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#15803d" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                      67%
                    </div>
                    <p className="text-gray-600 text-sm">Ready</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                View Recommendations
              </button>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6">Recent Activity</h3>
              
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <achievement.icon className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">{achievement.title}</p>
                      <p className="text-gray-500 text-xs">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('history')}
                className="mt-6 w-full px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm"
              >
                View Full History
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-2xl p-6 text-white">
              <h4 className="mb-4 text-white">Your Progress</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Analyses Done</span>
                  <span className="text-2xl text-white">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Jobs Applied</span>
                  <span className="text-2xl text-white">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Courses Saved</span>
                  <span className="text-2xl text-white">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}