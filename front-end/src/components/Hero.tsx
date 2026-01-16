import { Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-lime-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">AI-Powered Career Development</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              Transform Your Career with AI-Powered Skill Mentorship
            </h1>
            
            <p className="text-gray-600 text-lg">
              Leverage cutting-edge artificial intelligence to analyze your skills, identify gaps, 
              and receive personalized recommendations that boost your employability. Perfect for 
              job seekers, recruiters, and HR professionals.
            </p>

            <div className="flex gap-8 pt-4">
              <div>
                <div className="bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  10k+
                </div>
                <p className="text-gray-600 text-sm">Active Users</p>
              </div>
              <div>
                <div className="bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  95%
                </div>
                <p className="text-gray-600 text-sm">Success Rate</p>
              </div>
              <div>
                <div className="bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  500+
                </div>
                <p className="text-gray-600 text-sm">Partner Companies</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">JavaScript</span>
                    <span className="text-sm text-green-600">Expert</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-11/12 bg-gradient-to-r from-green-700 to-green-600 rounded-full"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Python</span>
                    <span className="text-sm text-green-600">Advanced</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-green-700 to-green-600 rounded-full"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Machine Learning</span>
                    <span className="text-sm text-orange-600">Intermediate</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-gradient-to-r from-green-700 to-green-600 rounded-full"></div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-lime-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700">
                    <span className="text-green-700">AI Recommendation:</span> Consider taking 
                    "Advanced ML Engineering" to boost your profile by 23%
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-green-400 to-lime-400 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-lime-400 to-green-400 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}