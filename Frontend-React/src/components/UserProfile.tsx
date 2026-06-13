import { Mail, MapPin, Briefcase, Calendar, Target, Award, TrendingUp, Edit, FileText, Clock, Plus, X, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersAPI } from '../api/users.api';

interface UserProfileProps {
  onNavigate: (page: string) => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 50, category: 'Programming' });
  const [isAddingSkillLoading, setIsAddingSkillLoading] = useState(false);
  const [showSkillSuccess, setShowSkillSuccess] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [jobHistory, setJobHistory] = useState<any[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [readinessScore, setReadinessScore] = useState(70);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired, please log in again');
        onNavigate('login');
        return;
      }

      const currentUserStr = localStorage.getItem('currentUser');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const userId = currentUser?.id || 'me';

      // 1. Fetch Profile
      const prof = await usersAPI.getProfile(userId, token);
      setProfile(prof);

      // 2. Fetch Skills
      const userSkills = await usersAPI.getSkills(token);
      const mappedSkills = (userSkills || []).map((s: any) => ({
        name: s.skill_name || s.name || 'Skill',
        level: s.proficiency === 'expert' ? 90 : s.proficiency === 'intermediate' ? 70 : 50,
        category: s.category || 'General'
      }));
      setSkills(mappedSkills);

      // 3. Fetch Matches
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const matchesRes = await fetch(`${API_BASE_URL}/matches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (matchesRes.ok) {
        const matches = await matchesRes.json();
        
        const mappedAnalysis = matches.map((m: any) => ({
          id: m.resume_id,
          title: `${m.job_postings?.title || 'Target'} Role Assessment`,
          date: m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent',
          score: m.match_score || Math.round((m.overall_score || 0) * 100),
          skillsAnalyzed: (m.matched_skills?.length || 0) + (m.missing_skills?.length || 0),
          gapsFound: m.missing_skills?.length || 0
        }));
        setAnalysisHistory(mappedAnalysis);

        const mappedJobs = matches.map((m: any) => ({
          title: m.job_postings?.title || 'Target Role',
          company: m.job_postings?.company || 'Company',
          appliedDate: m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent',
          status: 'Under Review',
          matchScore: m.match_score || Math.round((m.overall_score || 0) * 100)
        }));
        setJobHistory(mappedJobs);

        if (matches.length > 0) {
          const latest = matches[0];
          setReadinessScore(latest.match_score || Math.round((latest.overall_score || 0) * 100));
          
          const mappedGaps = (latest.missing_skills || []).map((skillName: string) => ({
            skill: skillName,
            priority: 'High',
            currentLevel: 'None',
            targetLevel: 'Advanced',
            impact: 'Critical for the role',
            suggestedFocus: `Enhance your proficiency in ${skillName} through online courses.`
          }));
          setSkillGaps(mappedGaps);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch profile details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleEditProfile = () => {
    onNavigate('edit-profile');
  };

  const handleAddSkill = async () => {
    if (!newSkill.name || newSkill.name.trim().length === 0) {
      alert('Please enter a skill name');
      return;
    }

    setIsAddingSkillLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired, please log in again');
        onNavigate('login');
        return;
      }

      const currentUserStr = localStorage.getItem('currentUser');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const userId = currentUser?.id || 'me';

      const skillData = {
        name: newSkill.name.trim(),
        level: newSkill.level >= 90 ? 'expert' : newSkill.level >= 70 ? 'intermediate' : 'beginner',
        category: newSkill.category
      };

      await usersAPI.addSkill(userId, skillData, token);
      
      setShowSkillSuccess(true);
      setNewSkill({ name: '', level: 50, category: 'Programming' });
      setIsAddingSkill(false);
      
      await fetchProfileData();
      setTimeout(() => setShowSkillSuccess(false), 3000);

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to add skill');
    } finally {
      setIsAddingSkillLoading(false);
    }
  };

  const handleViewAnalysis = (analysisId: string) => {
    if (analysisId) {
      localStorage.setItem('latestAnalysisId', analysisId);
      localStorage.setItem('latestResumeId', analysisId);
    }
    onNavigate('analysis');
  };

  const handleViewJobDetails = () => {
    onNavigate('job-details');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  const userDisplayName = profile ? `${profile.user?.first_name || ''} ${profile.user?.last_name || ''}`.trim() || profile.user?.email || 'User' : 'Job Seeker';
  const userRole = profile?.user?.role === 'recruiter' ? 'Recruiter' : 'Job Seeker';
  const userEmail = profile?.user?.email || 'No email';
  const userLocation = profile?.profile?.location || 'Egypt, Alex';
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'US';

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-green-700 to-green-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
                {userInitials}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl text-gray-900 mb-2">{userDisplayName}</h2>
                  <p className="text-gray-600 mb-4">{userRole}</p>
                </div>
                <button onClick={handleEditProfile} className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-sm">{userEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm">{userLocation}</span>
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
                  onClick={() => onNavigate('jobs')}
                  className="px-6 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all"
                >
                  Explore Jobs
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

              {skills.length === 0 ? (
                <p className="text-gray-600 text-sm italic">No skills added yet. Upload a resume to automatically extract skills or add them manually below.</p>
              ) : (
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-gray-900 font-medium">{skill.name}</span>
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
              )}

              <button
                onClick={() => setIsAddingSkill(true)}
                className="mt-6 w-full px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all font-semibold"
              >
                Add New Skill
              </button>

              {/* Add Skill Modal */}
              {isAddingSkill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl border border-green-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-900 text-xl font-bold">Add New Skill</h3>
                      <button onClick={() => setIsAddingSkill(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600 font-semibold">Skill Name</label>
                        <input
                          type="text"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="e.g. React, Docker, Python"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600 font-semibold">Proficiency Level</label>
                        <select
                          value={newSkill.level}
                          onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600"
                        >
                          <option value={90}>Expert (90%)</option>
                          <option value={70}>Intermediate (70%)</option>
                          <option value={50}>Beginner (50%)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600 font-semibold">Category</label>
                        <select
                          value={newSkill.category}
                          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600"
                        >
                          <option value="Programming">Programming</option>
                          <option value="Framework">Framework</option>
                          <option value="Backend">Backend</option>
                          <option value="AI/ML">AI/ML</option>
                          <option value="Database">Database</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-6">
                      <button
                        onClick={() => setIsAddingSkill(false)}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-all mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        disabled={isAddingSkillLoading}
                      >
                        {isAddingSkillLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
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

              {analysisHistory.length === 0 ? (
                <p className="text-gray-600 text-sm italic">No analysis history found. Upload a resume to get started.</p>
              ) : (
                <div className="space-y-4">
                  {analysisHistory.map((analysis, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-lime-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-gray-900 font-semibold mb-1">{analysis.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span>{analysis.date}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl text-green-700 font-bold">{analysis.score}%</div>
                          <p className="text-xs text-gray-500">Readiness</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-sm">
                          <span className="text-gray-600">Skills Analyzed:</span>
                          <span className="ml-1 text-green-700 font-semibold">{analysis.skillsAnalyzed}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Gaps Found:</span>
                          <span className="ml-1 text-orange-700 font-semibold">{analysis.gapsFound}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewAnalysis(analysis.id)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                      >
                        View Full Analysis
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Job Application History */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-green-600" />
                Job Matching History
              </h3>

              {jobHistory.length === 0 ? (
                <p className="text-gray-600 text-sm italic">No matching history found. Run resume analysis to see matched jobs.</p>
              ) : (
                <div className="space-y-4">
                  {jobHistory.map((job, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-lime-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-gray-900 font-semibold mb-1">{job.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{job.company}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span>Matched on {job.appliedDate}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl text-green-700 font-bold">{job.matchScore}%</div>
                          <p className="text-xs text-gray-500 mb-2">Match</p>
                          <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                            {job.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleViewJobDetails}
                        className="w-full px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm font-semibold"
                      >
                        View Job Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skill Gaps */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                Skill Gaps
              </h3>

              {skillGaps.length === 0 ? (
                <p className="text-gray-600 text-sm italic">No skill gaps identified. Try running a resume matching analysis first.</p>
              ) : (
                <div className="space-y-4">
                  {skillGaps.map((gap, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-gray-900 font-semibold">{gap.skill}</h4>
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 border border-red-200 font-semibold">
                          {gap.priority} Priority
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Current:</span>
                          <span className="ml-1 text-orange-700 font-semibold">{gap.currentLevel}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Target:</span>
                          <span className="ml-1 text-green-700 font-semibold">{gap.targetLevel}</span>
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
              )}

              <button
                onClick={() => onNavigate('courses')}
                className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                View Course Recommendations
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Career Readiness */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 font-bold">Career Readiness</h3>
              
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
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - readinessScore / 100)}`}
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
                    <div className="text-4xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent font-bold">
                      {readinessScore}%
                    </div>
                    <p className="text-gray-600 text-sm">Ready</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                View Recommendations
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <h4 className="mb-4 text-white text-lg font-bold">Your Progress</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Analyses Done</span>
                  <span className="text-2xl text-white font-bold">{analysisHistory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Jobs Matched</span>
                  <span className="text-2xl text-white font-bold">{jobHistory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Skills Listed</span>
                  <span className="text-2xl text-white font-bold">{skills.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}