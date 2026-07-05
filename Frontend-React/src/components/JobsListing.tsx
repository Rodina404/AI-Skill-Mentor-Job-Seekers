import { Search, MapPin, Briefcase, Clock, DollarSign, TrendingUp, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { jobsAPI } from '../api/jobs.api';
import { usersAPI } from '../api/users.api';
import { useAuth } from '../context/AuthContext';

interface JobsListingProps {
  onNavigate: (page: string) => void;
}

export function JobsListing({ onNavigate }: JobsListingProps) {
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState<'recommended' | 'platform'>('recommended');
  
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounced filter states for recommended server-side search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(locationSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  const fetchJobs = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'recommended') {
        const filters: any = {};
        if (debouncedSearch) filters.search = debouncedSearch;
        if (debouncedLocation) filters.location = debouncedLocation;
        if (filterType !== 'all') filters.type = filterType;

        const res = await jobsAPI.getRecommendedJobs(filters, token);
        const recJobs = res?.data?.jobs || [];
        
        const mapped = recJobs.map((j: any) => {
          const matchScore = Math.round((j.score || 0) * 100);
          
          return {
            id: j.id,
            title: j.title,
            company: j.company || 'Company',
            location: j.location || 'Remote',
            type: j.type || 'Full-time',
            salary: j.salary || 'Competitive',
            posted: j.posted ? new Date(j.posted).toLocaleDateString() : 'Recent',
            applicants: Math.floor(Math.random() * 30) + 5,
            match: matchScore,
            skills: j.breakdown?.matching_skills || [],
            description: j.description || '',
            url: j.url || '',
            explanation: j.explanation || ''
          };
        });
        
        setJobs(mapped);
      } else {
        // Platform jobs flow: unchanged, fetch all jobs and user matches
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        let matches: any[] = [];
        const matchesRes = await fetch(`${API_BASE_URL}/matches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (matchesRes.ok) {
          matches = await matchesRes.json();
        }

        const jobsRes = await jobsAPI.getAllJobs({}, token);
        const allJobs = jobsRes?.data?.jobs || [];

        const mapped = allJobs.map((j: any) => {
          const matchRecord = matches.find((m: any) => m.job_postings?.id === j.id);
          const matchScore = matchRecord ? matchRecord.match_score || Math.round((matchRecord.overall_score || 0) * 100) : 75;
          
          let requiredSkills: string[] = [];
          if (Array.isArray(j.required_skills)) {
            requiredSkills = j.required_skills;
          } else if (typeof j.required_skills === 'string') {
            try {
              requiredSkills = JSON.parse(j.required_skills);
            } catch {
              requiredSkills = j.required_skills ? [j.required_skills] : [];
            }
          }

          const skillsToDisplay = requiredSkills.length > 0 ? requiredSkills : [j.title];

          return {
            id: j.id,
            title: j.title,
            company: j.company || 'Company',
            location: j.location || 'Remote',
            type: j.job_type === 'full_time' ? 'Full-time' : j.job_type === 'part_time' ? 'Part-time' : j.job_type || 'Full-time',
            salary: j.salary || '$100k - $140k',
            posted: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Recent',
            applicants: Math.floor(Math.random() * 30) + 5,
            match: matchScore,
            skills: skillsToDisplay,
            description: j.job_description || j.description
          };
        });

        mapped.sort((a: any, b: any) => b.match - a.match);
        setJobs(mapped);
        
        const userId = user?.id;
        if (userId) {
          try {
            const savedJobsRes = await usersAPI.getSavedJobs(userId, token);
            if (Array.isArray(savedJobsRes)) {
              setSavedJobs(savedJobsRes.map((sj: any) => sj.job_posting_id || sj.job_postings?.id || sj.job_id || sj.id));
            }
          } catch (err) {
            console.error("Failed to load saved jobs:", err);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchJobs();
    }
  }, [debouncedSearch, debouncedLocation, filterType, activeTab, token]);

  const handleSaveJob = async (jobId: string) => {
    if (!token || !user?.id) {
      alert('Session expired, please log in again');
      onNavigate('login');
      return;
    }
    setSavingJobId(jobId);
    try {
      const userId = user.id;
      await usersAPI.saveJob(userId, jobId, token);
      setSavedJobs(prev => [...prev, jobId]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save job');
    } finally {
      setSavingJobId(null);
    }
  };

  const filteredJobs = activeTab === 'platform' ? jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || job.type.toLowerCase().replace('-', '').includes(filterType.replace('-', ''));
    return matchesSearch && matchesFilter;
  }) : jobs;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Available Jobs
          </h2>
          <p className="text-gray-600">Discover opportunities matched to your skills</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-6 mb-6 border-b border-green-150 pb-2">
          <button
            onClick={() => {
              setActiveTab('recommended');
              setJobs([]);
              setError(null);
              setSearchTerm('');
              setLocationSearch('');
            }}
            className={`pb-2 px-2 font-semibold text-lg border-b-4 transition-all ${
              activeTab === 'recommended'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-green-600'
            }`}
          >
            Recommended for You
          </button>
          <button
            onClick={() => {
              setActiveTab('platform');
              setJobs([]);
              setError(null);
              setSearchTerm('');
              setLocationSearch('');
            }}
            className={`pb-2 px-2 font-semibold text-lg border-b-4 transition-all ${
              activeTab === 'platform'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-green-600'
            }`}
          >
            Platform Jobs
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'recommended' ? "Search by keyword or job title..." : "Search jobs, companies, or skills..."}
                className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
              />
            </div>
            {activeTab === 'recommended' && (
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Filter by location (e.g. London, US)..."
                  className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-semibold">Error loading jobs</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        {!isLoading && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
              <Briefcase className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl text-gray-900">{filteredJobs.length}</div>
              <p className="text-gray-600 text-sm">Available Jobs</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl text-gray-900">
                {filteredJobs.length > 0 
                  ? `${Math.round(filteredJobs.reduce((acc, curr) => acc + curr.match, 0) / filteredJobs.length)}%`
                  : 'N/A'}
              </div>
              <p className="text-gray-600 text-sm">Avg. Match Score</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
              <Clock className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl text-gray-900">{filteredJobs.length}</div>
              <p className="text-gray-600 text-sm">New This Week</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
              <MapPin className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl text-gray-900">
                {filteredJobs.filter(j => j.location.toLowerCase().includes('remote')).length}
              </div>
              <p className="text-gray-600 text-sm">Remote Jobs</p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border-2 border-green-100">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading jobs...</p>
          </div>
        ) : (
          /* Jobs Grid */
          <div className="space-y-6">
            {filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job.id);
              const isSaving = savingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>
                        <div className="ml-4">
                          <div className="text-center">
                            <div className="text-2xl text-green-700">{job.match}%</div>
                            <p className="text-xs text-gray-500">Match</p>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Fit Explanation for Recommended Jobs */}
                      {activeTab === 'recommended' && job.explanation && (
                        <div className="mb-4 p-3 bg-green-50/50 border border-green-100 rounded-lg text-sm text-green-800 flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Fit Analysis:</strong> {job.explanation}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>{job.salary}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Posted {job.posted}</span>
                        <span>•</span>
                        <span>{job.applicants} applicants</span>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-3">
                      {activeTab === 'recommended' ? (
                        <a 
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 lg:w-48 px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-center font-medium flex items-center justify-center"
                        >
                          View Original Posting
                        </a>
                      ) : (
                        <>
                          <button 
                            onClick={() => {
                              localStorage.setItem('latestJobId', job.id);
                              onNavigate('job-details');
                            }}
                            className="flex-1 lg:w-40 px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-center font-medium"
                          >
                            View Details
                          </button>
                          <button
                            className="flex-1 lg:w-40 px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-1"
                            onClick={() => handleSaveJob(job.id)}
                            disabled={isSaving || isSaved}
                          >
                            {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border-2 border-green-100">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || locationSearch || filterType !== 'all' 
                  ? 'No jobs match your search criteria. Try adjusting your filters.' 
                  : 'There are currently no job listings available.'}
              </p>
              {(searchTerm || locationSearch || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setLocationSearch('');
                    setFilterType('all');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}