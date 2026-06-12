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
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: "jobseeker" | "recruiter") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
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

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');
    if (token && savedUser) {
      authAPI.verifyToken(token)
        .then(data => {
          const verifiedUser: User = {
            id: data.user.id,
            name: data.user.full_name || data.user.email,
            email: data.user.email,
            role: mapRole(data.user.role)
          };
          setUser(verifiedUser);
          localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authAPI.signIn({ email, password });
    
    if (!data.user) {
      throw new Error("Login response missing user details");
    }

    const authenticatedUser: User = {
      id: data.user.id,
      name: data.user.full_name || data.user.email,
      email: data.user.email,
      role: mapRole(data.user.role)
    };

    setUser(authenticatedUser);
    localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
    localStorage.setItem('token', data.access_token);
  };

  const signup = async (name: string, email: string, password: string, role: "jobseeker" | "recruiter") => {
    // Map frontend role to backend database role format
    const dbRole = role === "jobseeker" ? "job_seeker" : "recruiter";
    const data = await authAPI.signUp({ full_name: name, email, password, role: dbRole });

    if (!data.user) {
      throw new Error("Signup response missing user details");
    }

    const newUser: User = {
      id: data.user.id,
      name: data.user.full_name || data.user.email,
      email: data.user.email,
      role: mapRole(data.user.role)
    };

    // Auto-login on signup
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
  };

  const logout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.signOut(token).catch(err => console.error('Sign out error:', err));
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated: !!user,
      hasRole
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
