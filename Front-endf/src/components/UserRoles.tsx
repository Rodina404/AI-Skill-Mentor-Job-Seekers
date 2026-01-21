import { Users, Building2, Shield } from 'lucide-react';

const roles = [
  {
    icon: Users,
    title: 'For Job Seekers',
    description: 'Enhance your career prospects with AI-driven insights',
    features: [
      'Upload and analyze your resume instantly',
      'Receive skill readiness scores',
      'Get personalized course recommendations',
      'Track your learning progress',
      'Access interactive career dashboards',
      'Understand your competitive advantage',
    ],
    gradient: 'from-green-700 to-green-500',
  },
  {
    icon: Building2,
    title: 'For Recruiters',
    description: 'Find the perfect candidates faster and more efficiently',
    features: [
      'Post job listings with AI requirements',
      'Get AI-ranked candidate matches',
      'View detailed skill compatibility scores',
      'Access candidate skill breakdowns',
      'Manage jobs and candidates seamlessly',
      'Contact qualified candidates directly',
    ],
    gradient: 'from-lime-700 to-lime-500',
  },
  {
    icon: Shield,
    title: 'For Administrators',
    description: 'Ensure system excellence and ethical AI practices',
    features: [
      'Manage users and permissions',
      'Monitor system performance metrics',
      'Maintain and update AI models',
      'Audit AI decision-making processes',
      'Ensure ethical AI compliance',
      'Oversee data integration quality',
    ],
    gradient: 'from-emerald-700 to-emerald-500',
  },
];

export function UserRoles() {
  return (
    <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Built for Every Role
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tailored experiences for job seekers, recruiters, and administrators
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <div className={`bg-gradient-to-r ${role.gradient} p-8 text-white`}>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <role.icon className="w-8 h-8" />
                </div>
                <h3 className="mb-2 text-white">{role.title}</h3>
                <p className="text-white/90 text-sm">{role.description}</p>
              </div>
              
              <div className="p-8">
                <ul className="space-y-3">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.gradient} mt-2 flex-shrink-0`}></div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}