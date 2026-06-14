import { Briefcase, MapPin, DollarSign, Clock, Trash2, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/users.api';

interface SavedJobsProps {
  onNavigate: (page: string) => void;
}

const formatJobType = (jobType: string | undefined) => {
  if (!jobType) return 'Not specified';
  return jobType.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export function SavedJobs({ onNavigate }: SavedJobsProps) {
  const { user, token } = useAuth();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [jobToRemove, setJobToRemove] = useState<string | null>(null);

  const fetchSavedData = async () => {
    if (!user?.id || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch saved jobs
      const savedRes = await usersAPI.getSavedJobs(user.id, token);
      
      // 2. Fetch matches to get real match scores
      let matchesList: any[] = [];
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const matchesRes = await fetch(`${API_BASE_URL}/matches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (matchesRes.ok) {
          matchesList = await matchesRes.json();
        }
      } catch (e) {
        console.error("Failed to load match scores:", e);
      }

      setSavedJobs(savedRes || []);
      setMatches(matchesList);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load saved jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.id) {
      fetchSavedData();
    }
  }, [token, user?.id]);

  const handleRemoveClick = (jobId: string) => {
    setJobToRemove(jobId);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!jobToRemove || !user?.id || !token) return;
    
    setIsRemoving(jobToRemove);
    setShowConfirmDialog(false);

    try {
      await usersAPI.removeSavedJob(user.id, jobToRemove, token);
      setSavedJobs(prev => prev.filter(item => (item.job_postings?.id || item.job_posting_id) !== jobToRemove));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to remove saved job');
    } finally {
      setIsRemoving(null);
      setJobToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmDialog(false);
    setJobToRemove(null);
  };

  const handleViewDetails = (jobId: string) => {
    localStorage.setItem('latestJobId', jobId);
    onNavigate('job-details');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Saved Jobs
          </h2>
          <p className="text-gray-600">Jobs you've saved for later review</p>
        </div>

        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span>Job removed from saved list</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border-2 border-green-100">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-green-100 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">No Saved Jobs</h3>
            <p className="text-gray-600 mb-6">You haven't saved any jobs yet. Browse jobs and save the ones you're interested in.</p>
            <button
              onClick={() => onNavigate('jobs')}
              className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((item) => {
              const job = item.job_postings || {};
              const jobId = job.id || item.job_posting_id;
              const title = job.title || 'Untitled Job';
              const company = job.company || 'Company';
              const location = job.location || 'Remote';
              const type = formatJobType(job.job_type || job.type);
              const salary = job.salary || '$100k - $140k';
              const savedDate = item.saved_at ? new Date(item.saved_at).toLocaleDateString() : 'Recent';
              const matchRecord = matches.find((m: any) => m.job_postings?.id === jobId);
              const matchScore = matchRecord ? matchRecord.match_score || Math.round((matchRecord.overall_score || 0) * 100) : 85;
              const status = job.status || 'Open';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-gray-900 text-xl mb-1">{title}</h3>
                          <p className="text-gray-600">{company}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl text-green-700 mb-1">{matchScore}%</div>
                      <p className="text-sm text-gray-500">Match</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Saved {savedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full border ${
                      status.toLowerCase() === 'open' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleViewDetails(jobId)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleRemoveClick(jobId)}
                      disabled={isRemoving === jobId}
                      className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isRemoving === jobId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {savedJobs.length > 0 && !isLoading && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('jobs')}
              className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all font-medium"
            >
              Browse More Jobs
            </button>
          </div>
        )}

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 text-center max-w-sm w-full mx-4 border-2 border-green-100">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl mb-4 font-semibold text-gray-900">Confirm Removal</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to remove this job from your saved list?</p>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirmRemove}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
                >
                  Remove
                </button>
                <button
                  onClick={handleCancelRemove}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}