import { BookOpen, Clock, BarChart, Star, ExternalLink, Filter } from 'lucide-react';
import { useState } from 'react';

interface CourseRecommendationsProps {
  onNavigate: (page: string) => void;
}

export function CourseRecommendations({ onNavigate }: CourseRecommendationsProps) {
  const [filter, setFilter] = useState('all');

  const courses = [
    {
      title: 'Advanced Machine Learning Specialization',
      platform: 'Coursera',
      duration: '4 months',
      level: 'Advanced',
      impact: '+23%',
      rating: 4.8,
      students: '125K',
      category: 'AI/ML',
      description: 'Master advanced ML algorithms, deep learning, and neural networks.',
    },
    {
      title: 'AWS Solutions Architect Certification',
      platform: 'AWS Training',
      duration: '6 weeks',
      level: 'Intermediate',
      impact: '+15%',
      rating: 4.9,
      students: '89K',
      category: 'Cloud',
      description: 'Learn to design and deploy scalable systems on AWS.',
    },
    {
      title: 'System Design Interview Masterclass',
      platform: 'Udemy',
      duration: '8 weeks',
      level: 'Advanced',
      impact: '+18%',
      rating: 4.7,
      students: '67K',
      category: 'System Design',
      description: 'Prepare for system design interviews at top tech companies.',
    },
    {
      title: 'Kubernetes for Developers',
      platform: 'Linux Foundation',
      duration: '5 weeks',
      level: 'Intermediate',
      impact: '+20%',
      rating: 4.6,
      students: '52K',
      category: 'DevOps',
      description: 'Deploy and manage containerized applications with Kubernetes.',
    },
    {
      title: 'Full Stack Web Development Bootcamp',
      platform: 'Udemy',
      duration: '12 weeks',
      level: 'Beginner',
      impact: '+25%',
      rating: 4.8,
      students: '210K',
      category: 'Web Development',
      description: 'Build modern web applications from scratch using React and Node.js.',
    },
    {
      title: 'Data Science with Python',
      platform: 'DataCamp',
      duration: '10 weeks',
      level: 'Intermediate',
      impact: '+22%',
      rating: 4.7,
      students: '98K',
      category: 'Data Science',
      description: 'Analyze data and build predictive models using Python libraries.',
    },
  ];

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.level.toLowerCase() === filter);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Recommended Courses
          </h2>
          <p className="text-gray-600">Personalized learning paths to boost your career readiness</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Filter by level:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'border-2 border-green-200 text-gray-700 hover:border-green-400'
                }`}
              >
                All Levels
              </button>
              <button
                onClick={() => setFilter('beginner')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'beginner'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'border-2 border-green-200 text-gray-700 hover:border-green-400'
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => setFilter('intermediate')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'intermediate'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'border-2 border-green-200 text-gray-700 hover:border-green-400'
                }`}
              >
                Intermediate
              </button>
              <button
                onClick={() => setFilter('advanced')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'advanced'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'border-2 border-green-200 text-gray-700 hover:border-green-400'
                }`}
              >
                Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCourses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                </div>
                <div className="ml-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-200">
                    {course.impact} Readiness
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-700">{course.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({course.students} students)</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">{course.platform}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-green-600" />
                  <span className={`text-xs px-2 py-1 rounded border ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                  View Details
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl mb-4 text-white">Not Finding What You Need?</h3>
            <p className="text-white/90 mb-6">
              Our AI can analyze your specific skill gaps and recommend personalized courses tailored to your career goals.
            </p>
            <button
              onClick={() => onNavigate('analysis')}
              className="px-8 py-3 bg-white text-green-700 rounded-lg hover:shadow-xl transition-all"
            >
              Get Personalized Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
