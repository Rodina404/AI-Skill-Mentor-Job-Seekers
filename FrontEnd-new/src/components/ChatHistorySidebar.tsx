import { MessageSquare, X, FileText, Briefcase, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ChatHistoryItem {
  id: string;
  type: 'analysis' | 'job' | 'course';
  title: string;
  date: string;
  preview: string;
  score?: number;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: ChatHistoryItem) => void;
}

export function ChatHistorySidebar({ isOpen, onClose, onSelectItem }: ChatHistorySidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'analysis' | 'job' | 'course'>('all');

  const historyItems: ChatHistoryItem[] = [
    {
      id: '1',
      type: 'analysis',
      title: 'Software Engineer Resume Analysis',
      date: '2025-01-15',
      preview: 'Readiness Score: 67% - Identified 4 skill gaps including Machine Learning and Cloud Architecture',
      score: 67,
    },
    {
      id: '2',
      type: 'job',
      title: 'Applied: Senior Software Engineer at TechCorp',
      date: '2025-01-14',
      preview: 'Match Score: 92% - Strong alignment with JavaScript, React, and Node.js requirements',
      score: 92,
    },
    {
      id: '3',
      type: 'course',
      title: 'Recommended: Advanced ML Specialization',
      date: '2025-01-13',
      preview: 'This course will boost your readiness by 23% for your target role',
    },
    {
      id: '4',
      type: 'analysis',
      title: 'Data Scientist Resume Analysis',
      date: '2025-01-12',
      preview: 'Readiness Score: 72% - Strong Python skills, recommended TensorFlow training',
      score: 72,
    },
    {
      id: '5',
      type: 'job',
      title: 'Saved: Product Manager at StartupXYZ',
      date: '2025-01-11',
      preview: 'Match Score: 85% - Good fit for leadership and product strategy skills',
      score: 85,
    },
    {
      id: '6',
      type: 'analysis',
      title: 'Full Stack Developer Analysis',
      date: '2025-01-10',
      preview: 'Readiness Score: 78% - Recommended courses in DevOps and System Design',
      score: 78,
    },
    {
      id: '7',
      type: 'job',
      title: 'Applied: UX Designer at DesignStudio',
      date: '2025-01-09',
      preview: 'Match Score: 82% - Strong Figma and User Research skills highlighted',
      score: 82,
    },
    {
      id: '8',
      type: 'course',
      title: 'Started: AWS Solutions Architect',
      date: '2025-01-08',
      preview: 'Expected to increase cloud computing skills by 15%',
    },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? historyItems 
    : historyItems.filter(item => item.type === selectedCategory);

  const getIcon = (type: string) => {
    switch (type) {
      case 'analysis':
        return FileText;
      case 'job':
        return Briefcase;
      case 'course':
        return TrendingUp;
      default:
        return MessageSquare;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'analysis':
        return 'bg-blue-100 text-blue-700';
      case 'job':
        return 'bg-green-100 text-green-700';
      case 'course':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 overflow-hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-lime-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-700" />
            <h3 className="text-gray-900">Activity History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-green-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('analysis')}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'analysis'
                  ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setSelectedCategory('job')}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'job'
                  ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => setSelectedCategory('course')}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'course'
                  ? 'bg-gradient-to-r from-green-700 to-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Courses
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No {selectedCategory === 'all' ? 'activity' : selectedCategory} history yet</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-full text-left p-4 bg-gradient-to-br from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 rounded-xl border border-green-200 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColorClass(item.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">
                          {item.title}
                        </h4>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {item.preview}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date}</span>
                        </div>
                        {item.score && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200">
                            {item.score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-green-50 to-lime-50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg text-green-700">
                {historyItems.filter(i => i.type === 'analysis').length}
              </div>
              <p className="text-xs text-gray-600">Analyses</p>
            </div>
            <div>
              <div className="text-lg text-green-700">
                {historyItems.filter(i => i.type === 'job').length}
              </div>
              <p className="text-xs text-gray-600">Jobs</p>
            </div>
            <div>
              <div className="text-lg text-green-700">
                {historyItems.filter(i => i.type === 'course').length}
              </div>
              <p className="text-xs text-gray-600">Courses</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
