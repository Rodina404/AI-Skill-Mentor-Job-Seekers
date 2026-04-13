import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

// Mock User Database
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "aya@gmail.com",
    password: "AY7114_AY",
    role: "admin" as const
  },
  {
    id: "2",
    name: "Job Seeker User",
    email: "ayya@gmail.com",
    password: "AY7114_AY",
    role: "jobseeker" as const
  },
  {
    id: "3",
    name: "Recruiter User",
    email: "ayyya@gmail.com",
    password: "AY7114_AY",
    role: "recruiter" as const
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user in mock database
    const foundUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    const authenticatedUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role
    };

    setUser(authenticatedUser);
    localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
  };

  const signup = async (name: string, email: string, password: string, role: "jobseeker" | "recruiter") => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      role: role
    };

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
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
