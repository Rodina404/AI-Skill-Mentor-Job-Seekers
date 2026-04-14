import { Mail, MapPin, Briefcase, Calendar, Target, Award, TrendingUp, Edit, FileText, Clock, Plus, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface UserProfileProps {
  onNavigate: (page: string) => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 50, category: 'Programming' });
  const [isAddingSkillLoading, setIsAddingSkillLoading] = useState(false);
  const [showSkillSuccess, setShowSkillSuccess] = useState(false);

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goals, setGoals] = useState([
    'Transition to Senior Software Engineer role',
    'Master Machine Learning and AI technologies',
    'Lead a development team within 2 years',
    'Contribute to open-source projects',
  ]);
  const [newGoal, setNewGoal] = useState('');
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [showGoalsSuccess, setShowGoalsSuccess] = useState(false);

  const handleEditProfile = () => {
    onNavigate('edit-profile');
  };

  const handleAddSkill = async () => {
    if (!newSkill.name || newSkill.name.trim().length === 0) {
      alert('Please enter a skill name');
      return;
    }

    setIsAddingSkillLoading(true);

    // Simulate API call
    // In a real app: await addSkill(newSkill);
    setTimeout(() => {
      setIsAddingSkillLoading(false);
      setShowSkillSuccess(true);
      setNewSkill({ name: '', level: 50, category: 'Programming' });
      setIsAddingSkill(false);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSkillSuccess(false), 3000);
    }, 1000);
  };

  const handleUpdateGoals = () => {
    setIsEditingGoals(true);
  };

  const handleSaveGoals = async () => {
    setIsSavingGoals(true);

    // Simulate API call
    // In a real app: await updateGoals(goals);
    setTimeout(() => {
      setIsSavingGoals(false);
      setShowGoalsSuccess(true);
      setIsEditingGoals(false);
      setNewGoal('');

      // Hide success message after 3 seconds
      setTimeout(() => setShowGoalsSuccess(false), 3000);
    }, 1000);
  };

  const handleAddGoal = () => {
    if (newGoal.trim().length > 0) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleViewAnalysis = (title: string) => {
    // In production, this would navigate to analysis page with ID
    onNavigate('analysis');
  };

  const handleViewJobDetails = (title: string, company: string) => {
    // In production, this would navigate with job ID
    onNavigate('job-details');
  };

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

  const skillGaps = [
    { 
      skill: 'System Design',
      priority: 'High',
      currentLevel: 'Beginner',
      targetLevel: 'Advanced',
      impact: 'Critical for senior roles',
      suggestedFocus: 'Complete system design course and practice with real-world scenarios'
    },
    {
      skill: 'Kubernetes',
      priority: 'High',
      currentLevel: 'None',
      targetLevel: 'Intermediate',
      impact: 'Required by 80% of target jobs',
      suggestedFocus: 'Start with container basics, then move to orchestration'
    },
    {
      skill: 'GraphQL',
      priority: 'Medium',
      currentLevel: 'Beginner',
      targetLevel: 'Intermediate',
      impact: 'Valuable for modern APIs',
      suggestedFocus: 'Build a project integrating GraphQL with existing backend'
    },
    {
      skill: 'TypeScript',
      priority: 'Medium',
      currentLevel: 'Intermediate',
      targetLevel: 'Advanced',
      impact: 'Industry standard for large projects',
      suggestedFocus: 'Master advanced types and patterns'
    },
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

  const achievements = [
    { title: 'Resume Analyzed', date: '2025-01-15', icon: Award },
    { title: 'Completed 3 Courses', date: '2025-01-10', icon: TrendingUp },
    { title: 'Profile 85% Complete', date: '2025-01-05', icon: Target },
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
                <button onClick={handleEditProfile} className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-sm">aya.mamdouh10@icloud.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Egypt, Alex</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Joined January 2026</span>
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

              <button
                onClick={() => setIsAddingSkill(true)}
                className="mt-6 w-full px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all"
              >
                Add New Skill
              </button>

              {/* Add Skill Modal */}
              {isAddingSkill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-8 w-96">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-900">Add New Skill</h3>
                      <button onClick={() => setIsAddingSkill(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="Skill Name"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-gray-500" />
                        <input
                          type="number"
                          value={newSkill.level}
                          onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="Proficiency Level"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                        <select
                          value={newSkill.category}
                          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                        >
                          <option value="Programming">Programming</option>
                          <option value="Framework">Framework</option>
                          <option value="Backend">Backend</option>
                          <option value="AI/ML">AI/ML</option>
                          <option value="Database">Database</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-4">
                      <button
                        onClick={() => setIsAddingSkill(false)}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-all mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isAddingSkillLoading}
                      >
                        {isAddingSkillLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            Add Skill
                          </>
                        )}
                      </button>
                    </div>
                    {showSkillSuccess && (
                      <div className="mt-4 text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Skill added successfully!
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                    <button
                      onClick={() => handleViewAnalysis(analysis.title)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                    >
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
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            job.status === 'Under Review'
                              ? 'bg-yellow-100 text-yellow-700'
                              : job.status === 'Applied'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewJobDetails(job.title, job.company)}
                      className="w-full px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm"
                    >
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
                Skill Gaps
              </h3>

              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-gray-900">{gap.skill}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        gap.priority === 'High' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {gap.priority} Priority
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Current:</span>
                        <span className="ml-1 text-orange-700">{gap.currentLevel}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Target:</span>
                        <span className="ml-1 text-green-700">{gap.targetLevel}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Impact:</strong> {gap.impact}
                    </p>
                    <p className="text-xs text-gray-700 p-2 bg-white rounded border border-orange-100">
                      <strong>Suggested Focus:</strong> {gap.suggestedFocus}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                View Course Recommendations
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