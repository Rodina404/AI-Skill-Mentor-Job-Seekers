import { Briefcase, MapPin, DollarSign, Clock, Trash2, Eye, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface SavedJobsProps {
  onNavigate: (page: string) => void;
}

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  savedDate: string;
  matchScore: number;
  status: 'Open' | 'Closed' | 'Archived';
}

export function SavedJobs({ onNavigate }: SavedJobsProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $180k',
      savedDate: '2025-01-15',
      matchScore: 92,
      status: 'Open',
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'Full-time',
      salary: '$130k - $160k',
      savedDate: '2025-01-12',
      matchScore: 85,
      status: 'Open',
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'New York, NY',
      type: 'Contract',
      salary: '$90k - $120k',
      savedDate: '2025-01-10',
      matchScore: 82,
      status: 'Closed',
    },
  ]);

  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [jobToRemove, setJobToRemove] = useState<string | null>(null);

  const handleRemoveClick = (jobId: string) => {
    setJobToRemove(jobId);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!jobToRemove) return;
    
    setIsRemoving(jobToRemove);
    setShowConfirmDialog(false);

    // Simulate API call
    // In production: await usersAPI.removeSavedJob(userId, jobId, token);
    setTimeout(() => {
      setSavedJobs(savedJobs.filter(job => job.id !== jobToRemove));
      setIsRemoving(null);
      setJobToRemove(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const handleCancelRemove = () => {
    setShowConfirmDialog(false);
    setJobToRemove(null);
  };

  const handleViewDetails = (jobId: string) => {
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

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-green-100 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">No Saved Jobs</h3>
            <p className="text-gray-600 mb-6">You haven't saved any jobs yet. Browse jobs and save the ones you're interested in.</p>
            <button
              onClick={() => onNavigate('jobs')}
              className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 text-xl mb-1">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl text-green-700 mb-1">{job.matchScore}%</div>
                    <p className="text-sm text-gray-500">Match</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Saved {job.savedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    job.status === 'Applied' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleViewDetails(job.id)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleRemoveClick(job.id)}
                    disabled={isRemoving === job.id}
                    className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRemoving === job.id ? (
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
            ))}
          </div>
        )}

        {savedJobs.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('jobs')}
              className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all"
            >
              Browse More Jobs
            </button>
          </div>
        )}

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl mb-4">Confirm Removal</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to remove this job from your saved list?</p>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirmRemove}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  Remove
                </button>
                <button
                  onClick={handleCancelRemove}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
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