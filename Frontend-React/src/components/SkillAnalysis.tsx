import { useState, useRef } from 'react';
import { Upload, Target, BookOpen, TrendingUp, FileText, CheckCircle2, ArrowRight, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import { resumeAPI } from '../api/resume.api';

interface CourseRecommendation {
  title: string;
  provider?: string;
  platform?: string;
  url?: string;
  link?: string;
  duration?: string;
  level?: string;
  relevance_score?: number;
  similarity_score?: number;
  rating?: number;
  description?: string;
}

interface RoadmapStage {
  week?: number;
  week_number?: number;
  theme?: string;
  topic?: string;
  skills?: string[];
  resources?: any[];
}

interface AnalysisResult {
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: (string | { skill?: string; name?: string; skillId?: string })[];
  courseRecommendations: CourseRecommendation[];
  roadmap: { stages?: RoadmapStage[]; weeks?: RoadmapStage[] } | RoadmapStage[] | null;
  normalized_skills: any[];
  jobTitle: string;
}

interface SkillAnalysisProps {
  onNavigate: (page: string) => void;
}

export function SkillAnalysis({ onNavigate }: SkillAnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Result state — populated from the status endpoint
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setError('Only PDF and DOCX files are accepted.');
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobTitle.trim()) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setError(null);
    setResult(null);
    setPollCount(0);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setIsAnalyzing(false);
      setTimeout(() => onNavigate('login'), 2000);
      return;
    }

    try {
      // Step 1: Upload
      const uploadRes = await resumeAPI.analyzeResume(file, jobTitle.trim(), token);
      const resumeId = uploadRes.resume_id;
      if (!resumeId) throw new Error('Resume upload failed — no ID returned.');

      // Save for other pages to reference
      localStorage.setItem('latestAnalysisId', resumeId);
      localStorage.setItem('latestResumeId', resumeId);

      // Step 2: Poll every 4s, max 30 polls (120s)
      let polls = 0;
      const MAX_POLLS = 30;
      const POLL_INTERVAL = 4000;

      pollRef.current = setInterval(async () => {
        polls++;
        setPollCount(polls);

        try {
          const statusData = await resumeAPI.pollResumeStatus(resumeId, token);

          if (statusData.status === 'analyzed') {
            clearPoll();
            setResult(statusData);
            setIsAnalyzing(false);
            setAnalysisComplete(true);
          } else if (statusData.status === 'failed') {
            clearPoll();
            setError('Analysis failed. Please try again.');
            setIsAnalyzing(false);
          } else if (polls >= MAX_POLLS) {
            clearPoll();
            setError('Analysis is taking longer than expected. Please check History later.');
            setIsAnalyzing(false);
          }
        } catch (pollErr: any) {
          clearPoll();
          setError(pollErr.message || 'Error checking analysis status.');
          setIsAnalyzing(false);
          if (pollErr.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('refresh_token');
            setTimeout(() => onNavigate('login'), 2000);
          }
        }
      }, POLL_INTERVAL);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
      setIsAnalyzing(false);
      if (err.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('refresh_token');
        setTimeout(() => onNavigate('login'), 2000);
      }
    }
  };

  // Normalize readiness score: if decimal (0–1), multiply by 100
  const displayScore = (() => {
    if (!result) return 0;
    const raw = result.readinessScore;
    if (raw == null || raw === undefined) return 0;
    return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
  })();

  // Normalize missing skills to string array
  const missingSkillNames: string[] = (result?.missingSkills || []).map((s) => {
    if (typeof s === 'string') return s;
    return (s as any).skill || (s as any).name || (s as any).skillId || '';
  }).filter(Boolean);

  // Normalize matched skills to string array
  const matchedSkillNames: string[] = (result?.matchedSkills || []).map((s) => {
    if (typeof s === 'string') return s;
    return (s as any).skill || (s as any).name || (s as any).skillId || '';
  }).filter(Boolean);

  // Normalize roadmap stages
  const roadmapStages: RoadmapStage[] = (() => {
    if (!result?.roadmap) return [];
    const rm: any = result.roadmap;
    // Handle doubly-nested: {roadmap: {weeks: [...]}}
    const inner = rm.roadmap || rm;
    if (Array.isArray(inner)) return inner;
    if (inner.weeks && Array.isArray(inner.weeks)) return inner.weeks;
    if (inner.stages && Array.isArray(inner.stages)) return inner.stages;
    return [];
  })();

  // Normalize courses
  const courses: CourseRecommendation[] = result?.courseRecommendations || [];

  return (
    <section id="analysis" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Analyze Your Career Readiness
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your resume and enter your target job to receive AI-powered insights
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Analysis Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900">Upload Your Resume</h3>
            </div>

            <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors bg-green-50/50">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-green-600 mx-auto mb-4" />
                {file ? (
                  <div>
                    <p className="text-green-700 mb-2 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB — Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-2">Drop your resume here or click to browse</p>
                    <p className="text-sm text-gray-500">Accepts PDF and DOCX only</p>
                  </div>
                )}
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Resume selected: {file.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Job Title Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900">Target Job Title</h3>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-gray-700">Enter your desired job role</label>
              <input
                type="text"
                placeholder="e.g. Data Scientist, NLP Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {jobTitle.trim() && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Target role: {jobTitle}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || !jobTitle.trim() || isAnalyzing}
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing your resume…
                </>
              ) : (
                <>
                  Analyze Resume
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Processing indicator */}
        {isAnalyzing && (
          <div className="max-w-4xl mx-auto mb-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-green-100 text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-gray-900 mb-2">Analyzing your resume…</h3>
            <p className="text-gray-500 text-sm">
              Running AI pipeline: extraction → normalization → gap analysis → roadmap → courses
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Poll {pollCount} / 30 — this may take up to 2 minutes
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {analysisComplete && result && (
          <div className="space-y-8 animate-fadeIn">

            {/* Readiness Score */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900">Career Readiness Score</h3>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="#e5e7eb" strokeWidth="16" fill="none" />
                    <circle
                      cx="96" cy="96" r="80"
                      stroke="url(#gradient)"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      strokeDashoffset={`${2 * Math.PI * 80 * (1 - displayScore / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#15803d" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                        {displayScore}%
                      </div>
                      <p className="text-gray-600 text-sm mt-1">Ready</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-gray-900 mb-2">Overall Assessment</h4>
                    <p className="text-gray-600">
                      You're <span className="text-green-700 font-semibold">
                        {displayScore >= 80 ? 'highly ready' : displayScore >= 50 ? 'moderately ready' : 'getting started'}
                      </span> for the <strong>{result.jobTitle || jobTitle}</strong> role.
                      {displayScore < 80 && ' With focused learning in key areas, you can significantly improve your chances.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl text-green-700">{matchedSkillNames.length}</div>
                      <p className="text-sm text-gray-600">Matched Skills</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl text-yellow-700">{missingSkillNames.length}</div>
                      <p className="text-sm text-gray-600">Skill Gaps</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl text-blue-700">{courses.length}</div>
                      <p className="text-sm text-gray-600">Courses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matched Skills */}
            {matchedSkillNames.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-gray-900">Matched Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchedSkillNames.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {missingSkillNames.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-gray-900">Missing Skills (Gaps)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingSkillNames.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Courses */}
            {courses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-gray-900">Recommended Courses</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {courses.map((course, index) => {
                    const courseUrl = course.url || course.link;
                    return (
                      <div
                        key={index}
                        className="p-6 border-2 border-green-100 rounded-xl hover:border-green-300 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-gray-900 flex-1 group-hover:text-green-700 transition-colors font-medium">
                            {course.title}
                          </h4>
                          {(course.similarity_score != null || course.relevance_score != null) && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs whitespace-nowrap ml-2">
                              {Math.round((course.similarity_score ?? course.relevance_score ?? 0) * 100)}% match
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                            <span>Provider: {course.provider || course.platform || 'N/A'}</span>
                          </div>
                          {course.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                              <span>Duration: {course.duration}</span>
                            </div>
                          )}
                          {course.level && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                              <span>Level: {course.level}</span>
                            </div>
                          )}
                        </div>

                        {courseUrl ? (
                          <a
                            href={courseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-md transition-all text-sm flex items-center justify-center gap-2"
                          >
                            View Course <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <button
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-md transition-all text-sm"
                            onClick={() => onNavigate('courses')}
                          >
                            Browse Courses
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Roadmap */}
            {roadmapStages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-gray-900">Learning Roadmap</h3>
                </div>

                <div className="space-y-4">
                  {roadmapStages.map((stage: any, index: number) => {
                    const weekNum = stage.week_num ?? stage.week ?? stage.week_number ?? (index + 1);
                    const theme = stage.theme || stage.topic || `Stage ${index + 1}`;
                    // skills may be an array or a space-separated string — if string, display as single label
                    const skillsList: string[] = Array.isArray(stage.skills)
                      ? stage.skills
                      : (typeof stage.skills === 'string' && stage.skills.trim() ? [stage.skills] : []);
                    return (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-200">
                          <span className="text-xs text-blue-500 uppercase">Week</span>
                          <span className="text-xl text-blue-700 font-semibold">{weekNum}</span>
                        </div>
                        <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <h4 className="text-gray-900 font-medium mb-1">{theme}</h4>
                          {skillsList.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {skillsList.map((s: string, si: number) => (
                                <span key={si} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-lime-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 mb-2">Your Personalized Path</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Completing this roadmap and recommended courses could significantly boost your readiness score.
                      </p>
                      <button
                        className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
                        onClick={() => onNavigate('learning-path')}
                      >
                        View Full Learning Path
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
