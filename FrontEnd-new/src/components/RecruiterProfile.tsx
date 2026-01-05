import { Building2, Mail, MapPin, Briefcase, Users, TrendingUp, Plus } from 'lucide-react';

interface RecruiterProfileProps {
  onNavigate: (page: string) => void;
}

export function RecruiterProfile({ onNavigate }: RecruiterProfileProps) {
  const activeJobs = [
    { title: 'Senior Software Engineer', applicants: 45, posted: '2025-01-10', status: 'Active' },
    { title: 'Product Manager', applicants: 32, posted: '2025-01-08', status: 'Active' },
    { title: 'UX Designer', applicants: 28, posted: '2025-01-05', status: 'Active' },
  ];

  const topCandidates = [
    { name: 'Sarah Johnson', match: 92, skills: ['React', 'Node.js', 'AWS'], readiness: 89 },
    { name: 'Michael Chen', match: 88, skills: ['Python', 'Machine Learning', 'TensorFlow'], readiness: 85 },
    { name: 'Emily Davis', match: 85, skills: ['UX Design', 'Figma', 'User Research'], readiness: 87 },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-green-700 to-green-600 rounded-2xl flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl text-gray-900 mb-2">TechCorp Inc.</h2>
                  <p className="text-gray-600 mb-4">Leading Technology Company</p>
                </div>
                <button className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all">
                  Edit Profile
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-sm">hr@techcorp.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm">500-1000 employees</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('job-posting')}
                className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Jobs */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-green-600" />
                  Active Job Listings
                </h3>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="text-green-700 hover:text-green-600 text-sm"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {activeJobs.map((job, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-900">{job.title}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{job.applicants} applicants</span>
                      <span className="text-gray-500">Posted {job.posted}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm">
                        View Applicants
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Candidates */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                Top Matching Candidates
              </h3>

              <div className="space-y-4">
                {topCandidates.map((candidate, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-gray-900 mb-1">{candidate.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-white text-gray-700 rounded border border-green-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-2xl text-green-700">{candidate.match}%</span>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-sm text-gray-600">
                        Readiness: <span className="text-green-700">{candidate.readiness}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm">
                        View Profile
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6">Recruiting Stats</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Total Applicants</span>
                    <span className="text-2xl text-gray-900">105</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-green-700 to-green-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Active Jobs</span>
                    <span className="text-2xl text-gray-900">3</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-green-700 to-green-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Avg. Match Score</span>
                    <span className="text-2xl text-gray-900">82%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-green-700 to-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('job-posting')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Post New Job
                </button>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="w-full px-4 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all"
                >
                  Manage Jobs
                </button>
                <button className="w-full px-4 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all">
                  Search Candidates
                </button>
              </div>
            </div>

            {/* Growth */}
            <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-2xl p-6 text-white">
              <TrendingUp className="w-8 h-8 mb-4" />
              <h4 className="mb-2 text-white">Growing Fast</h4>
              <p className="text-white/90 text-sm mb-4">
                Your job postings received 45% more views this week!
              </p>
              <button className="px-4 py-2 bg-white text-green-700 rounded-lg hover:shadow-lg transition-all text-sm">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
