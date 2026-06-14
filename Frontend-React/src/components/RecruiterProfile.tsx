import { Building2, Mail, MapPin, Briefcase, Users, TrendingUp, Plus, Edit, Phone, X, Save, Search, Eye, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { jobsAPI } from '../api/jobs.api';
import { useAuth } from '../context/AuthContext';

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
  const { token } = useAuth();
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
  const [selectedJobId, setSelectedJobId] = useState('');
  const [showManageJobModal, setShowManageJobModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplicantsLoading, setIsApplicantsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!token) {
        setError('Session expired, please log in again');
        onNavigate('login');
        return;
      }
      const jobsRes = await jobsAPI.getAllJobs({}, token);
      const allJobs = jobsRes?.data?.jobs || [];
      
      const mappedJobs = allJobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        posted: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Recent',
        status: j.status || 'Active'
      }));
      setActiveJobs(mappedJobs);

      // Load applicants count and candidate feed for the first job as top candidates
      if (mappedJobs.length > 0) {
        try {
          const appRes = await jobsAPI.getJobApplicants(mappedJobs[0].id, token);
          const cands = appRes?.data?.candidates || [];
          setTopCandidates(cands.slice(0, 3).map((c: any) => ({
            name: c.name,
            email: c.email || `${c.name.toLowerCase().replace(' ', '.')}@email.com`,
            match: c.score,
            skills: c.matchedSkills || [],
            readiness: c.score,
            experience: '4 years',
            education: 'BS Computer Science'
          })));
        } catch (err) {
          console.error(err);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch recruiter dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, []);

  const handleEditProfile = () => {
    setEditedProfile(companyProfile);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setCompanyProfile(editedProfile);
      setIsSaving(false);
      setShowEditModal(false);
      setSuccessMessage('Company profile updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleViewApplicants = async (jobId: string, jobTitle: string) => {
    setSelectedJobTitle(jobTitle);
    setSelectedJobId(jobId);
    setShowViewApplicationsModal(true);
    setIsApplicantsLoading(true);
    try {
      if (!token) {
        alert('Session expired, please log in again');
        onNavigate('login');
        return;
      }
      const appRes = await jobsAPI.getJobApplicants(jobId, token);
      const cands = appRes?.data?.candidates || [];
      const mappedApps = cands.map((c: any) => ({
        name: c.name,
        email: c.email || `${c.name.toLowerCase().replace(' ', '.')}@email.com`,
        skills: c.matchedSkills || [],
        experience: '4 years',
        appliedDate: 'Recent',
        score: c.score,
        missingSkills: c.missingSkills || []
      }));
      setApplicants(mappedApps);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to fetch applicants');
    } finally {
      setIsApplicantsLoading(false);
    }
  };

  const handleManageJob = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setShowManageJobModal(true);
  };

  const handleDeleteJob = async () => {
    if (!selectedJobId) return;
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobsAPI.deleteJob(selectedJobId);
      setShowManageJobModal(false);
      await fetchJobsData();
      setSuccessMessage('Job deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleContactCandidate = (candidate: any) => {
    window.location.href = `mailto:${candidate.email}?subject=Regarding Your Application&body=Hi ${candidate.name},`;
  };

  const handleSearchCandidates = () => {
    setShowSearchModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 shadow-md">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

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
              <div className="w-32 h-32 bg-gradient-to-br from-green-700 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                  className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center gap-2 font-semibold"
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
                className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
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
                <h3 className="text-gray-900 flex items-center gap-2 font-bold text-xl">
                  <Briefcase className="w-6 h-6 text-green-600" />
                  Active Job Listings
                </h3>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="text-green-700 hover:text-green-600 text-sm font-semibold"
                >
                  View All
                </button>
              </div>

              {activeJobs.length === 0 ? (
                <p className="text-gray-600 text-sm italic">No active job postings found. Click "Post New Job" to list one.</p>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div key={job.id} className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-gray-900 font-semibold text-lg">{job.title}</h4>
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Posted on {job.posted}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleViewApplicants(job.id, job.title)}
                          className="flex-1 px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm font-semibold"
                        >
                          View Applications
                        </button>
                        <button
                          onClick={() => handleManageJob(job.id, job.title)}
                          className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          Manage Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Candidates */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2 font-bold text-xl">
                <Users className="w-6 h-6 text-green-600" />
                Top Matching Candidates
              </h3>

              {topCandidates.length === 0 ? (
                <p className="text-gray-600 text-sm italic">No candidates matched yet. Candidates will appear here once matching runs.</p>
              ) : (
                <div className="space-y-4">
                  {topCandidates.map((candidate, index) => (
                    <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-gray-900 mb-1 font-semibold">{candidate.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {candidate.skills.map((skill: string, idx: number) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-white text-gray-700 rounded border border-green-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-2xl text-green-700 font-bold">{candidate.match}%</span>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-sm text-gray-600">
                          Readiness: <span className="text-green-700 font-semibold">{candidate.readiness}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewCandidate(candidate)}
                          className="flex-1 px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm flex items-center justify-center gap-2 font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleContactCandidate(candidate)}
                          className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 font-semibold"
                        >
                          <Mail className="w-4 h-4" />
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 animate-fadeIn">
              <h3 className="text-gray-900 mb-6 font-bold text-lg">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('job-posting')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Post New Job
                </button>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="w-full px-4 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all font-semibold"
                >
                  Manage Jobs
                </button>
                <button
                  onClick={handleSearchCandidates}
                  className="w-full px-4 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Search className="w-5 h-5" />
                  Search Candidates
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">Edit Company Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Company Name</label>
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Description</label>
                  <textarea
                    value={editedProfile.description}
                    onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Contact Email</label>
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Location</label>
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">Applications for: {selectedJobTitle}</h3>
                <button onClick={() => setShowViewApplicationsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {isApplicantsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading applicants...</p>
                </div>
              ) : applicants.length === 0 ? (
                <p className="text-gray-600 italic text-center py-8">No applicants matching this job posting yet.</p>
              ) : (
                <div className="space-y-4">
                  {applicants.map((applicant, idx) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="text-gray-900 font-semibold text-lg">{applicant.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{applicant.email}</p>
                        <div className="flex flex-wrap gap-2">
                          {applicant.skills.map((skill: string, sidx: number) => (
                            <span key={sidx} className="text-xs px-2 py-1 bg-white text-gray-700 rounded border border-green-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl text-green-700 font-bold mb-1">{applicant.score}%</div>
                        <p className="text-xs text-gray-500 mb-3">Match Score</p>
                        <button
                          onClick={() => window.location.href = `mailto:${applicant.email}`}
                          className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          Contact Candidate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Profile Modal */}
        {showCandidateModal && selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">{selectedCandidate.name}'s Profile</h3>
                <button onClick={() => setShowCandidateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-gray-700 font-bold mb-2">Contact Information</h4>
                  <p className="text-gray-600">{selectedCandidate.email}</p>
                </div>
                <div>
                  <h4 className="text-gray-700 font-bold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-gray-700 font-bold mb-2">Experience</h4>
                  <p className="text-gray-600">{selectedCandidate.experience}</p>
                </div>
                <div>
                  <h4 className="text-gray-700 font-bold mb-2">Education</h4>
                  <p className="text-gray-600">{selectedCandidate.education}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                    <div className="text-3xl text-green-700 font-bold">{selectedCandidate.match}%</div>
                    <p className="text-sm text-gray-600">Match Score</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <div className="text-3xl text-blue-700 font-bold">{selectedCandidate.readiness}%</div>
                    <p className="text-sm text-gray-600">Readiness Score</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleContactCandidate(selectedCandidate)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
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
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">Search Candidates</h3>
                <button onClick={() => setShowSearchModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Python, AWS"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Years of Experience</label>
                  <select className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50">
                    <option value="">Any</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
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
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">Manage Job: {selectedJobTitle}</h3>
                <button onClick={() => setShowManageJobModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={handleDeleteJob}
                  className="w-full px-4 py-3 border-2 border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-all text-left font-semibold"
                >
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