import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, BookOpen, Shield } from 'lucide-react';

interface PricingPageProps {
  setCurrentView: (view: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ setCurrentView, openAuthModal }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      name: 'Free Student',
      badge: 'Start Free Forever',
      audience: 'For individual high school & college students getting started',
      price: '₦0',
      period: 'forever',
      cta: 'Start Studying Free',
      highlight: false,
      features: [
        'Up to 10 document uploads per month',
        'Standard structured PDF summarisation',
        'Smart Quiz Generator (up to 100 questions per quiz)',
        'Spaced repetition flashcards (SM-2 scheduler)',
        'Basic Ask Study Kit AI Study Assistant',
        'Private cloud storage vault',
      ],
    },
    {
      name: 'Scholar Pro',
      badge: 'Most Popular for University',
      audience: 'For ambitious students targeting honors, med/law, and master’s degrees',
      price: billingCycle === 'annual' ? '₦20,000' : '₦2,000',
      period: billingCycle === 'annual' ? 'per year (Save 16%)' : 'per month',
      cta: 'Upgrade to Scholar Pro',
      highlight: true,
      features: [
        'Unlimited document & textbook uploads (up to 100MB each)',
        'Hierarchical in-depth chapter summaries & formula derivations',
        'Unlimited AI practice quizzes with custom question types',
        'Timed mock exam simulation with automated score rubrics',
        'Unlimited RAG AI tutoring with deep page-citation evidence',
        'AI Revision Timetable & exam countdown scheduler',
        'Export summaries to DOCX, TXT, and PDF print',
        'Priority Gemini Flash model execution',
      ],
    },
    {
      name: 'Campus / Lab',
      badge: 'Academic Department',
      audience: 'For university study groups, tutoring departments & labs',
      price: '₦7,500',
      period: 'per month',
      cta: 'Contact Education Team',
      highlight: false,
      features: [
        'Everything in Scholar Pro for up to 10 team members',
        'Shared departmental library & collaborative decks',
        'Custom syllabus alignment & grading benchmarks',
        'Centralized administration and export logs',
        'Dedicated academic support specialist',
      ],
    },
  ];

  return (
    <div className="py-12 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#F2C230]">
          Transparent Academic Plans
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
          Invest in High-Yield Learning
        </h1>
        <p className="text-sm sm:text-base text-neutral-300">
          Start 100% free with all essential features. Upgrade anytime when you need unlimited document analysis and mock exams.
        </p>

        {/* Billing cycle toggle */}
        <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-[#1C1C1C] border border-[#2B2B2B] text-xs mt-4">
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-[#F2C230] text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Annual Billing (Save 30%)
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#F2C230] text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`p-8 rounded-3xl flex flex-col justify-between transition-all relative ${
              p.highlight
                ? 'bg-[#222222] border-2 border-[#F2C230] shadow-2xl scale-[1.02]'
                : 'bg-[#1C1C1C] border border-[#2B2B2B]'
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#F2C230] text-black text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                {p.badge}
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit']">{p.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 min-h-[32px]">{p.audience}</p>
              </div>

              <div className="pt-2 pb-4 border-b border-[#2C2C2C]">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">{p.price}</span>
                  <span className="text-xs text-neutral-400">/{p.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-neutral-300">
                {p.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#F2C230] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => openAuthModal('signup')}
                className={`w-full py-3 text-xs font-bold rounded-xl transition-all shadow-sm ${
                  p.highlight
                    ? 'bg-[#F2C230] hover:bg-[#e0b127] text-black shadow-md'
                    : 'bg-[#252525] hover:bg-[#303030] text-white border border-[#383838]'
                }`}
              >
                {p.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust message */}
      <div className="p-6 rounded-2xl bg-[#171717] border border-[#262626] text-center text-xs text-neutral-400 max-w-2xl mx-auto">
        <Shield className="w-5 h-5 text-[#F2C230] mx-auto mb-2" />
        <p>
          Student privacy guarantee: Your documents, exams, and notes remain 100% private to your account. We never sell student data or train models on private coursework.
        </p>
      </div>
    </div>
  );
};
