import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Brain, AlertCircle } from 'lucide-react';
import { validateEmail } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const { login, successMessage, setSuccessMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear success message on unmount
  useEffect(() => {
    return () => {
      setSuccessMessage(null);
    };
  }, [setSuccessMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const emailError = validateEmail(email);
    const passwordError = password ? null : 'Password is required';
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }
    
    // Clear errors and success messages on new submit attempt
    setErrors({});
    setSuccessMessage(null);
    setIsLoading(true);
    
    try {
      const data = await authAPI.signin({ email, password });
      login(data);
      setIsLoading(false);
      
      // Navigate based on role
      const backendRole = data.user?.role || 'job_seeker';
      if (backendRole === 'admin') {
        onNavigate('admin');
      } else if (backendRole === 'recruiter') {
        onNavigate('recruiter-profile');
      } else {
        onNavigate('profile');
      }
    } catch (error: any) {
      setIsLoading(false);
      const errMsg = error instanceof Error ? error.message : String(error);
      let userFriendlyMsg = errMsg;
      
      if (errMsg.includes("Invalid login credentials") || errMsg.includes("invalid_credentials") || errMsg.includes("Invalid credentials")) {
        userFriendlyMsg = "Incorrect email or password. Please try again.";
      } else if (errMsg.includes("Email not confirmed") || errMsg.includes("email_not_confirmed") || errMsg.includes("Email confirmation required")) {
        userFriendlyMsg = "Please verify your email before signing in.";
      }
      
      setErrors({ general: userFriendlyMsg });
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-lime-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-700 to-green-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 font-medium">
              <AlertCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 ${
                    errors.email ? 'border-red-300' : 'border-green-200'
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50 ${
                    errors.password ? 'border-red-300' : 'border-green-200'
                  }`}
                  required
                />
              </div>
              {errors.password && (
                <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="text-green-700 hover:text-green-600 font-semibold"
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}