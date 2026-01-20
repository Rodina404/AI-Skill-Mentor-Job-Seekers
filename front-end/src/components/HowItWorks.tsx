import { Upload, Cpu, Target, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Simply upload your resume to our secure platform. Our system accepts all major file formats.',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'AI Analysis',
    description: 'Our advanced NLP engine extracts your skills, experience, and qualifications with precision.',
  },
  {
    number: '03',
    icon: Target,
    title: 'Gap Detection & Recommendations',
    description: 'AI identifies skill gaps based on market trends and provides personalized course recommendations.',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Track & Improve',
    description: 'Monitor your progress, complete recommended courses, and watch your readiness score improve.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our simple four-step process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-green-300 to-lime-300 -translate-x-1/2 z-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-lime-400 rounded-full"></div>
                </div>
              )}
              
              <div className="relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-700 to-green-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                  {step.number}
                </div>
                
                <div className="mt-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-lime-100 rounded-lg flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-green-700" />
                  </div>
                </div>
                
                <h3 className="mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}