import React from 'react';
import {
  FileText,
  HelpCircle,
  Layers,
  GraduationCap,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface LandingPageProps {
  setCurrentView: (view: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentView, openAuthModal }) => {
  const { isAuthenticated, signInDemo } = useStudy();

  const handleStartStudying = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      openAuthModal('signup');
    }
  };

  const features = [
    {
      icon: FileText,
      title: 'AI PDF Summariser',
      desc: 'Transform lengthy documents into concise, structured, easy-to-understand summaries with formulas, key definitions, and chapter breakdowns.',
      view: 'summarizer',
    },
    {
      icon: HelpCircle,
      title: 'Smart Quiz Generator',
      desc: 'Generate practice questions directly from your study materials with multiple choice, true/false, fill-in-the-blanks, and detailed explanations.',
      view: 'quiz',
    },
    {
      icon: Layers,
      title: 'AI Flashcards & Spaced Repetition',
      desc: 'Create active recall revision cards that help you remember important concepts, scheduled automatically with the SM-2 algorithm.',
      view: 'flashcards',
    },
    {
      icon: GraduationCap,
      title: 'Timed Practice Tests',
      desc: 'Simulate real examinations under time pressure with question navigation panels, scoring rubrics, and comprehensive answer reviews.',
      view: 'practice-tests',
    },
    {
      icon: MessageSquare,
      title: 'AI Study Assistant (RAG Grounded)',
      desc: 'Ask questions about your uploaded materials and receive deep academic answers grounded directly in the source document with page citations.',
      view: 'study-assistant',
    },
    {
      icon: BarChart3,
      title: 'Progress & Mastery Tracking',
      desc: 'Understand your strengths, identify knowledge gaps, and monitor your study goals, average quiz scores, and flashcard retention rates.',
      view: 'dashboard',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload your material',
      desc: 'Drop any PDF, lecture slides, research paper, textbook chapter, or paste lecture notes.',
    },
    {
      number: '02',
      title: 'Let Study Kit analyse',
      desc: 'Our Gemini AI reads, extracts chapter hierarchies, definitions, formulas, and critical concepts.',
    },
    {
      number: '03',
      title: 'Generate study resources',
      desc: 'Choose between structured executive summaries, interactive quizzes, or spaced-repetition flashcard decks.',
    },
    {
      number: '04',
      title: 'Practise, review, and track',
      desc: 'Take timed tests, drill flashcards, chat with your AI study partner, and monitor your mastery score.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-[#1A1A1A]">
        {/* Subtle background glow with darker gold and orange tone */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-gradient-to-b from-[#D97706]/15 via-[#EA580C]/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Trust badge with light yellow and darker amber accent */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C0C0C] border border-[#262626] text-xs text-neutral-300 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FDE047]" />
            <span className="text-[#FDE047] font-medium">Intelligent AI Educational Workspace</span>
          </div>

          {/* Main Headline in Clash Display Semi Bold */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white font-['Clash_Display'] max-w-4xl mx-auto leading-[1.1]">
            Study Smarter.{' '}
            <span className="bg-gradient-to-r from-[#FDE047] via-[#D97706] to-[#EA580C] bg-clip-text text-transparent">
              Understand Faster.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Turn your PDFs, lecture notes, and study materials into clear summaries, AI-generated quizzes, flashcards, and personalised learning experiences — all in one deep-focus workspace.
          </p>

          {/* CTA Buttons in Darker Gold & Orange Shades */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartStudying}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#D97706]/25 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Studying Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setCurrentView('features')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0D0D0D] hover:bg-[#161616] text-neutral-200 border border-[#222222] text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Explore Features
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => {
                  signInDemo();
                  setCurrentView('dashboard');
                }}
                className="text-xs text-[#FDE047] hover:text-[#D97706] hover:underline sm:ml-2 transition-colors cursor-pointer"
              >
                Or try instant demo mode →
              </button>
            )}
          </div>

          {/* Trust message */}
          <p className="mt-4 text-xs text-neutral-400">
            Your learning materials, organised in one deep-black distraction-free workspace.
          </p>

          {/* HERO VISUAL: Deep Black Polished Product Preview */}
          <div className="mt-14 max-w-5xl mx-auto bg-[#080808] border border-[#222222] rounded-2xl p-4 sm:p-6 shadow-2xl text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1C1C1C]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs text-neutral-400 font-mono">
                  StudyKit Workspace / Cellular Bioenergetics & Photosynthesis.pdf
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="text-emerald-400 font-semibold">● Live Sync</span>
                <span>·</span>
                <span>SM-2 Scheduler Active</span>
              </div>
            </div>

            {/* Split layout simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Uploaded PDF & AI Summary Preview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#222222]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-white font-['Clash_Display']">Executive Summary</span>
                    <span className="text-[#FDE047] bg-[#D97706]/20 px-2 py-0.5 rounded border border-[#D97706]/40 font-mono text-[11px]">Academic Notes</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Photosynthesis transforms electromagnetic solar radiation into stable organic carbon bonds through two coupled stages: the thylakoid light-dependent electron cascade yielding ATP and NADPH, and the stromatic Calvin-Benson cycle fixing atmospheric CO2 via RuBisCO. (Page 7)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#222222]">
                  <span className="text-xs font-semibold text-white block mb-2 font-['Clash_Display']">Extracted Formulas & Kinetic Laws</span>
                  <div className="p-2.5 rounded bg-[#050505] border border-[#1F1F1F] text-xs font-mono text-[#FDE047]">
                    2 H2O → 4 H+ + 4 e- + O2 (Water photolysis at PSII)
                  </div>
                </div>
              </div>

              {/* Right Column: Quiz Question + Flashcard + Progress */}
              <div className="lg:col-span-5 space-y-4">
                {/* Generated Quiz Card */}
                <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#222222]">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Generated Quiz Question</span>
                    <span className="text-[#FDE047] font-mono font-semibold">Q1 of 5</span>
                  </div>
                  <p className="text-xs font-semibold text-white mb-2 font-['Clash_Display']">
                    Which enzyme catalyzes the primary carbon fixation reaction in the Calvin Cycle?
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 rounded bg-[#0A0A0A] border border-[#222222] text-neutral-300">
                      A. ATP Synthase
                    </div>
                    <div className="p-2 rounded bg-[#D97706]/15 border border-[#D97706] text-white font-medium flex items-center justify-between">
                      <span className="text-[#FDE047]">B. RuBisCO</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FDE047]" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="p-3.5 rounded-xl bg-[#0F0F0F] border border-[#222222] flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-neutral-400">Weekly Mastery Goal</p>
                    <p className="text-xs font-semibold text-white font-mono">4 / 5 Quizzes Completed</p>
                  </div>
                  <div className="w-24 h-2 bg-[#000000] rounded-full overflow-hidden border border-[#222222]">
                    <div className="h-full bg-gradient-to-r from-[#D97706] to-[#EA580C] rounded-full w-[80%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-[#D97706] font-semibold mb-2 font-['Clash_Display']">
            The Study Kit Suite
          </h2>
          <h3 className="text-3xl sm:text-4xl font-semibold text-white font-['Clash_Display'] tracking-tight">
            Everything you need to master your coursework
          </h3>
          <p className="text-sm text-neutral-400 mt-3">
            Designed specifically for demanding academic schedules, exams, and lecture workloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                onClick={() => setCurrentView(feat.view)}
                className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#D97706]/60 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#262626] flex items-center justify-center text-[#FDE047] mb-4 group-hover:scale-105 transition-transform group-hover:text-[#D97706]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2 font-['Clash_Display'] group-hover:text-[#FDE047] transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-xs text-[#D97706] font-medium group-hover:text-[#FDE047] transition-colors">
                  <span>Explore tool</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-[#060606] border-y border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-[#D97706] font-semibold mb-2 font-['Clash_Display']">
              Simple 4-Step Pipeline
            </h2>
            <h3 className="text-3xl sm:text-4xl font-semibold text-white font-['Clash_Display']">
              How Study Kit Works
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] relative"
              >
                <span className="text-3xl font-semibold bg-gradient-to-r from-[#FDE047] to-[#D97706] bg-clip-text text-transparent font-['Clash_Display'] block mb-3">
                  {st.number}
                </span>
                <h4 className="text-base font-semibold text-white mb-2 font-['Clash_Display']">
                  {st.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#0F0F0F] to-[#050505] border border-[#222222] shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#EA580C] text-white font-extrabold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D97706]/30">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold text-white font-['Clash_Display'] tracking-tight">
            Everything You Need to Study Better.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of university and high school students who save hours every week while boosting their test scores and understanding.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartStudying}
              className="px-8 py-3.5 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#D97706]/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Build Your Study Kit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
