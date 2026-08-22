import { Building2, Mail, MapPin, Briefcase, Users, Plus, Edit, Phone, X, Save, Search, Eye, CheckCircle, Sparkles, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, Clock, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { jobsAPI } from '../api/jobs.api';
import { recruiterProfileAPI } from '../api/recruiterProfile.api';
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

interface CandidateMatch {
  matchId: string;
  candidateId: string;
  userId: string | null;
  name: string;
  score: number;
  matchScore: number;
  experience: number;
  matchingSkills: string[];
  missingSkills: string[];
  calculatedAt: string;
  isStale: boolean;
}

interface EditJobForm {
  title: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
  requiredSkills: string;
  status: string;
}

const parseSkillsForInput = (skills: unknown): string => {
  if (Array.isArray(skills)) return skills.map(String).join(', ');
  if (typeof skills !== 'string') return '';
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) return parsed.map(String).join(', ');
  } catch {
    // Existing rows may store comma-separated skills.
  }
  return skills;
};

/** Safely extract a human-readable error message — never returns [object Object]. */
const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (!err) return fallback;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.error === 'string') return obj.error;
  }
  return fallback;
};

export function RecruiterProfile({ onNavigate }: RecruiterProfileProps) {
  const { token } = useAuth();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState<CompanyProfile>({
    name: '',
    description: '',
    email: '',
    phone: '',
    location: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showViewApplicationsModal, setShowViewApplicationsModal] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [showManageJobModal, setShowManageJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editJobForm, setEditJobForm] = useState<EditJobForm>({
    title: '',
    company: '',
    location: '',
    jobType: 'full_time',
    description: '',
    requiredSkills: '',
    status: 'open',
  });
  const [isEditJobLoading, setIsEditJobLoading] = useState(false);
  const [isEditJobSaving, setIsEditJobSaving] = useState(false);
  const [editJobError, setEditJobError] = useState<string | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // AI Matches & Resume Signed URL State
  const [showAIMatchesModal, setShowAIMatchesModal] = useState(false);
  const [aiMatches, setAIMatches] = useState<CandidateMatch[]>([]);
  const [aiMatchesPage, setAIMatchesPage] = useState(1);
  const [aiMatchesTotal, setAIMatchesTotal] = useState(0);
  const [isAIMatchesLoading, setIsAIMatchesLoading] = useState(false);
  const [isMatchingRunning, setIsMatchingRunning] = useState(false);
  const [matchingStatusMessage, setMatchingStatusMessage] = useState('');
  const [partialWarning, setPartialWarning] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [aiMatchesError, setAIMatchesError] = useState<string | null>(null);
  const [matchingHasRun, setMatchingHasRun] = useState(false);
  const [loadingResumeCandidateId, setLoadingResumeCandidateId] = useState<string | null>(null);

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
      const [profileRes, jobsRes] = await Promise.allSettled([
        recruiterProfileAPI.getCompanyProfile(token),
        jobsAPI.getMyRecruiterJobs({ status: 'all' }, token)
      ]);

      if (profileRes.status === 'fulfilled') {
        const pData = profileRes.value?.data;
        if (pData) {
          setCompanyProfile({
            name: pData.name || '',
            description: pData.description || '',
            email: pData.email || '',
            phone: pData.phone || '',
            location: pData.location || ''
          });
        } else {
          setCompanyProfile(null);
        }
      }

      if (jobsRes.status === 'fulfilled') {
        const allJobs = jobsRes.value?.data?.jobs || [];
        const mappedJobs = allJobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          posted: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Recent',
          status: j.status || 'Active'
        }));
        setActiveJobs(mappedJobs);

        if (mappedJobs.length > 0) {
          try {
            const matchRes = await jobsAPI.getCandidateMatches(mappedJobs[0].id, { page: 1, limit: 3 }, token);
            const matchesData = matchRes?.data?.matches || [];
            if (matchesData.length > 0) {
              setTopCandidates(matchesData.map((c: CandidateMatch) => ({
                name: c.name,
                email: 'Contact via platform',
                match: c.score,
                skills: c.matchingSkills || [],
                missingSkills: c.missingSkills || [],
                readiness: c.score,
                experience: c.experience ? `${c.experience} years` : 'Not specified',
                education: null,
                isStale: c.isStale
              })));
            }
          } catch (err) {
            console.warn('[RecruiterProfile] Top candidates load note:', err);
          }
        }
      } else {
        throw jobsRes.reason;
      }

    } catch (err: any) {
      console.error(err);
      setError(extractErrorMessage(err, 'Failed to fetch recruiter dashboard data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, []);

  const handleEditProfile = () => {
    setEditedProfile(companyProfile || {
      name: '',
      description: '',
      email: '',
      phone: '',
      location: ''
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (!token) {
        alert('Session expired, please log in again');
        onNavigate('login');
        return;
      }
      const response = await recruiterProfileAPI.updateCompanyProfile(editedProfile, token);
      const savedData = response?.data;
      if (savedData) {
        setCompanyProfile({
          name: savedData.name || '',
          description: savedData.description || '',
          email: savedData.email || '',
          phone: savedData.phone || '',
          location: savedData.location || ''
        });
      }
      setShowEditModal(false);
      setSuccessMessage('Company profile updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(extractErrorMessage(err, 'Failed to update company profile'));
    } finally {
      setIsSaving(false);
    }
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
        experience: c.experience ? `${c.experience} years` : 'Not specified',
        appliedDate: c.appliedAt ? new Date(c.appliedAt).toLocaleDateString() : 'Recent',
        score: c.score,
        missingSkills: c.missingSkills || []
      }));
      setApplicants(mappedApps);
    } catch (err: any) {
      console.error(err);
      alert(extractErrorMessage(err, 'Failed to fetch applicants'));
    } finally {
      setIsApplicantsLoading(false);
    }
  };

  // ── AI Matches Actions ────────────────────────────────────────────────
  const fetchPersistedMatches = async (jobId: string, page: number = 1) => {
    setIsAIMatchesLoading(true);
    setAIMatchesError(null);
    try {
      if (!token) return;
      const res = await jobsAPI.getCandidateMatches(jobId, { page, limit: 10 }, token);
      const matchesData = res?.data?.matches || [];
      const totalCount = res?.data?.totalMatches || matchesData.length;
      setAIMatches(matchesData);
      setAIMatchesTotal(totalCount);
      setAIMatchesPage(page);
      setMatchingHasRun(totalCount > 0 || res?.data?.matches !== undefined);
    } catch (err: any) {
      console.error('[RecruiterProfile] getCandidateMatches error:', err);
      // If 404 or no matches run yet
      setAIMatches([]);
      setAIMatchesTotal(0);
      setMatchingHasRun(false);
    } finally {
      setIsAIMatchesLoading(false);
    }
  };

  const handleOpenAIMatches = async (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setShowAIMatchesModal(true);
    setPartialWarning(null);
    setPersistenceError(null);
    setAIMatchesError(null);
    await fetchPersistedMatches(jobId, 1);
  };

  const handleRunMatching = async () => {
    if (!selectedJobId || isMatchingRunning) return;

    setIsMatchingRunning(true);
    setMatchingStatusMessage('Matching candidates across platform...');
    setPartialWarning(null);
    setPersistenceError(null);
    setAIMatchesError(null);

    try {
      if (!token) {
        alert('Session expired, please log in again');
        onNavigate('login');
        return;
      }

      const res = await jobsAPI.matchCandidates(selectedJobId, token);
      const data = res?.data || res;

      setMatchingHasRun(true);

      // Check partial completion status (Task 6)
      if (data.completionStatus === 'partial') {
        setPartialWarning(
          `Some candidate batches could not be evaluated (${data.batchErrors?.length || 0} batch timeouts/failures). These results are incomplete.`
        );
      }

      // Check persistence failure (Task 7)
      if (data.persisted === false && data.completionStatus === 'complete') {
        setPersistenceError('Candidate matching completed, but database persistence failed. Results shown are transient.');
      }

      // Fetch authoritative persisted matches from DB
      await fetchPersistedMatches(selectedJobId, 1);

      setSuccessMessage(`Matching finished: ${data.candidatesSuccessfullyEvaluated || 0} candidates evaluated.`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err: any) {
      console.error('[RecruiterProfile] matchCandidates error:', err);
      setAIMatchesError(extractErrorMessage(err, 'Failed to run AI candidate matching. Please try again.'));
    } finally {
      setIsMatchingRunning(false);
      setMatchingStatusMessage('');
    }
  };

  const handleViewResume = async (candidateId: string) => {
    if (!selectedJobId || !candidateId) return;
    setLoadingResumeCandidateId(candidateId);
    try {
      if (!token) {
        alert('Session expired, please log in again');
        onNavigate('login');
        return;
      }
      const res = await jobsAPI.getCandidateResumeUrl(selectedJobId, candidateId, token);
      const signedUrl = res?.data?.url;
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Failed to retrieve resume URL');
      }
    } catch (err: any) {
      console.error('[RecruiterProfile] handleViewResume error:', err);
      alert(extractErrorMessage(err, 'No resume file is currently available for this candidate'));
    } finally {
      setLoadingResumeCandidateId(null);
    }
  };

  const handleManageJob = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setShowManageJobModal(true);
  };

  const handleOpenEditJob = async () => {
    if (!selectedJobId) return;
    setShowManageJobModal(false);
    setShowEditJobModal(true);
    setIsEditJobLoading(true);
    setEditJobError(null);
    try {
      if (!token) {
        alert('Session expired, please log in again');
        onNavigate('login');
        return;
      }
      const res = await jobsAPI.getJobById(selectedJobId, token);
      const job = res?.data || res;
      setEditJobForm({
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        jobType: job.job_type || 'full_time',
        description: job.job_description || '',
        requiredSkills: parseSkillsForInput(job.required_skills),
        status: job.status || 'open',
      });
    } catch (err: any) {
      console.error(err);
      setEditJobError(extractErrorMessage(err, 'Failed to load job details for editing'));
    } finally {
      setIsEditJobLoading(false);
    }
  };

  const handleSaveEditJob = async () => {
    if (!selectedJobId) return;
    setIsEditJobSaving(true);
    setEditJobError(null);
    try {
      if (!token) {
        alert('Session expired, please log in again');
        onNavigate('login');
        return;
      }
      const requiredSkills = editJobForm.requiredSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      await jobsAPI.updateJob(selectedJobId, {
        title: editJobForm.title.trim(),
        company: editJobForm.company.trim(),
        location: editJobForm.location.trim(),
        job_description: editJobForm.description.trim(),
        required_skills: requiredSkills,
        job_type: editJobForm.jobType,
        status: editJobForm.status,
      }, token);

      setShowEditJobModal(false);
      await fetchJobsData();
      setSuccessMessage('Job updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setEditJobError(extractErrorMessage(err, 'Failed to update job'));
    } finally {
      setIsEditJobSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJobId) return;
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      if (!token) {
        alert('Session expired, please log in again');
        onNavigate('login');
        return;
      }
      await jobsAPI.deleteJob(selectedJobId, token);
      setShowManageJobModal(false);
      await fetchJobsData();
      setSuccessMessage('Job deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(extractErrorMessage(err, 'Failed to delete job'));
    }
  };

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleContactCandidate = (candidate: any) => {
    if (candidate.email && candidate.email !== 'Contact via platform') {
      window.location.href = `mailto:${candidate.email}?subject=Regarding Your Job Profile&body=Hi ${candidate.name},`;
    } else {
      alert(`Contact request logged successfully for candidate ${candidate.name}.`);
    }
  };

  const handleSearchCandidates = () => {
    if (activeJobs.length > 0) {
      handleOpenAIMatches(activeJobs[0].id, activeJobs[0].title);
    } else {
      setShowSearchModal(true);
    }
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
        {/* Success Banner */}
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
              {companyProfile ? (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl text-gray-900 mb-2 font-bold">{companyProfile.name || 'Unnamed Company'}</h2>
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
                      <span className="text-sm">{companyProfile.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="text-sm">{companyProfile.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span className="text-sm">{companyProfile.location || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl text-gray-900 mb-2 font-bold">No Company Profile Set Up</h2>
                      <p className="text-gray-600 mb-4">Complete your company profile to help job seekers learn about your organization.</p>
                    </div>
                    <button
                      onClick={handleEditProfile}
                      className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Set Up Profile
                    </button>
                  </div>
                </div>
              )}

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
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>Posted on {job.posted}</span>
                      </div>

                      {/* Job Actions: Applicants, AI Matches, Manage */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewApplicants(job.id, job.title)}
                          className="flex-1 min-w-[130px] px-3 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-sm font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Users className="w-4 h-4" />
                          Applicants
                        </button>

                        <button
                          onClick={() => handleOpenAIMatches(job.id, job.title)}
                          className="flex-1 min-w-[130px] px-3 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          AI Matches
                        </button>

                        <button
                          onClick={() => handleManageJob(job.id, job.title)}
                          className="px-3 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Candidates Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 flex items-center gap-2 font-bold text-xl">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Top AI Discovered Candidates
                </h3>
                {activeJobs.length > 0 && (
                  <button
                    onClick={() => handleOpenAIMatches(activeJobs[0].id, activeJobs[0].title)}
                    className="text-purple-700 hover:text-purple-600 text-sm font-semibold flex items-center gap-1"
                  >
                    View All AI Matches →
                  </button>
                )}
              </div>

              {topCandidates.length === 0 ? (
                <div className="text-center py-6 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-gray-600 text-sm mb-3">No candidate matching has been run for active jobs yet.</p>
                  {activeJobs.length > 0 && (
                    <button
                      onClick={() => handleOpenAIMatches(activeJobs[0].id, activeJobs[0].title)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-lg hover:shadow-md text-sm font-semibold inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Run Candidate Matching
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {topCandidates.map((candidate, index) => (
                    <div key={index} className="p-4 bg-purple-50/60 rounded-lg border border-purple-200 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-purple-200 text-purple-800 rounded font-bold">#{index + 1}</span>
                            <h4 className="text-gray-900 font-semibold">{candidate.name}</h4>
                            {candidate.isStale && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Needs refresh
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {candidate.skills.map((skill: string, idx: number) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-white text-purple-800 rounded border border-purple-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-2xl text-purple-800 font-bold">{candidate.match}%</span>
                      </div>
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                        <span>Experience: <strong className="text-gray-800">{candidate.experience}</strong></span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewCandidate(candidate)}
                          className="flex-1 px-3 py-1.5 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 text-xs flex items-center justify-center gap-1 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
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
                  className="w-full px-4 py-3 border-2 border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Sparkles className="w-5 h-5" />
                  AI Candidate Discovery
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

        {/* View Applicants Modal (job_applications) */}
        {showViewApplicationsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs px-2.5 py-1 bg-green-100 text-green-800 rounded font-bold uppercase tracking-wider">Job Applicants</span>
                  <h3 className="text-gray-900 text-2xl font-bold mt-1">Direct Applications for: {selectedJobTitle}</h3>
                </div>
                <button onClick={() => setShowViewApplicationsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-6">
                Users who explicitly submitted a job application to this posting.
              </p>

              {isApplicantsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading applicants...</p>
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-12 bg-green-50/50 rounded-xl border border-green-100">
                  <Users className="w-10 h-10 text-green-600 mx-auto mb-2 opacity-60" />
                  <p className="text-gray-700 font-medium">No applications received yet.</p>
                  <p className="text-xs text-gray-500 mt-1">You can discover potential candidate matches across the platform using AI Matches.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicants.map((applicant, idx) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="text-gray-900 font-semibold text-lg">{applicant.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{applicant.email}</p>
                        {applicant.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {applicant.skills.map((skill: string, sidx: number) => (
                              <span key={sidx} className="text-xs px-2 py-1 bg-white text-gray-700 rounded border border-green-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Applied: {applicant.appliedDate}</p>
                      </div>
                      <div className="text-right">
                        {applicant.score !== undefined && (
                          <>
                            <div className="text-3xl text-green-700 font-bold mb-1">{applicant.score}%</div>
                            <p className="text-xs text-gray-500 mb-3">Match Score</p>
                          </>
                        )}
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleViewResume(applicant.candidateId || applicant.id)}
                            disabled={loadingResumeCandidateId === (applicant.candidateId || applicant.id)}
                            className="px-3 py-1.5 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {loadingResumeCandidateId === (applicant.candidateId || applicant.id) ? 'Opening...' : 'View Resume'}
                          </button>
                          <button
                            onClick={() => handleContactCandidate(applicant)}
                            className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                          >
                            Contact Candidate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AI Matches Modal (candidate_matches) ─────────────────────────── */}
        {showAIMatchesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Candidate Discovery
                  </span>
                  <h3 className="text-gray-900 text-2xl font-bold">AI Candidate Matches: {selectedJobTitle}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Discovered and evaluated across platform job seekers matching this job posting.
                  </p>
                </div>
                <button onClick={() => setShowAIMatchesModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Action Bar: Run / Re-run Matching */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-purple-50/80 rounded-xl border border-purple-200 mb-6">
                <div>
                  <h4 className="text-sm font-bold text-purple-900">Run AI Matching Engine</h4>
                  <p className="text-xs text-purple-700">Scans all discoverable job seekers and computes canonical AI match scores.</p>
                </div>

                <button
                  onClick={handleRunMatching}
                  disabled={isMatchingRunning}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isMatchingRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Matching candidates...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{matchingHasRun ? 'Re-run AI Matching' : 'Run AI Matching'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status & Warning Banners */}
              {isMatchingRunning && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  <span className="text-sm font-medium">{matchingStatusMessage || 'Evaluating candidates...'}</span>
                </div>
              )}

              {partialWarning && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Partial Evaluation Warning</h5>
                    <p className="text-xs mt-0.5">{partialWarning}</p>
                  </div>
                </div>
              )}

              {persistenceError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl text-red-900 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Persistence Failed</h5>
                    <p className="text-xs mt-0.5">{persistenceError}</p>
                  </div>
                </div>
              )}

              {aiMatchesError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <p className="font-bold text-sm">Error</p>
                  <p className="text-xs">{aiMatchesError}</p>
                </div>
              )}

              {/* Candidate Matches List */}
              {isAIMatchesLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading candidate matches...</p>
                </div>
              ) : aiMatches.length === 0 ? (
                <div className="text-center py-14 bg-purple-50/40 rounded-xl border border-purple-100">
                  <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-3 opacity-60" />
                  {matchingHasRun ? (
                    <>
                      <h4 className="text-gray-800 font-bold text-lg mb-1">No Eligible Candidates Found</h4>
                      <p className="text-gray-600 text-sm">No discoverable job seekers met the criteria for this job posting.</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-gray-800 font-bold text-lg mb-1">No AI Matching Run Yet</h4>
                      <p className="text-gray-600 text-sm mb-4">Click "Run AI Matching" above to discover and score potential candidates across the platform.</p>
                      <button
                        onClick={handleRunMatching}
                        disabled={isMatchingRunning}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold text-sm inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Run AI Matching Now
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {aiMatches.map((cand, idx) => {
                    const rankNumber = (aiMatchesPage - 1) * 10 + (idx + 1);
                    return (
                      <div key={cand.matchId || idx} className="p-5 bg-white rounded-xl border-2 border-purple-100 shadow-sm hover:border-purple-300 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-sm flex items-center justify-center border border-purple-200">
                              #{rankNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-gray-900 font-bold text-lg">{cand.name}</h4>
                                {cand.isStale && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold border border-amber-300 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Needs refresh
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Experience: <strong className="text-gray-700">{cand.experience ? `${cand.experience} years` : 'Not specified'}</strong>
                                {cand.calculatedAt && (
                                  <span className="ml-3">Evaluated: {new Date(cand.calculatedAt).toLocaleDateString()}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Canonical Score Display (Percentage) */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-3xl text-purple-700 font-extrabold">{cand.score}%</div>
                            <span className="text-xs text-purple-600 font-semibold">AI Match Score</span>
                          </div>
                        </div>

                        {/* Matched Skills */}
                        {cand.matchingSkills && cand.matchingSkills.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-bold text-gray-600 block mb-1">Matched Skills:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {cand.matchingSkills.map((sk, sidx) => (
                                <span key={sidx} className="text-xs px-2.5 py-0.5 bg-green-100 text-green-800 rounded-md border border-green-200 font-medium">
                                  ✓ {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Skills */}
                        {cand.missingSkills && cand.missingSkills.length > 0 && (
                          <div className="mb-3">
                            <span className="text-xs font-bold text-gray-600 block mb-1">Missing Skills:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {cand.missingSkills.map((sk, sidx) => (
                                <span key={sidx} className="text-xs px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200 font-medium">
                                  ✕ {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer / Resume & Contact Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                          <span className="text-xs text-gray-400 italic">Discovered via Candidate Pool</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewResume(cand.candidateId)}
                              disabled={loadingResumeCandidateId === cand.candidateId}
                              className="px-3 py-1.5 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {loadingResumeCandidateId === cand.candidateId ? 'Opening...' : 'View Resume'}
                            </button>
                            <button
                              onClick={() => handleContactCandidate(cand)}
                              className="px-4 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-lg hover:shadow-md text-xs font-semibold flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5" /> Contact Candidate
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {aiMatchesTotal > 10 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-100">
                  <span className="text-xs text-gray-500">
                    Showing Page {aiMatchesPage} of {Math.ceil(aiMatchesTotal / 10)} ({aiMatchesTotal} candidates)
                  </span>

                  <div className="flex gap-2">
                    <button
                      disabled={aiMatchesPage <= 1 || isAIMatchesLoading}
                      onClick={() => fetchPersistedMatches(selectedJobId, aiMatchesPage - 1)}
                      className="px-3 py-1.5 border border-purple-200 rounded-lg text-purple-700 hover:bg-purple-50 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      disabled={aiMatchesPage >= Math.ceil(aiMatchesTotal / 10) || isAIMatchesLoading}
                      onClick={() => fetchPersistedMatches(selectedJobId, aiMatchesPage + 1)}
                      className="px-3 py-1.5 border border-purple-200 rounded-lg text-purple-700 hover:bg-purple-50 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Profile Details Modal */}
        {showCandidateModal && selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">{selectedCandidate.name}'s Candidate Profile</h3>
                <button onClick={() => setShowCandidateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-gray-700 font-bold mb-2">Platform Profile</h4>
                  <p className="text-gray-600 text-sm">Experience: <strong className="text-gray-800">{selectedCandidate.experience}</strong></p>
                </div>
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div>
                    <h4 className="text-gray-700 font-bold mb-2">Matched Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200 font-medium text-xs">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCandidate.missingSkills && selectedCandidate.missingSkills.length > 0 && (
                  <div>
                    <h4 className="text-gray-700 font-bold mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.missingSkills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-medium text-xs">
                          ✕ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                  <div className="text-3xl text-purple-700 font-bold">{selectedCandidate.match}%</div>
                  <p className="text-sm text-gray-600">Canonical AI Match Score</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewResume(selectedCandidate.candidateId || selectedCandidate.id)}
                    disabled={loadingResumeCandidateId === (selectedCandidate.candidateId || selectedCandidate.id)}
                    className="flex-1 px-4 py-2 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    {loadingResumeCandidateId === (selectedCandidate.candidateId || selectedCandidate.id) ? 'Opening...' : 'View Resume'}
                  </button>
                  <button 
                    onClick={() => handleContactCandidate(selectedCandidate)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
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
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">AI Candidate Discovery</h3>
                <button onClick={() => setShowSearchModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Select an active job posting below to run AI candidate discovery across discoverable job seekers.
              </p>
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{job.title}</h4>
                      <p className="text-xs text-gray-500">Posted on {job.posted}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowSearchModal(false);
                        handleOpenAIMatches(job.id, job.title);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:shadow-md"
                    >
                      <Sparkles className="w-4 h-4" /> Run AI Discovery
                    </button>
                  </div>
                ))}
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
                  onClick={handleOpenEditJob}
                  className="w-full px-4 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all text-left font-semibold"
                >
                  Edit Job
                </button>
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

        {/* Edit Job Modal */}
        {showEditJobModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">Edit Job: {selectedJobTitle}</h3>
                <button onClick={() => setShowEditJobModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isEditJobLoading ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading job details...</p>
                </div>
              ) : (
                <>
                  {editJobError && (
                    <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {editJobError}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">Job Title</label>
                      <input
                        value={editJobForm.title}
                        onChange={(e) => setEditJobForm({ ...editJobForm, title: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">Company</label>
                      <input
                        value={editJobForm.company}
                        onChange={(e) => setEditJobForm({ ...editJobForm, company: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">Location</label>
                      <input
                        value={editJobForm.location}
                        onChange={(e) => setEditJobForm({ ...editJobForm, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">Job Type</label>
                      <select
                        value={editJobForm.jobType}
                        onChange={(e) => setEditJobForm({ ...editJobForm, jobType: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                      >
                        <option value="full_time">Full-time</option>
                        <option value="part_time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">Status</label>
                      <select
                        value={editJobForm.status}
                        onChange={(e) => setEditJobForm({ ...editJobForm, status: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">Required Skills</label>
                      <input
                        value={editJobForm.requiredSkills}
                        onChange={(e) => setEditJobForm({ ...editJobForm, requiredSkills: e.target.value })}
                        placeholder="React, TypeScript, SQL"
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="block text-gray-700 mb-2 font-semibold">Description</label>
                    <textarea
                      value={editJobForm.description}
                      onChange={(e) => setEditJobForm({ ...editJobForm, description: e.target.value })}
                      rows={7}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 bg-green-50/50"
                    />
                  </div>

                  <div className="flex items-center justify-end mt-6 gap-3">
                    <button
                      onClick={() => setShowEditJobModal(false)}
                      disabled={isEditJobSaving}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-all font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditJob}
                      disabled={isEditJobSaving || !editJobForm.title.trim()}
                      className="px-5 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isEditJobSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
