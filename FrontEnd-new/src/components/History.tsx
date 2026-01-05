import { FileText, BookOpen, Award, TrendingUp, Calendar, Clock } from 'lucide-react';

interface HistoryProps {
  onNavigate: (page: string) => void;
}

export function History({ onNavigate }: HistoryProps) {
  const historyItems = [
    {
      type: 'resume',
      title: 'Resume Analysis Completed',
      description: 'Analyzed skills for Software Engineer position',
      date: '2025-01-15',
      time: '10:30 AM',
      details: 'Readiness Score: 67%',
      icon: FileText,
      color: 'blue',
    },
    {
      type: 'course',
      title: 'Course Completed',
      description: 'Advanced Machine Learning Specialization',
      date: '2025-01-12',
      time: '3:45 PM',
      details: 'Duration: 4 months',
      icon: BookOpen,
      color: 'green',
    },
    {
      type: 'skill',
      title: 'Skill Level Updated',
      description: 'Python proficiency increased to 85%',
      date: '2025-01-10',
      time: '2:20 PM',
      details: '+10% improvement',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      type: 'achievement',
      title: 'Achievement Unlocked',
      description: 'Completed 5 courses in AI/ML',
      date: '2025-01-08',
      time: '11:15 AM',
      details: 'Badge earned',
      icon: Award,
      color: 'yellow',
    },
    {
      type: 'course',
      title: 'Course Started',
      description: 'AWS Solutions Architect Certification',
      date: '2025-01-05',
      time: '9:00 AM',
      details: 'Duration: 6 weeks',
      icon: BookOpen,
      color: 'green',
    },
    {
      type: 'resume',
      title: 'Resume Uploaded',
      description: 'Initial profile setup completed',
      date: '2025-01-01',
      time: '4:30 PM',
      details: 'Skills extracted: 12',
      icon: FileText,
      color: 'blue',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Activity History
          </h2>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-green-600" />
              <span className="text-2xl text-gray-900">3</span>
            </div>
            <p className="text-gray-600 text-sm">Resumes Analyzed</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-green-600" />
              <span className="text-2xl text-gray-900">8</span>
            </div>
            <p className="text-gray-600 text-sm">Courses Completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl text-gray-900">+15%</span>
            </div>
            <p className="text-gray-600 text-sm">Skill Improvement</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-green-600" />
              <span className="text-2xl text-gray-900">5</span>
            </div>
            <p className="text-gray-600 text-sm">Achievements</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
          <h3 className="text-gray-900 mb-6">Activity Timeline</h3>

          <div className="space-y-6">
            {historyItems.map((item, index) => {
              const colorClasses = getColorClasses(item.color);
              return (
                <div key={index} className="flex gap-4 relative">
                  {index !== historyItems.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200"></div>
                  )}

                  <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center flex-shrink-0 relative z-10`}>
                    <item.icon className={`w-6 h-6 ${colorClasses.text}`} />
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-gray-900">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`inline-block px-3 py-1 ${colorClasses.bg} ${colorClasses.text} rounded-full text-sm border ${colorClasses.border}`}>
                      {item.details}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
