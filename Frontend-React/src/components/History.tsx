import { FileText, Calendar, Clock, ArrowLeft, BookOpen, Target, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resumeAPI } from '../api/resume.api';

interface HistoryProps {
  onNavigate: (page: string) => void;
}

interface ResumeEntry {
  id: string;
  status: string;
  original_name: string;
  created_at: string;
  analyzed_at: string | null;
  readinessScore?: number;
  jobTitle?: string;
}

interface ResumeDetail {
  id: string;
  status: string;
  original_name: string;
  jobTitle: string;
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  courseRecommendations: any[];
  roadmap: any[];
}

export function History({ onNavigate }: HistoryProps) {
  const { token } = useAuth();
  const [resumes, setResumes] = useState<ResumeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail view state
  const [selectedResume, setSelectedResume] = useState<ResumeDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resumeAPI.getAnalysisHistory(null, token);
      const list = Array.isArray(data) ? data : (data?.resumes || []);
      setResumes(list);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (resumeId: string) => {
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const detail = await resumeAPI.pollResumeStatus(resumeId, token);
      setSelectedResume({
        id: detail.id,
        status: detail.status,
        original_name: detail.original_name,
        jobTitle: detail.jobTitle || 'N/A',
        readinessScore: detail.readinessScore || 0,
        matchedSkills: detail.matchedSkills || [],
        missingSkills: detail.missingSkills || [],
        courseRecommendations: detail.courseRecommendations || [],
        roadmap: detail.roadmap || [],
      });
    } catch (err: any) {
      console.error('Failed to fetch details:', err);
      setDetailError(err.message || 'Failed to load analysis details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analyzed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" /> Analyzed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // ─── Detail View ───────────────────────────────────────
  if (selectedResume) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => { setSelectedResume(null); setDetailError(null); }}
            className="mb-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to History
          </button>

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 mb-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl text-gray-900 mb-2">{selectedResume.original_name}</h2>
                <p className="text-gray-600">Analyzed for: <strong>{selectedResume.jobTitle}</strong></p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  {selectedResume.readinessScore}%
                </div>
                <p className="text-gray-500 text-sm">Readiness Score</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Matched Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-4 flex items-center gap-2 font-semibold">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Matched Skills ({selectedResume.matchedSkills.length})
              </h3>
              {selectedResume.matchedSkills.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No matched skills data available.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedResume.matchedSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h3 className="text-gray-900 mb-4 flex items-center gap-2 font-semibold">
                <Target className="w-5 h-5 text-orange-600" />
                Missing Skills ({selectedResume.missingSkills.length})
              </h3>
              {selectedResume.missingSkills.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No skill gaps identified.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedResume.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-200 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Course Recommendations */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 mt-8">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2 font-semibold">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Course Recommendations ({selectedResume.courseRecommendations.length})
            </h3>
            {selectedResume.courseRecommendations.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No course recommendations available.</p>
            ) : (
              <div className="space-y-3">
                {selectedResume.courseRecommendations.map((course, i) => (
                  <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-gray-900 font-semibold">{course.course_title || course.title || 'Course'}</h4>
                        <p className="text-gray-600 text-sm">{course.course_provider || course.provider || ''}</p>
                      </div>
                      {(course.course_url || course.url) && (
                        <a
                          href={course.course_url || course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Course
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Roadmap */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 mt-8">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2 font-semibold">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Learning Roadmap ({selectedResume.roadmap.length} stages)
            </h3>
            {selectedResume.roadmap.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No roadmap data available.</p>
            ) : (
              <div className="space-y-4">
                {selectedResume.roadmap.map((stage, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== selectedResume.roadmap.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-purple-200"></div>
                    )}
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10">
                      <span className="text-purple-700 font-bold text-sm">{stage.week || i + 1}</span>
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="text-gray-900 font-semibold">{stage.theme || stage.title || `Week ${stage.week || i + 1}`}</h4>
                      {stage.focus_areas && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(stage.focus_areas) ? stage.focus_areas : []).map((area: string, j: number) => (
                            <span key={j} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs border border-purple-200">
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── List View ─────────────────────────────────────────
  const analyzedCount = resumes.filter(r => r.status === 'analyzed').length;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Activity History
          </h2>
          <p className="text-gray-600">Track your resume analyses and learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-green-600" />
              <span className="text-2xl text-gray-900">{resumes.length}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Uploads</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl text-gray-900">{analyzedCount}</span>
            </div>
            <p className="text-gray-600 text-sm">Analyses Completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl text-gray-900">
                {resumes.filter(r => r.status === 'processing').length}
              </span>
            </div>
            <p className="text-gray-600 text-sm">In Progress</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Detail Overlay */}
        {isLoadingDetail && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading analysis details...</p>
            </div>
          </div>
        )}

        {detailError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{detailError}</span>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
          <h3 className="text-gray-900 mb-6 font-semibold">Resume Analyses</h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading history...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-gray-700 text-lg font-semibold mb-2">No resume analyses yet</h4>
              <p className="text-gray-500 mb-6">Upload your resume to get started.</p>
              <button
                onClick={() => onNavigate('analysis')}
                className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-xl transition-all"
              >
                Analyze New Resume
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <button
                  key={resume.id}
                  onClick={() => resume.status === 'analyzed' && handleViewDetails(resume.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    resume.status === 'analyzed'
                      ? 'bg-gradient-to-br from-green-50 to-lime-50 border-green-200 hover:shadow-md hover:border-green-300 cursor-pointer'
                      : resume.status === 'processing'
                      ? 'bg-yellow-50/50 border-yellow-200 cursor-default'
                      : 'bg-red-50/30 border-red-200 cursor-default'
                  }`}
                  disabled={resume.status !== 'analyzed'}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-green-700" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-semibold mb-1">{resume.original_name}</h4>
                        {resume.jobTitle && (
                          <p className="text-gray-600 text-sm mb-1">Target: {resume.jobTitle}</p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(resume.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTime(resume.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(resume.status)}
                      {resume.status === 'analyzed' && resume.readinessScore !== undefined && (
                        <span className="text-xl font-bold text-green-700">{resume.readinessScore}%</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => onNavigate('analysis')}
            className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-xl transition-all"
          >
            Analyze New Resume
          </button>
          <button
            onClick={() => onNavigate('courses')}
            className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all"
          >
            Browse Courses
          </button>
        </div>
      </div>
    </div>
  );
}
