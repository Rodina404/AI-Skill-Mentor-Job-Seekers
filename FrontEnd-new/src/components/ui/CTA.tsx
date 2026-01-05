import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface CTAProps {
  onNavigate: (page: string) => void;
}

export function CTA({ onNavigate }: CTAProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-green-700 via-green-600 to-lime-600 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-12 lg:p-16 text-white text-center">
            <h2 className="text-4xl mb-6 text-white">
              Ready to Transform Your Career?
            </h2>
            <p className="mb-8 text-white/90 text-lg max-w-2xl mx-auto">
              Join thousands of professionals who are advancing their careers with AI-powered insights - completely free!
            </p>

            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
              <div className="flex items-center gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">100% free - no payment required</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">Instant AI-powered skill analysis</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">Personalized course recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">Access to top job opportunities</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('signup')}
                className="px-8 py-4 bg-white text-green-700 rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('analysis')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all"
              >
                Try Demo
              </button>
            </div>

            <p className="text-white/80 text-sm mt-6">
              No credit card • No subscription • Always free
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}