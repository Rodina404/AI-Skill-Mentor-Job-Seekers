import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'recruiter' | 'admin' | null;

interface AuthContextType {
  userRole: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ userRole, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
