import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "recruiter" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: "student" | "recruiter") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login - in a real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser({
      id: "1",
      name: "John Doe",
      email: email,
      role: "student"
    });
  };

  const signup = async (name: string, email: string, password: string, role: "student" | "recruiter") => {
    // Mock signup - in a real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser({
      id: "1",
      name: name,
      email: email,
      role: role
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated: !!user 
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
