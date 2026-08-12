import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authAPI } from "../api/auth.api";
import { clearStoredSession, refreshStoredSession } from "../api/apiClient";

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
  isAuthLoading: boolean;
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setSuccessMessage(null);
    clearStoredSession();
  };

  const restoreVerifiedUser = (data: any, accessToken: string, nextRefreshToken?: string | null) => {
    const verifiedUser: User = {
      id: data.user.id,
      name: data.user.full_name || data.user.email,
      email: data.user.email,
      role: mapRole(data.user.role)
    };

    setUser(verifiedUser);
    setToken(accessToken);
    setRefreshToken(nextRefreshToken || localStorage.getItem('refresh_token'));
    localStorage.setItem('token', accessToken);
    localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
    if (nextRefreshToken) {
      localStorage.setItem('refresh_token', nextRefreshToken);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRefresh = localStorage.getItem('refresh_token');
    if (!savedToken && !savedRefresh) {
      setIsAuthLoading(false);
      return;
    }

    const tryRestoreSession = async () => {
      try {
        if (savedToken) {
          const data = await authAPI.verifyToken(savedToken);
          restoreVerifiedUser(data, savedToken, savedRefresh);
          return;
        }
        throw new Error('No access token available');
      } catch {
        try {
          const refreshed = await refreshStoredSession();
          if (!refreshed?.access_token) throw new Error('Refresh failed');
          const data = await authAPI.verifyToken(refreshed.access_token);
          restoreVerifiedUser(data, refreshed.access_token, refreshed.refresh_token);
        } catch {
          clearAuthState();
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    tryRestoreSession();
  }, []);

  useEffect(() => {
    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.access_token) {
        setToken(customEvent.detail.access_token);
      }
      if (customEvent.detail?.refresh_token) {
        setRefreshToken(customEvent.detail.refresh_token);
      }
    };

    const handleSessionInvalid = () => {
      clearAuthState();
      window.history.pushState({}, '', '/signin');
      window.dispatchEvent(new CustomEvent('auth-redirect', { detail: 'login' }));
    };

    window.addEventListener('auth-token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth-session-invalid', handleSessionInvalid);
    return () => {
      window.removeEventListener('auth-token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth-session-invalid', handleSessionInvalid);
    };
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

    restoreVerifiedUser({ user: authenticatedUser }, userData.access_token, userData.refresh_token || null);
  };

  const logout = () => {
    if (token) {
      authAPI.signOut(token).catch(err => console.error('Sign out error:', err));
    }
    clearAuthState();
    window.history.pushState({}, '', '/signin');
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
      isAuthLoading,
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
