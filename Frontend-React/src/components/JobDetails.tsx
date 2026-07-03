import { useEffect, useState } from 'react';
import { MapPin, Clock, Briefcase, Building, CheckCircle, ArrowLeft, Send, Target, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { jobsAPI } from '../api/jobs.api';
import { usersAPI } from '../api/users.api';
import { matchesAPI } from '../api/matches.api';
import { resumeAPI } from '../api/resume.api';
import { useAuth } from '../context/AuthContext';

interface JobDetailsProps {
  onNavigate: (page: string) => void;
  jobId?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
  requiredSkills: string[];
}

interface ApiError extends Error {
  status?: number;
}

const parseSkills = (skills: unknown): string[] => {
  if (Array.isArray(skills)) {
    return skills.map(String);
  }

  if (typeof skills !== 'string' || !skills.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch {
    // Some existing jobs store skills as comma-separated text.
  }

  return skills.split(',').map((skill) => skill.trim()).filter(Boolean);
};

const formatJobType = (jobType: string | undefined) => {
  if (!jobType) return 'Not specified';
  return jobType.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export function JobDetails({ onNavigate, jobId }: JobDetailsProps) {
  const { user, token } = useAuth();
  const selectedJobId = jobId || localStorage.getItem('latestJobId') || '';
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Match / "Check My Fit" state
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [matchError, setMatchError] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      if (!selectedJobId) {
        setLoadError('No job was selected. Return to Jobs and choose a job to view.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await jobsAPI.getJobById(selectedJobId, token || undefined);
        const data = response.data || response;
        setJob({
          id: data.id,
          title: data.title || 'Untitled job',
          company: data.company || 'Company not specified',
          location: data.location || 'Location not specified',
          jobType: formatJobType(data.job_type),
          description: data.job_description || 'No job description provided.',
          requiredSkills: parseSkills(data.required_skills),
        });

        // Check if job is already saved or applied by loading user data if logged in
        if (token && user?.id) {
          try {
            const savedJobsRes = await usersAPI.getSavedJobs(user.id, token);
            if (Array.isArray(savedJobsRes)) {
              const isJobSaved = savedJobsRes.some((sj: any) => (sj.job_posting_id || sj.job_postings?.id) === selectedJobId);
              setIsSaved(isJobSaved);
            }
          } catch (e) {
            console.error('Failed to load saved status in details:', e);
          }
        }
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to fetch job details');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [selectedJobId, token, user?.id]);

  const handleApply = async () => {
    if (!token) {
      setActionError('Please sign in before applying to this job');
      return;
    }

    setIsApplying(true);
    setActionMessage('');
    setActionError('');

    try {
      const response = await jobsAPI.applyToJob(selectedJobId, token);
      setHasApplied(true);
      setActionMessage(response.message || 'Application submitted successfully');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 409) {
        setHasApplied(true);
        setActionMessage('You have already applied to this job');
      } else {
        setActionError(apiError.message || 'Failed to apply to job');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = async () => {
    if (!token || !user?.id) {
      setActionError('Please sign in before saving this job');
      return;
    }

    setIsSaving(true);
    setActionMessage('');
    setActionError('');

    try {
      const response = await usersAPI.saveJob(user.id, selectedJobId, token);
      setIsSaved(true);
      setActionMessage(response.message || 'Job saved successfully');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 409) {
        setIsSaved(true);
        setActionMessage(apiError.message || 'Job already saved');
      } else {
        setActionError(apiError.message || 'Failed to save job');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckFit = async () => {
    if (!token) {
      setMatchError('Please sign in to check your fit');
      return;
    }

    setIsMatching(true);
    setMatchError('');
    setMatchResult(null);

    try {
      // 1. Get the user's latest analyzed resume
      const resumeList = await resumeAPI.getAnalysisHistory(null, token);
      const resumes = Array.isArray(resumeList) ? resumeList : (resumeList?.resumes || []);
      const latestAnalyzed = resumes.find((r: any) => r.status === 'analyzed');

      if (!latestAnalyzed) {
        throw new Error('No analyzed resume found. Please upload and analyze your resume first.');
      }

      // 2. Run the matching pipeline
      const result = await matchesAPI.runMatching(latestAnalyzed.id, selectedJobId, token);
      setMatchResult(result);
    } catch (error) {
      const apiError = error as ApiError;
      setMatchError(apiError.message || 'Failed to run matching');
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 bg-gradient-to-br from-green-50 to-lime-50 text-center text-gray-700">
        Loading job details...
      </div>
    );
  }

  if (!job || loadError) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-gradient-to-br from-green-50 to-lime-50">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => onNavigate('jobs')} className="mb-6 flex items-center gap-2 text-green-700">
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{loadError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => onNavigate('jobs')}
          className="mb-6 flex items-center gap-2 text-green-700 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-700 to-green-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600 text-lg">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span>{job.jobType}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {job.requiredSkills.length > 0 ? job.requiredSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                {skill}
              </span>
            )) : <span className="text-sm text-gray-500">No required skills listed</span>}
          </div>

          {actionMessage && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>{actionMessage}</span>
            </div>
          )}
          {actionError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{actionError}</div>}

          <div className="flex gap-4">
            <button
              onClick={handleApply}
              disabled={isApplying || hasApplied}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? 'Applying...' : hasApplied ? (
                <><CheckCircle className="w-5 h-5" />Applied</>
              ) : (
                <><Send className="w-5 h-5" />Apply Now</>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                isSaved ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'border-2 border-green-600 text-green-700 hover:bg-green-50'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}
            </button>
            <button
              onClick={handleCheckFit}
              disabled={isMatching || !!matchResult}
              className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {isMatching ? 'Analyzing...' : matchResult ? 'Analysis Complete' : 'Check My Fit'}
            </button>
          </div>
        </div>

        {/* Match Results Section */}
        {matchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {matchError}
          </div>
        )}

        {isMatching && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Running AI matching pipeline...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a moment — analyzing skills, gaps, and recommendations.</p>
          </div>
        )}

        {matchResult && (
          <div className="mb-6 space-y-6">
            {/* Score Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
              <h2 className="text-gray-900 text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Your Match Results
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-4xl font-bold text-blue-700 mb-1">{matchResult.match_score || 0}%</div>
                  <p className="text-sm text-gray-600">Match Score</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-4xl font-bold text-green-700 mb-1">{matchResult.readiness_score || 0}%</div>
                  <p className="text-sm text-gray-600">Readiness Score</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-4xl font-bold text-purple-700 mb-1">
                    {(matchResult.matched_skills || []).length}/{(matchResult.matched_skills || []).length + (matchResult.missing_skills || []).length}
                  </div>
                  <p className="text-sm text-gray-600">Skills Matched</p>
                </div>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              {(matchResult.matched_skills || []).length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Matched Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(matchResult.matched_skills || []).map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                        {typeof skill === 'string' ? skill : (skill as any).name || (skill as any).skill || String(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(matchResult.missing_skills || []).length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-100">
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-600" />
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(matchResult.missing_skills || []).map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm border border-amber-200">
                        {typeof skill === 'string' ? skill : (skill as any).name || (skill as any).skill || String(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommended Similar Jobs */}
            {(matchResult.recommended_jobs || []).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
                <h2 className="text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Similar Jobs You Might Like
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(matchResult.recommended_jobs || []).map((rj: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                      onClick={() => {
                        if (rj.id || rj.job_id) {
                          localStorage.setItem('latestJobId', rj.id || rj.job_id);
                          onNavigate('job-details');
                        }
                      }}
                    >
                      <h4 className="text-gray-900 font-medium mb-1">{rj.title || rj.job_title || 'Job'}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rj.company || rj.employer || ''}</p>
                      {(rj.location) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {rj.location}
                        </p>
                      )}
                      {(rj.score || rj.similarity_score) && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          Similarity: {Math.round((rj.score || rj.similarity_score) * 100)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pipeline Errors (non-fatal) */}
            {(matchResult.errors || []).length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Some services returned warnings:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {(matchResult.errors || []).map((e: any, i: number) => (
                    <li key={i}>{e.step}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-green-600" />
                Job Description
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h2 className="text-gray-900 mb-4">Required Skills</h2>
              {job.requiredSkills.length > 0 ? (
                <ul className="space-y-3">
                  {job.requiredSkills.map((skill) => (
                    <li key={skill} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500">No required skills listed.</p>}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-2xl p-6 text-white h-fit">
            <h3 className="text-white mb-4">About {job.company}</h3>
            <p className="text-white/90 text-sm">
              Review the job description and required skills, then apply or save this opportunity for later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
