import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authAPI } from "../api/auth.api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "jobseeker" | "recruiter" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  successMessage: string | null;
  setSuccessMessage: (msg: string | null) => void;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  updateUser: (updatedFields: Partial<User>) => void;
}

const mapRole = (role: string): "jobseeker" | "recruiter" | "admin" => {
  const clean = role ? role.toLowerCase() : "";
  if (clean === "job_seeker" || clean === "jobseeker") return "jobseeker";
  if (clean === "recruiter") return "recruiter";
  if (clean === "admin") return "admin";
  return "jobseeker";
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Restore session from localStorage on app load (bridge for 21+ components that still read localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    const tryRestoreSession = async () => {
      try {
        const data = await authAPI.verifyToken(savedToken);
        const verifiedUser: User = {
          id: data.user.id,
          name: data.user.full_name || data.user.email,
          email: data.user.email,
          role: mapRole(data.user.role)
        };
        setUser(verifiedUser);
        setToken(savedToken);
        const savedRefresh = localStorage.getItem('refresh_token');
        if (savedRefresh) setRefreshToken(savedRefresh);
      } catch (err) {
        // Token invalid/expired — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('currentUser');
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      }
    };
    tryRestoreSession();
  }, []);

  const login = (userData: any) => {
    if (!userData || !userData.user) {
      throw new Error("Login response missing user details");
    }

    const authenticatedUser: User = {
      id: userData.user.id,
      name: userData.user.full_name || userData.user.email,
      email: userData.user.email,
      role: mapRole(userData.user.role)
    };

    setUser(authenticatedUser);
    setToken(userData.access_token);
    setRefreshToken(userData.refresh_token || null);

    // Sync to localStorage so existing components (UserProfile, JobsListing, etc.) can read the token
    localStorage.setItem('token', userData.access_token);
    localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
    if (userData.refresh_token) {
      localStorage.setItem('refresh_token', userData.refresh_token);
    }
  };

  const logout = () => {
    if (token) {
      authAPI.signOut(token).catch(err => console.error('Sign out error:', err));
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setSuccessMessage(null);

    // Clear localStorage bridge
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');

    // Redirect to /signin using pushState for browser URL matching
    window.history.pushState({}, '', '/signin');
    
    // Dispatch a custom event to notify App component's custom router to show signin page
    window.dispatchEvent(new CustomEvent('auth-redirect', { detail: 'login' }));
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updatedFields };
    });
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      successMessage,
      setSuccessMessage,
      login, 
      logout, 
      isAuthenticated: !!user,
      hasRole,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
