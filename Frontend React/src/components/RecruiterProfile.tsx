import { Building2, Mail, MapPin, Briefcase, Users, TrendingUp, Plus, Edit, Phone, X, Save, Search, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface RecruiterProfileProps {
  onNavigate: (page: string) => void;
}

interface CompanyProfile {
  name: string;
  description: string;
  email: string;
  phone: string;
  location: string;
}

export function RecruiterProfile({ onNavigate }: RecruiterProfileProps) {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: 'TechCorp Inc.',
    description: 'Leading Technology Company',
    email: 'hr@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA'
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState<CompanyProfile>(companyProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showViewApplicationsModal, setShowViewApplicationsModal] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [showManageJobModal, setShowManageJobModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const handleEditProfile = () => {
    setEditedProfile(companyProfile);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setCompanyProfile(editedProfile);
      setIsSaving(false);
      setShowEditModal(false);
      setSuccessMessage('Company profile updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleViewApplicants = (jobTitle: string) => {
    setSelectedJobTitle(jobTitle);
    setShowViewApplicationsModal(true);
  };

  const handleManageJob = (jobTitle: string) => {
    setSelectedJobTitle(jobTitle);
    setShowManageJobModal(true);
  };

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleContactCandidate = (candidate: any) => {
    // Open mailto link
    window.location.href = `mailto:${candidate.email}?subject=Regarding Your Application&body=Hi ${candidate.name},`;
  };

  const handleSearchCandidates = () => {
    setShowSearchModal(true);
  };

  const activeJobs = [
    { title: 'Senior Software Engineer', applicants: 45, posted: '2025-01-10', status: 'Active' },
    { title: 'Product Manager', applicants: 32, posted: '2025-01-08', status: 'Active' },
    { title: 'UX Designer', applicants: 28, posted: '2025-01-05', status: 'Active' },
  ];

  const topCandidates = [
    { 
      name: 'Sarah Johnson', 
      email: 'sarah.johnson@email.com',
      match: 92, 
      skills: ['React', 'Node.js', 'AWS'], 
      readiness: 89,
      experience: '5 years',
      education: 'MS Computer Science'
    },
    { 
      name: 'Michael Chen', 
      email: 'michael.chen@email.com',
      match: 88, 
      skills: ['Python', 'Machine Learning', 'TensorFlow'], 
      readiness: 85,
      experience: '4 years',
      education: 'BS Data Science'
    },
    { 
      name: 'Emily Davis', 
      email: 'emily.davis@email.com',
      match: 85, 
      skills: ['UX Design', 'Figma', 'User Research'], 
      readiness: 87,
      experience: '6 years',
      education: 'BFA Design'
    },
  ];

  const mockApplications = [
    { 
      name: 'Sarah Johnson', 
      email: 'sarah.johnson@email.com',
      skills: ['React', 'Node.js', 'AWS'],
      experience: '5 years',
      appliedDate: '2025-01-14'
    },
    { 
      name: 'Michael Chen', 
      email: 'michael.chen@email.com',
      skills: ['Python', 'Machine Learning'],
      experience: '4 years',
      appliedDate: '2025-01-13'
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

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
                  <h2 className="text-3xl text-gray-900 mb-2">{companyProfile.name}</h2>
                  <p className="text-gray-600 mb-4">{companyProfile.description}</p>
                </div>
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-sm">{companyProfile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-sm">{companyProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm">{companyProfile.location}</span>
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
                      <button
                        onClick={() => handleViewApplicants(job.title)}
                        className="flex-1 px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm"
                      >
                        View Applications
                      </button>
                      <button
                        onClick={() => handleManageJob(job.title)}
                        className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                      >
                        Manage Jobs
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
                      <button
                        onClick={() => handleViewCandidate(candidate)}
                        className="flex-1 px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Candidate Profile
                      </button>
                      <button
                        onClick={() => handleContactCandidate(candidate)}
                        className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
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
                <button
                  onClick={handleSearchCandidates}
                  className="w-full px-4 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
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
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl">Edit Company Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editedProfile.description}
                    onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Applications Modal */}
        {showViewApplicationsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl">Applications for: {selectedJobTitle}</h3>
                <button onClick={() => setShowViewApplicationsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {mockApplications.map((applicant, idx) => (
                  <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-gray-900 mb-1">{applicant.name}</h4>
                        <p className="text-sm text-gray-600">{applicant.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {applicant.skills.map((skill, sidx) => (
                            <span key={sidx} className="text-xs px-2 py-1 bg-white text-gray-700 rounded border border-green-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Applied: {applicant.appliedDate}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Experience: {applicant.experience}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm">
                        View Resume
                      </button>
                      <button 
                        onClick={() => window.location.href = `mailto:${applicant.email}`}
                        className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Candidate Profile Modal */}
        {showCandidateModal && selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl">{selectedCandidate.name}'s Profile</h3>
                <button onClick={() => setShowCandidateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-gray-700 mb-2">Contact Information</h4>
                  <p className="text-gray-600">{selectedCandidate.email}</p>
                </div>
                <div>
                  <h4 className="text-gray-700 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-gray-700 mb-2">Experience</h4>
                  <p className="text-gray-600">{selectedCandidate.experience}</p>
                </div>
                <div>
                  <h4 className="text-gray-700 mb-2">Education</h4>
                  <p className="text-gray-600">{selectedCandidate.education}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl text-green-700">{selectedCandidate.match}%</div>
                    <p className="text-sm text-gray-600">Match Score</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl text-blue-700">{selectedCandidate.readiness}%</div>
                    <p className="text-sm text-gray-600">Readiness</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleContactCandidate(selectedCandidate)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Contact Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Candidates Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl">Search Candidates</h3>
                <button onClick={() => setShowSearchModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Python, AWS"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Years of Experience</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600">
                    <option value="">Any</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Job Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Job Modal */}
        {showManageJobModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl">Manage Job: {selectedJobTitle}</h3>
                <button onClick={() => setShowManageJobModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-left">
                  Edit Job Description
                </button>
                <button className="w-full px-4 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-left">
                  Change Requirements
                </button>
                <button className="w-full px-4 py-3 border-2 border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-all text-left">
                  Close Job Post
                </button>
                <button className="w-full px-4 py-3 border-2 border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-all text-left">
                  Delete Job Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}