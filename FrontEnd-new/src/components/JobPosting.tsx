import { Briefcase, MapPin, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';
import { useState } from 'react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate job posting
    onNavigate('recruiter-profile');
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Company */}
              <div>
                <label className="block text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-700 mb-2">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA (Remote)"
                    className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                    required
                  />
                </div>
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
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-gray-700 mb-2">Job Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 resize-none"
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-gray-700 mb-2">Requirements *</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List key requirements and qualifications (one per line)..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 resize-none"
                required
              />
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-gray-700 mb-2">Required Skills *</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., JavaScript, React, Node.js, AWS (comma separated)"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                required
              />
              <p className="text-sm text-gray-500 mt-1">AI will use these skills to match with candidates</p>
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
                className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Post Job
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
