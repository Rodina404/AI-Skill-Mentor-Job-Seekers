import {
  Brain,
  Menu,
  X,
  MessageSquare,
  User,
  LogOut,
  BookmarkIcon,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onToggleSidebar?: () => void;
}

export function Navigation({
  onNavigate,
  currentPage,
  onToggleSidebar,
}: NavigationProps) {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    handleNavigation("home");
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    // ✅ PUBLIC (NOT LOGGED IN): keep it clean (no auth buttons here—those are handled below)
    if (!isAuthenticated || !user) {
      return [{ label: "Home", page: "home" }];
      // If you WANT guests to see Jobs, change to:
      // return [{ label: "Home", page: "home" }, { label: "Jobs", page: "jobs" }];
    }

    switch (user.role) {
      case "jobseeker":
        return [
          { label: "Home", page: "home" },
          { label: "Jobs", page: "jobs" },
          { label: "Courses", page: "courses" },
          { label: "Saved Jobs", page: "saved-jobs" },
          { label: "Analyze Resume", page: "analysis" },
        ];

      case "recruiter":
        return [
          { label: "Home", page: "home" },
          { label: "Dashboard", page: "recruiter-profile" },
          { label: "Jobs", page: "jobs" },
          { label: "Post Job", page: "job-posting" },
        ];

      case "admin":
        return [
          { label: "Home", page: "home" },
          { label: "Admin Dashboard", page: "admin" },
        ];

      default:
        return [{ label: "Home", page: "home" }];
    }
  };

  const navItems = getNavigationItems();

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => handleNavigation("home")}
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
                  currentPage === item.page ? "text-green-700 font-semibold" : ""
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* History button for job seekers only */}
            {isAuthenticated && hasRole("jobseeker") && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">History</span>
              </button>
            )}

            {/* ✅ Auth buttons show ONLY when NOT logged in */}
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigation("login")}
                  className="px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation("signup")}
                  className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-green-600 capitalize mt-1">
                        {user.role}
                      </p>
                    </div>

                    {hasRole("jobseeker") && (
                      <>
                        <button
                          onClick={() => handleNavigation("profile")}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </button>
                        <button
                          onClick={() => handleNavigation("saved-jobs")}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                        >
                          <BookmarkIcon className="w-4 h-4" />
                          Saved Jobs
                        </button>
                      </>
                    )}

                    {hasRole("recruiter") && (
                      <button
                        onClick={() => handleNavigation("recruiter-profile")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Company Profile
                      </button>
                    )}

                    {hasRole("admin") && (
                      <button
                        onClick={() => handleNavigation("admin")}
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
                  currentPage === item.page ? "text-green-700 font-semibold" : ""
                }`}
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated && hasRole("jobseeker") && onToggleSidebar && (
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

            {/* ✅ Auth buttons show ONLY when NOT logged in */}
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigation("login")}
                  className="w-full px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation("signup")}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-center"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-2 py-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-green-600 capitalize mt-1">
                    {user.role}
                  </p>
                </div>

                {hasRole("jobseeker") && (
                  <>
                    <button
                      onClick={() => handleNavigation("profile")}
                      className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => handleNavigation("saved-jobs")}
                      className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
                    >
                      Saved Jobs
                    </button>
                  </>
                )}

                {hasRole("recruiter") && (
                  <button
                    onClick={() => handleNavigation("recruiter-profile")}
                    className="block w-full text-left text-gray-700 hover:text-green-700 py-2"
                  >
                    Company Profile
                  </button>
                )}

                {hasRole("admin") && (
                  <button
                    onClick={() => handleNavigation("admin")}
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
