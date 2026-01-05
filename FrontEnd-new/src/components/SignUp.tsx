import { useState } from 'react';
import { Mail, Lock, User, Briefcase, ArrowRight, Brain } from 'lucide-react';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export function SignUp({ onNavigate }: SignUpProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'jobseeker',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate signup - in real app, would create account
    onNavigate('login');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-lime-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-700 to-green-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600">Join thousands advancing their careers with AI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">I am a...</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                >
                  <option value="jobseeker">Job Seeker</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-green-700 hover:text-green-600"
              >
                Sign in
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-700 text-center">
              🎉 This platform is <span className="text-green-700">completely free</span> - no subscription or payment required!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
