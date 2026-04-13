import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface UnauthorizedProps {
  onNavigate: (page: string) => void;
}

export function Unauthorized({ onNavigate }: UnauthorizedProps) {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl mb-6">
            <ShieldAlert className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-2 text-lg">
            You don't have permission to access this page.
          </p>
          <p className="text-gray-500 mb-8">
            This area is restricted to users with specific roles. Please contact an administrator if you believe this is an error.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Home className="w-5 h-5" />
              Go to Home Page
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 border-2 border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
