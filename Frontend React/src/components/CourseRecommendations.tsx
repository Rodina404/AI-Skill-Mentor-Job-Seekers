import { BookOpen, Clock, BarChart, Star, ExternalLink, Filter, CheckCircle, PlayCircle, Award } from 'lucide-react';
import { useState } from 'react';

interface CourseRecommendationsProps {
  onNavigate: (page: string) => void;
}

export function CourseRecommendations({ onNavigate }: CourseRecommendationsProps) {
  const [filter, setFilter] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([0, 2, 4]); // Mock enrolled course indices
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

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
      status: 'In Progress',
      progress: 65,
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
      status: 'Not Enrolled',
      progress: 0,
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
      status: 'Enrolled',
      progress: 0,
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
      status: 'Not Enrolled',
      progress: 0,
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
      status: 'Completed',
      progress: 100,
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
      status: 'Not Enrolled',
      progress: 0,
    },
  ];

  const filteredCourses = filter === 'all' 
    ? courses 
    : filter === 'enrolled'
    ? courses.filter((_, index) => enrolledCourses.includes(index))
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Enrolled':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleEnroll = async (index: number) => {
    if (enrolledCourses.includes(index)) return;
    
    setEnrollingId(index);
    
    // Simulate API call
    setTimeout(() => {
      setEnrolledCourses([...enrolledCourses, index]);
      setEnrollingId(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            My Courses
          </h2>
          <p className="text-gray-600">Track your enrolled courses and explore new learning opportunities</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <BookOpen className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-3xl text-gray-900">{enrolledCourses.length}</div>
            <p className="text-gray-600 text-sm">Enrolled Courses</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <PlayCircle className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-3xl text-gray-900">
              {courses.filter((c, i) => enrolledCourses.includes(i) && c.status === 'In Progress').length}
            </div>
            <p className="text-gray-600 text-sm">In Progress</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <Award className="w-8 h-8 text-yellow-600 mb-2" />
            <div className="text-3xl text-gray-900">
              {courses.filter((c, i) => enrolledCourses.includes(i) && c.status === 'Completed').length}
            </div>
            <p className="text-gray-600 text-sm">Completed</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Filter:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'border-2 border-green-200 text-gray-700 hover:border-green-400'
                }`}
              >
                All Courses
              </button>
              <button
                onClick={() => setFilter('enrolled')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'enrolled'
                    ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                    : 'border-2 border-green-200 text-gray-700 hover:border-green-400'
                }`}
              >
                My Enrolled
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
          {filteredCourses.map((course, index) => {
            const actualIndex = courses.findIndex(c => c.title === course.title);
            const isEnrolled = enrolledCourses.includes(actualIndex);
            const isEnrolling = enrollingId === actualIndex;

            return (
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
                  <div className="ml-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-200 text-center">
                      {course.impact} Boost
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs border text-center ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                </div>

                {isEnrolled && course.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm text-green-700">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-700 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

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
                  {isEnrolled ? (
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      {course.status === 'Completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          View Certificate
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          Continue Learning
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(actualIndex)}
                      disabled={isEnrolling}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnrolling ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Enroll Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl mb-4 text-white">Need Personalized Recommendations?</h3>
            <p className="text-white/90 mb-6">
              Our AI can analyze your skill gaps and recommend courses tailored to your career goals.
            </p>
            <button
              onClick={() => onNavigate('analysis')}
              className="px-8 py-3 bg-white text-green-700 rounded-lg hover:shadow-xl transition-all"
            >
              Analyze My Skills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
