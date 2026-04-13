import { Brain, Menu, X, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onToggleSidebar?: () => void;
}

export function Navigation({ onNavigate, currentPage, onToggleSidebar }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => handleNavigation('home')}
            className="flex items-center gap-2"
          >
            <div className="bg-gradient-to-br from-green-700 to-green-600 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              AI Skill Mentor
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavigation('home')}
              className="text-gray-700 hover:text-green-700 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('jobs')}
              className="text-gray-700 hover:text-green-700 transition-colors"
            >
              Jobs
            </button>
            <button
              onClick={() => handleNavigation('courses')}
              className="text-gray-700 hover:text-green-700 transition-colors"
            >
              Courses
            </button>
            <button
              onClick={() => handleNavigation('saved-jobs')}
              className="text-gray-700 hover:text-green-700 transition-colors"
            >
              Saved Jobs
            </button>
            <button
              onClick={() => handleNavigation('analysis')}
              className="text-gray-700 hover:text-green-700 transition-colors"
            >
              Analyze Resume
            </button>
            <button
              onClick={() => handleNavigation('profile')}
              className="text-gray-700 hover:text-green-700 transition-colors"
            >
              Profile
            </button>
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">History</span>
              </button>
            )}
            <button
              onClick={() => handleNavigation('login')}
              className="px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigation('signup')}
              className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Get Started
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => handleNavigation('home')}
              className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('jobs')}
              className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
            >
              Jobs
            </button>
            <button
              onClick={() => handleNavigation('courses')}
              className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
            >
              Courses
            </button>
            <button
              onClick={() => handleNavigation('saved-jobs')}
              className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
            >
              Saved Jobs
            </button>
            <button
              onClick={() => handleNavigation('analysis')}
              className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
            >
              Analyze Resume
            </button>
            <button
              onClick={() => handleNavigation('profile')}
              className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
            >
              Profile
            </button>
            {onToggleSidebar && (
              <button
                onClick={() => {
                  onToggleSidebar();
                  setIsOpen(false);
                }}
                className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
              >
                History
              </button>
            )}
            <button
              onClick={() => handleNavigation('login')}
              className="w-full px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigation('signup')}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}