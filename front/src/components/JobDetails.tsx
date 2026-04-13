import { useState } from 'react';
import { MapPin, Clock, DollarSign, Briefcase, Building, Users, TrendingUp, CheckCircle, ArrowLeft, Send } from 'lucide-react';

interface JobDetailsProps {
  onNavigate: (page: string) => void;
  jobId?: string;
}

export function JobDetails({ onNavigate, jobId }: JobDetailsProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock job data - in a real app, this would be fetched based on jobId
  const job = {
    id: jobId || '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $180k',
    posted: '2 days ago',
    applicants: 45,
    match: 92,
    skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'TypeScript', 'Docker'],
    description: `We are seeking a talented Senior Software Engineer to join our growing engineering team. 
    
You will be responsible for designing, developing, and maintaining high-quality software solutions that power our platform used by millions of users worldwide.

This is an excellent opportunity to work with cutting-edge technologies and make a significant impact on our product and company growth.`,
    responsibilities: [
      'Design and develop scalable web applications using modern technologies',
      'Collaborate with cross-functional teams to define and implement new features',
      'Write clean, maintainable, and well-documented code',
      'Participate in code reviews and mentor junior developers',
      'Contribute to architectural decisions and technical strategy',
      'Optimize application performance and ensure high availability',
    ],
    requirements: [
      '5+ years of experience in software development',
      'Strong proficiency in JavaScript, React, and Node.js',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Solid understanding of software design patterns and best practices',
      'Excellent problem-solving and communication skills',
      'Bachelor\'s degree in Computer Science or related field',
    ],
    niceToHave: [
      'Experience with TypeScript and modern build tools',
      'Knowledge of containerization (Docker, Kubernetes)',
      'Contributions to open-source projects',
      'Experience with microservices architecture',
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Flexible work arrangements and remote options',
      '401(k) with company matching',
      'Professional development budget',
      'Generous PTO and parental leave',
    ],
  };

  const handleApply = async () => {
    setIsApplying(true);
    
    // Simulate API call
    // In a real app: await applyToJob(job.id);
    setTimeout(() => {
      setIsApplying(false);
      setHasApplied(true);
    }, 1500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    // In a real app: await saveJob(job.id);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(!isSaved);
    }, 500);
  };

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
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
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
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>{job.applicants} applicants</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:text-right">
              <div className="inline-flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-lime-50 rounded-xl border-2 border-green-200">
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <div className="text-4xl text-green-700 mb-1">{job.match}%</div>
                <p className="text-sm text-gray-600">Match Score</p>
              </div>
            </div>
          </div>

          {hasApplied && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>Application submitted successfully! The company will review your profile.</span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleApply}
              disabled={isApplying || hasApplied}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Applying...
                </>
              ) : hasApplied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Applied
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Apply Now
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSaved
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'border-2 border-green-600 text-green-700 hover:bg-green-50'
              }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  {isSaved ? 'Saved' : 'Save Job'}
                </>
              )}
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
              <h2 className="text-gray-900 mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h2 className="text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
              <h2 className="text-gray-900 mb-4">Nice to Have</h2>
              <ul className="space-y-3">
                {job.niceToHave.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
              <h3 className="text-gray-900 mb-4">Benefits</h3>
              <ul className="space-y-3">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-2xl p-6 text-white">
              <h3 className="text-white mb-4">About {job.company}</h3>
              <p className="text-white/90 text-sm mb-4">
                {job.company} is a leading technology company focused on innovation and excellence. 
                We're committed to building products that make a difference.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Company Size:</span>
                  <span className="text-white">500-1000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Industry:</span>
                  <span className="text-white">Technology</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Founded:</span>
                  <span className="text-white">2015</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}