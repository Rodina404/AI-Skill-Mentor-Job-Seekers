import { Briefcase, MapPin, DollarSign, Clock, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { validateRequired, validateTextLength } from '../utils/validation';

interface JobPostingProps {
  onNavigate: (page: string) => void;
}

export function JobPosting({ onNavigate }: JobPostingProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    experience: 'mid',
    salary: '',
    description: '',
    requirements: '',
    skills: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    const titleError = validateRequired(formData.title, 'Job title');
    if (titleError) newErrors.title = titleError;
    
    const companyError = validateRequired(formData.company, 'Company name');
    if (companyError) newErrors.company = companyError;
    
    const locationError = validateRequired(formData.location, 'Location');
    if (locationError) newErrors.location = locationError;
    
    // Validate text length for description
    const descriptionError = validateTextLength(formData.description, 50, 5000, 'Job description');
    if (descriptionError) newErrors.description = descriptionError;
    else if (!formData.description.trim()) newErrors.description = 'Job description is required';
    
    // Validate text length for requirements
    const requirementsError = validateTextLength(formData.requirements, 20, 3000, 'Requirements');
    if (requirementsError) newErrors.requirements = requirementsError;
    else if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
    
    // Validate skills
    if (!formData.skills.trim()) {
      newErrors.skills = 'At least one skill is required';
    } else if (formData.skills.split(',').filter(s => s.trim()).length === 0) {
      newErrors.skills = 'Please enter at least one valid skill';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Clear errors and submit
    setErrors({});
    setIsLoading(true);
    
    // Simulate job posting
    setTimeout(() => {
      setIsLoading(false);
      alert('Job posted successfully! Candidates will be matched based on their skills and readiness scores.');
      onNavigate('recruiter-profile');
    }, 1500);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Post a New Job
          </h2>
          <p className="text-gray-600">Find the perfect candidates with AI-powered matching</p>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Please correct the following errors:</p>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.values(errors).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-gray-700 mb-2">Job Title *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    clearFieldError('title');
                  }}
                  placeholder="e.g., Senior Software Engineer"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 ${
                    errors.title ? 'border-red-300' : 'border-green-200'
                  }`}
                  required
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Company */}
              <div>
                <label className="block text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => {
                    setFormData({ ...formData, company: e.target.value });
                    clearFieldError('company');
                  }}
                  placeholder="Your company name"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 ${
                    errors.company ? 'border-red-300' : 'border-green-200'
                  }`}
                  required
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-700 mb-2">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      clearFieldError('location');
                    }}
                    placeholder="e.g., San Francisco, CA (Remote)"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 ${
                      errors.location ? 'border-red-300' : 'border-green-200'
                    }`}
                    required
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Job Type */}
              <div>
                <label className="block text-gray-700 mb-2">Job Type *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-gray-700 mb-2">Experience *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead/Principal</option>
                  </select>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-gray-700 mb-2">Salary Range</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g., $100k - $150k"
                    className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Optional - helps attract candidates</p>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-gray-700 mb-2">Job Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  clearFieldError('description');
                }}
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                rows={6}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 resize-none ${
                  errors.description ? 'border-red-300' : 'border-green-200'
                }`}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-600">{errors.description}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {formData.description.length} characters (minimum 50, maximum 5000)
                  </p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-gray-700 mb-2">Requirements *</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => {
                  setFormData({ ...formData, requirements: e.target.value });
                  clearFieldError('requirements');
                }}
                placeholder="List key requirements and qualifications (one per line)..."
                rows={6}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 resize-none ${
                  errors.requirements ? 'border-red-300' : 'border-green-200'
                }`}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.requirements ? (
                  <p className="text-sm text-red-600">{errors.requirements}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {formData.requirements.length} characters (minimum 20, maximum 3000)
                  </p>
                )}
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-gray-700 mb-2">Required Skills *</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => {
                  setFormData({ ...formData, skills: e.target.value });
                  clearFieldError('skills');
                }}
                placeholder="e.g., JavaScript, React, Node.js, AWS (comma separated)"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 ${
                  errors.skills ? 'border-red-300' : 'border-green-200'
                }`}
                required
              />
              {errors.skills ? (
                <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">AI will use these skills to match with candidates</p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-700">
                💡 <span className="text-green-700">Tip:</span> Our AI will automatically match your job with 
                qualified candidates based on their skill profiles and readiness scores.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onNavigate('recruiter-profile')}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Posting Job...
                  </>
                ) : (
                  <>
                    Post Job
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}