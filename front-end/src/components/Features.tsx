import { FileText, Target, TrendingUp, Award, BookOpen, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Smart Resume Analysis',
    description: 'Upload your resume and let our AI extract and analyze your skills using advanced Natural Language Processing.',
  },
  {
    icon: Target,
    title: 'Skill Gap Detection',
    description: 'Identify exactly what skills you need to reach your career goals based on real-time job market data.',
  },
  {
    icon: BookOpen,
    title: 'Personalized Learning',
    description: 'Receive tailored course recommendations from top learning platforms to bridge your skill gaps.',
  },
  {
    icon: TrendingUp,
    title: 'Readiness Score',
    description: 'Get a comprehensive employability score that shows how ready you are for your target roles.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your skill development journey with interactive dashboards and detailed analytics.',
  },
  {
    icon: Award,
    title: 'Candidate Matching',
    description: 'Recruiters can find the perfect candidates with AI-powered matching and ranking algorithms.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Powerful Features for Career Growth
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive AI-powered tools designed to help you succeed in your career journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all bg-white"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}