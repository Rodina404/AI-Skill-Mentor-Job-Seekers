import { useEffect, useState } from 'react';
import { MapPin, Clock, Briefcase, Building, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { jobsAPI } from '../api/jobs.api';
import { usersAPI } from '../api/users.api';
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
  const { user } = useAuth();
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

  useEffect(() => {
    const loadJob = async () => {
      if (!selectedJobId) {
        setLoadError('No job was selected. Return to Jobs and choose a job to view.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await jobsAPI.getJobById(selectedJobId, localStorage.getItem('token'));
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
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to fetch job details');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [selectedJobId]);

  const handleApply = async () => {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
          </div>
        </div>

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
