import { Search, MapPin, Briefcase, Clock, DollarSign, TrendingUp, Filter } from 'lucide-react';
import { useState } from 'react';

interface JobsListingProps {
  onNavigate: (page: string) => void;
}

export function JobsListing({ onNavigate }: JobsListingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const jobs = [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $180k',
      posted: '2 days ago',
      applicants: 45,
      match: 92,
      skills: ['JavaScript', 'React', 'Node.js', 'AWS'],
    },
    {
      title: 'Data Scientist',
      company: 'DataInc',
      location: 'Remote',
      type: 'Full-time',
      salary: '$100k - $150k',
      posted: '3 days ago',
      applicants: 32,
      match: 88,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    },
    {
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$110k - $160k',
      posted: '4 days ago',
      applicants: 28,
      match: 85,
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Leadership'],
    },
    {
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$90k - $130k',
      posted: '5 days ago',
      applicants: 22,
      match: 82,
      skills: ['Figma', 'User Research', 'Prototyping', 'UI Design'],
    },
    {
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$115k - $165k',
      posted: '1 week ago',
      applicants: 38,
      match: 79,
      skills: ['Kubernetes', 'Docker', 'CI/CD', 'AWS'],
    },
    {
      title: 'Full Stack Developer',
      company: 'WebSolutions',
      location: 'Remote',
      type: 'Contract',
      salary: '$80k - $120k',
      posted: '1 week ago',
      applicants: 51,
      match: 76,
      skills: ['JavaScript', 'Python', 'React', 'PostgreSQL'],
    },
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || job.type.toLowerCase().includes(filterType);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Available Jobs
          </h2>
          <p className="text-gray-600">Discover opportunities matched to your skills</p>
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
                placeholder="Search jobs, companies, or skills..."
                className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
              />
            </div>
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

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <Briefcase className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl text-gray-900">{filteredJobs.length}</div>
            <p className="text-gray-600 text-sm">Available Jobs</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl text-gray-900">85%</div>
            <p className="text-gray-600 text-sm">Avg. Match Score</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <Clock className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl text-gray-900">24</div>
            <p className="text-gray-600 text-sm">New This Week</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <MapPin className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl text-gray-900">15</div>
            <p className="text-gray-600 text-sm">Remote Jobs</p>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="space-y-6">
          {filteredJobs.map((job, index) => (
            <div
              key={index}
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
                    {job.skills.map((skill, idx) => (
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
                  <button className="flex-1 lg:w-40 px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all">
                    View Details
                  </button>
                  <button className="flex-1 lg:w-40 px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all">
                    Save Job
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No jobs found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
