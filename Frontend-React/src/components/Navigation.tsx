import { Brain, Menu, X, MessageSquare, User, LogOut, BookmarkIcon, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../api/notifications.api';

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onToggleSidebar?: () => void;
}

export function Navigation({ onNavigate, currentPage, onToggleSidebar }: NavigationProps) {
  const { user, isAuthenticated, logout, hasRole, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    handleNavigation('home');
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data = await notificationsAPI.getNotifications(token);
      setNotifications(data || []);
      const unread = (data || []).filter((n: any) => !n.is_read);
      setUnreadCount(unread.length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  // Role-based navigation items
  const getNavigationItems = () => {
    if (!isAuthenticated || !user) {
      return [
        { label: 'Home', page: 'home' },
        { label: 'Jobs', page: 'jobs' },
      ];
    }

    switch (user.role) {
      case 'jobseeker':
        return [
          { label: 'Home', page: 'home' },
          { label: 'Jobs', page: 'jobs' },
          { label: 'Courses', page: 'courses' },
          { label: 'Saved Jobs', page: 'saved-jobs' },
          { label: 'Analyze Resume', page: 'analysis' },
        ];

      case 'recruiter':
        return [
          { label: 'Home', page: 'home' },
          { label: 'Dashboard', page: 'recruiter-profile' },
          { label: 'Jobs', page: 'jobs' },
          { label: 'Post Job', page: 'job-posting' },
        ];

      case 'admin':
        return [
          { label: 'Home', page: 'home' },
          { label: 'Admin Dashboard', page: 'admin' },
          { label: 'Jobs', page: 'jobs' },
        ];

      default:
        return [{ label: 'Home', page: 'home' }];
    }
  };

  const navItems = getNavigationItems();

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
            <span className="bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent font-semibold">
              AI Skill Mentor
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavigation(item.page)}
                className={`text-gray-700 hover:text-green-700 transition-colors ${
                  currentPage === item.page ? 'text-green-700 font-semibold' : ''
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* History button for job seekers only */}
            {isAuthenticated && hasRole('jobseeker') && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">History</span>
              </button>
            )}

            {!isAuthenticated ? (
              <>
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
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="p-2 text-gray-700 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <span className="text-sm font-semibold text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                                !n.is_read ? 'bg-green-50/20' : ''
                              }`}
                            >
                              <p className="text-sm font-medium text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{n.body}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(n.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm">{user.name}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-green-600 capitalize mt-1">{user.role}</p>
                      </div>
                    
                    {hasRole('jobseeker') && (
                      <>
                        <button
                          onClick={() => handleNavigation('profile')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </button>
                        <button
                          onClick={() => handleNavigation('saved-jobs')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                        >
                          <BookmarkIcon className="w-4 h-4" />
                          Saved Jobs
                        </button>
                      </>
                    )}

                    {hasRole('recruiter') && (
                      <button
                        onClick={() => handleNavigation('recruiter-profile')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Company Profile
                      </button>
                    )}

                    {hasRole('admin') && (
                      <button
                        onClick={() => handleNavigation('admin')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavigation(item.page)}
                className={`block w-full text-left text-gray-700 hover:text-green-700 py-2 ${
                  currentPage === item.page ? 'text-green-700 font-semibold' : ''
                }`}
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated && hasRole('jobseeker') && onToggleSidebar && (
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

            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigation('login')}
                  className="w-full px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation('signup')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-center"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-2 py-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-green-600 capitalize mt-1">{user.role}</p>
                </div>

                {/* Mobile Notifications list */}
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <div className="px-2 py-1 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Recent Notifications
                  </div>
                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <p className="px-2 text-sm text-gray-500">No notifications</p>
                    ) : (
                      notifications.slice(0, 3).map((n) => (
                        <div key={n.id} className="px-2 py-1.5 rounded bg-gray-50 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                          <p className="text-[11px] text-gray-600">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {hasRole('jobseeker') && (
                  <>
                    <button
                      onClick={() => handleNavigation('profile')}
                      className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => handleNavigation('saved-jobs')}
                      className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
                    >
                      Saved Jobs
                    </button>
                  </>
                )}

                {hasRole('recruiter') && (
                  <button
                    onClick={() => handleNavigation('recruiter-profile')}
                    className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
                  >
                    Company Profile
                  </button>
                )}

                {hasRole('admin') && (
                  <button
                    onClick={() => handleNavigation('admin')}
                    className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
                  >
                    Admin Dashboard
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:text-red-700 py-2 mt-2 border-t border-gray-200 pt-3"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
