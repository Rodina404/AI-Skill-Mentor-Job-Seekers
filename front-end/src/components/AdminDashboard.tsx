import { Users, Briefcase, BookOpen, Activity, TrendingUp, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useState } from 'react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [approvedJobs, setApprovedJobs] = useState<string[]>(['Senior Software Engineer', 'Data Scientist']); // Track approved jobs

  const handleAddUser = () => {
    alert('Add New User - Create a new user account with role assignment (User, Recruiter, or Admin).');
  };

  const handleEditUser = (userName: string) => {
    alert(`Edit User: ${userName}\n\nYou can:\n- Update user information\n- Change user role\n- Manage permissions\n- Deactivate account`);
  };

  const handleViewJob = (jobTitle: string) => {
    alert(`Viewing job: ${jobTitle}\n\nThis would show:\n- Full job details\n- Company information\n- Current applicants\n- Status and metrics`);
  };

  const handleApproveJob = (jobTitle: string) => {
    // Prevent re-approving already approved jobs
    if (approvedJobs.includes(jobTitle)) {
      alert(`Job "${jobTitle}" is already approved and active!`);
      return;
    }
    
    // Add to approved jobs
    setApprovedJobs([...approvedJobs, jobTitle]);
    alert(`Job "${jobTitle}" has been approved and is now live!`);
  };
  
  const handleAddCourse = () => {
    alert('Add New Course - Add a course from learning platforms to the recommendation system.');
  };

  const handleConfigureAI = () => {
    alert('AI Configuration - Adjust skill extraction algorithms, matching weights, and recommendation parameters.');
  };

  const handleViewAuditLog = () => {
    alert('Ethical AI Audit Log - Review AI decisions, bias detection reports, and fairness monitoring data.');
  };

  const handleReviewJobs = () => {
    alert('Job Review Queue - View and approve pending job postings from recruiters.');
  };

  const stats = [
    { label: 'Total Users', value: '10,234', change: '+12%', icon: Users, color: 'green' },
    { label: 'Active Jobs', value: '1,456', change: '+8%', icon: Briefcase, color: 'blue' },
    { label: 'Courses Listed', value: '3,892', change: '+15%', icon: BookOpen, color: 'purple' },
    { label: 'System Health', value: '98.5%', change: '+2%', icon: Activity, color: 'emerald' },
  ];

  const recentUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'Job Seeker', joined: '2025-01-15', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Recruiter', joined: '2025-01-14', status: 'Active' },
    { name: 'Bob Johnson', email: 'bob@example.com', role: 'Job Seeker', joined: '2025-01-13', status: 'Pending' },
    { name: 'Alice Williams', email: 'alice@example.com', role: 'Recruiter', joined: '2025-01-12', status: 'Active' },
  ];

  const recentJobs = [
    { title: 'Senior Software Engineer', company: 'TechCorp', posted: '2025-01-15', applicants: 45, status: 'Active' },
    { title: 'Data Scientist', company: 'DataInc', posted: '2025-01-14', applicants: 32, status: 'Active' },
    { title: 'Product Manager', company: 'StartupXYZ', posted: '2025-01-13', applicants: 28, status: 'Under Review' },
  ];
  
  // Check if job is already approved
  const isJobApproved = (jobTitle: string) => {
    return approvedJobs.includes(jobTitle) || recentJobs.find(j => j.title === jobTitle)?.status === 'Active';
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <p className="text-gray-600">Manage users, jobs, and system performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-green-600" />
                <span className="text-sm text-green-700">{stat.change}</span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{stat.value}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-green-100 mb-8">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'jobs'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'courses'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div>
                    <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Recent Users
                    </h3>
                    <div className="space-y-3">
                      {recentUsers.slice(0, 3).map((user, index) => (
                        <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-900">{user.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">{user.role} • Joined {user.joined}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Jobs */}
                  <div>
                    <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-green-600" />
                      Recent Jobs
                    </h3>
                    <div className="space-y-3">
                      {recentJobs.map((job, index) => (
                        <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-900">{job.title}</span>
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                              {job.applicants} applicants
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <p className="text-xs text-gray-500 mt-1">Posted {job.posted}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Alerts */}
                <div>
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-green-600" />
                    System Alerts
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-gray-900">All systems operational</p>
                        <p className="text-sm text-gray-600">Last checked: 2 minutes ago</p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-gray-900">User growth increased by 15% this week</p>
                        <p className="text-sm text-gray-600">1,234 new registrations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900">User Management</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all" onClick={handleAddUser}>
                    Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 text-gray-700">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">{user.name}</td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4 text-gray-600">{user.role}</td>
                          <td className="py-3 px-4 text-gray-600">{user.joined}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-green-700 hover:text-green-600 text-sm" onClick={() => handleEditUser(user.name)}>Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900">Job Management</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all" onClick={handleReviewJobs}>
                    Review Jobs
                  </button>
                </div>
                <div className="space-y-4">
                  {recentJobs.map((job, index) => {
                    const isApproved = isJobApproved(job.title);
                    return (
                      <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-gray-900 mb-1">{job.title}</h4>
                            <p className="text-sm text-gray-600">{job.company} • Posted {job.posted}</p>
                            <p className="text-sm text-gray-500 mt-1">{job.applicants} applicants • Status: {job.status}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all" onClick={() => handleViewJob(job.title)}>
                              View
                            </button>
                            <button 
                              className={`px-4 py-2 rounded-lg transition-all ${
                                isApproved
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:shadow-lg'
                              }`}
                              onClick={() => handleApproveJob(job.title)}
                              disabled={isApproved}
                            >
                              {isApproved ? 'Approved' : 'Approve'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900">Course Management</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all" onClick={handleAddCourse}>
                    Add Course
                  </button>
                </div>
                <p className="text-gray-600">Manage and curate course recommendations for users.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  System Settings
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-gray-900 mb-2">AI Model Configuration</h4>
                    <p className="text-sm text-gray-600 mb-3">Configure AI analysis parameters and model settings.</p>
                    <button className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm" onClick={handleConfigureAI}>
                      Configure
                    </button>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-gray-900 mb-2">Ethical AI Compliance</h4>
                    <p className="text-sm text-gray-600 mb-3">Monitor and ensure fair, unbiased AI recommendations.</p>
                    <button className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm" onClick={handleViewAuditLog}>
                      View Audit Log
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}