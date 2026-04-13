import { Brain, Zap, Database, Shield, LineChart, Lightbulb } from 'lucide-react';

const capabilities = [
  {
    icon: Brain,
    title: 'Natural Language Processing',
    description: 'Advanced NLP algorithms extract skills and experience from resumes with high accuracy.',
  },
  {
    icon: Zap,
    title: 'Real-Time Analysis',
    description: 'Instant skill assessment and gap detection powered by machine learning models.',
  },
  {
    icon: Database,
    title: 'Market Data Integration',
    description: 'Continuous updates from job market trends ensure relevant recommendations.',
  },
  {
    icon: Lightbulb,
    title: 'Intelligent Recommendations',
    description: 'Personalized learning paths from integrated course platforms tailored to your goals.',
  },
  {
    icon: LineChart,
    title: 'Predictive Scoring',
    description: 'AI-calculated readiness scores predict your success in target job roles.',
  },
  {
    icon: Shield,
    title: 'Ethical AI',
    description: 'Transparent algorithms with built-in fairness monitoring and bias detection.',
  },
];

export function AICapabilities() {
  return (
    <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Advanced AI Technology
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cutting-edge artificial intelligence that powers intelligent career development
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl bg-gradient-to-br from-white to-green-50 border border-green-100 hover:border-green-300 hover:shadow-lg transition-all group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-lime-400 rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity"></div>
              
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <capability.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mb-2 text-gray-900">{capability.title}</h3>
                <p className="text-gray-600 text-sm">{capability.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="mb-4 text-white">Transparent & Explainable AI</h3>
              <p className="text-white/90 mb-6">
                Our AI doesn't just make recommendations – it explains why. Every skill assessment, 
                gap detection, and course suggestion comes with clear reasoning, ensuring you understand 
                the path to your career goals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2 text-white">99.2%</div>
                <p className="text-white/80 text-sm">Skill Extraction Accuracy</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2 text-white">1M+</div>
                <p className="text-white/80 text-sm">Skills Analyzed</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2 text-white">50k+</div>
                <p className="text-white/80 text-sm">Courses Available</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2 text-white">24/7</div>
                <p className="text-white/80 text-sm">AI Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}