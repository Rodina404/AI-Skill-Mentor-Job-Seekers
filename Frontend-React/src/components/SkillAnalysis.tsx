import { useState } from 'react';
import { Upload, Target, BookOpen, TrendingUp, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { resumeAPI } from '../api/resume.api';

interface Course {
  title: string;
  platform: string;
  duration: string;
  level: string;
  impact: string;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
}

interface SkillAnalysisProps {
  onNavigate: (page: string) => void;
}

export function SkillAnalysis({ onNavigate }: SkillAnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [readinessScore, setReadinessScore] = useState(0);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [matchingSkillsCount, setMatchingSkillsCount] = useState(0);
  const [skillGapsCount, setSkillGapsCount] = useState(0);
  const [weeksToTarget, setWeeksToTarget] = useState(12);

  const jobTitles = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
    'Full Stack Developer',
    'Machine Learning Engineer',
    'Business Analyst',
    'Project Manager',
    'Cybersecurity Analyst',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobTitle) return;
    
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Session expired, please log in again");
        setTimeout(() => onNavigate('login'), 2000);
        return;
      }

      // 1. Upload and analyze resume
      const uploadRes = await resumeAPI.analyzeResume(file, jobTitle, token);
      const resId = uploadRes.resume_id;
      if (!resId) throw new Error("Resume upload failed - no ID returned");

      // 2. Poll status every 3 seconds until "analyzed"
      let status = "processing";
      let retries = 0;
      const maxRetries = 20; // 60 seconds max
      let analysisData: any = null;

      while (status !== "analyzed" && retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        analysisData = await resumeAPI.getAnalysisById(resId, token);
        status = analysisData.status;
        retries++;
        if (status === "failed") {
          throw new Error("Resume analysis failed on the server.");
        }
      }

      if (status !== "analyzed") {
        throw new Error("Resume analysis timed out.");
      }

      // Save latest analysis ID
      localStorage.setItem('latestAnalysisId', resId);
      localStorage.setItem('latestResumeId', resId);

      const extractedSkills = analysisData?.normalized_skills || [];
      setReadinessScore(0);
      setSkillGaps([]);
      setRecommendedCourses([]);
      setMatchingSkillsCount(extractedSkills.length);
      setSkillGapsCount(0);
      setWeeksToTarget(0);

      setIsAnalyzing(false);
      setAnalysisComplete(true);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="analysis" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Analyze Your Career Readiness
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your resume and select your target job to receive AI-powered insights
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-semibold">Analysis Error</p>
            <p className="text-sm">{error}</p>
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
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-green-600 mx-auto mb-4" />
                {file ? (
                  <div>
                    <p className="text-green-700 mb-2">{file.name}</p>
                    <p className="text-sm text-gray-600">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-2">Drop your resume here or click to browse</p>
                    <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX</p>
                  </div>
                )}
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Resume uploaded successfully</span>
                </div>
              </div>
            )}
          </div>

          {/* Job Title Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900">Select Target Job</h3>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-gray-700">Choose your desired job role</label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
              >
                <option value="">Select a job title...</option>
                {jobTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            {jobTitle && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Target role: {jobTitle}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || !jobTitle || isAnalyzing}
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
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

        {/* Results Section */}
        {(isAnalyzing || analysisComplete) && (
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
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="url(#gradient)"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      strokeDashoffset={`${2 * Math.PI * 80 * (1 - readinessScore / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
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
                        {readinessScore}%
                      </div>
                      <p className="text-gray-600 text-sm mt-1">Ready</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-gray-900 mb-2">Overall Assessment</h4>
                    <p className="text-gray-600">
                      You're <span className="text-green-700">{readinessScore >= 80 ? 'highly ready' : readinessScore >= 50 ? 'moderately ready' : 'getting started'}</span> for the {jobTitle} role. 
                      With focused learning in key areas, you can significantly improve your chances.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl text-green-700">{matchingSkillsCount}</div>
                      <p className="text-sm text-gray-600">Matching Skills</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl text-yellow-700">{skillGapsCount}</div>
                      <p className="text-sm text-gray-600">Skill Gaps</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl text-blue-700">{weeksToTarget}</div>
                      <p className="text-sm text-gray-600">Weeks to Target</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Gaps */}
            {skillGaps.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-gray-900">Identified Skill Gaps</h3>
                </div>

                <div className="space-y-6">
                  {skillGaps.map((gap, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">{gap.skill}</span>
                        <span className="text-sm text-gray-600">
                          Current: {gap.currentLevel}% | Required: {gap.requiredLevel}%
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-green-200 rounded-full transition-all duration-1000"
                          style={{ width: `${gap.currentLevel}%` }}
                        ></div>
                        <div
                          className="absolute h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all duration-1000"
                          style={{ width: `${gap.currentLevel}%` }}
                        ></div>
                        <div
                          className="absolute h-full border-r-2 border-red-500"
                          style={{ left: `${gap.requiredLevel}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Gap: {gap.gap}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-gray-900">Recommended Courses</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {recommendedCourses.map((course, index) => (
                    <div
                      key={index}
                      className="p-6 border-2 border-green-100 rounded-xl hover:border-green-300 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-gray-900 flex-1 group-hover:text-green-700 transition-colors">
                          {course.title}
                        </h4>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs whitespace-nowrap ml-2">
                          {course.impact}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                          <span>Platform: {course.platform}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                          <span>Duration: {course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                          <span>Level: {course.level}</span>
                        </div>
                      </div>

                      <button className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-md transition-all text-sm" onClick={() => onNavigate('courses')}>
                        View Course Details
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-lime-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 mb-2">Potential Impact</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Completing all recommended courses could increase your readiness score significantly, boosting your employability.
                      </p>
                      <button className="px-6 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2" onClick={() => onNavigate('learning-path')}>
                        Create Learning Path
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
