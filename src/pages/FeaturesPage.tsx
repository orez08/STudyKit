import React from 'react';
import {
  FileText,
  HelpCircle,
  Layers,
  GraduationCap,
  MessageSquare,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

interface FeaturesPageProps {
  setCurrentView: (view: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ setCurrentView, openAuthModal }) => {
  const featureList = [
    {
      icon: FileText,
      title: 'AI PDF Summariser',
      tagline: 'Hierarchical, structured study notes grounded in source evidence.',
      description:
        'Instead of generic 2-paragraph summaries, Study Kit extracts document structure, key definitions, quantitative formulas, historical dates, chapter summaries, and revision checklists with verifiable page references.',
      bullets: [
        'Multi-page and long document parsing',
        'Configurable lengths (Quick, Standard, Detailed) and academic levels',
        'Formula extraction with units and variable definitions',
        'Export to TXT, Print to PDF, and 1-click clipboard copy',
      ],
      targetView: 'summarizer',
    },
    {
      icon: HelpCircle,
      title: 'Smart Quiz Generator',
      tagline: 'Active recall testing with instant answer explanations.',
      description:
        'Generate custom multiple-choice, true/false, and conceptual practice quizzes directly from your uploaded materials to reinforce weak spots before exam day.',
      bullets: [
        'Adjustable difficulty (Easy, Medium, Hard, Mixed)',
        'Comprehensive rationale for correct and incorrect answers',
        'Source page references on every question',
        'Full test retakes and mastery history tracking',
      ],
      targetView: 'quiz',
    },
    {
      icon: Layers,
      title: 'Spaced Repetition Flashcards',
      tagline: 'Scientifically scheduled review using the SuperMemo SM-2 algorithm.',
      description:
        'Never forget definitions or laws. Cards are intelligently scheduled based on how easily you recall them, prioritizing difficult concepts right before they slip from memory.',
      bullets: [
        'SuperMemo SM-2 spaced repetition scheduler',
        '3D flip card active recall interface with fullscreen study mode',
        'Easy / Good / Hard knowledge rating',
        'Create cards automatically from PDFs or enter cards manually',
      ],
      targetView: 'flashcards',
    },
    {
      icon: GraduationCap,
      title: 'Timed Practice Tests & Mock Exams',
      tagline: 'Simulate high-stakes exam conditions with timed countdowns.',
      description:
        'Experience real exam pressure. Set customized durations, passing scores, and question types. Navigate questions with an unanswered status indicator and receive instant grading.',
      bullets: [
        'Exam countdown timer with auto-submit protection',
        'Question navigator grid showing answered / unanswered status',
        'Detailed post-exam scoring rubric and answer review',
        'Resilient against accidental page switches or interruptions',
      ],
      targetView: 'practice-tests',
    },
    {
      icon: MessageSquare,
      title: 'Ask Study Kit (AI Study Assistant)',
      tagline: 'Retrieval-Augmented Generation (RAG) study partner.',
      description:
        'Chat directly with your uploaded documents. Ask for simpler analogies, step-by-step proofs, or cross-chapter comparisons. The AI cites document page evidence directly.',
      bullets: [
        'Document RAG citation and evidence grounding',
        'Follow-up question suggestions',
        'Conversation history and easy response copying',
        'Distinguishes between document facts and external clarifications',
      ],
      targetView: 'study-assistant',
    },
    {
      icon: CalendarCheck,
      title: 'Personalized Study Planner',
      tagline: 'Automated revision timetables aligned with your exams.',
      description:
        'Enter your subjects, exam dates, and daily availability. Study Kit generates an actionable daily and weekly task schedule to ensure all topics are revised in time.',
      bullets: [
        'AI timetable generation based on exam countdowns',
        'Daily and weekly task completion tracking',
        'Subject filtering and priority classification',
        'Custom task creation and deadline management',
      ],
      targetView: 'planner',
    },
  ];

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#F2C230]">
          Comprehensive Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
          Engineered for Academic Excellence
        </h1>
        <p className="text-base text-neutral-300">
          Every tool in Study Kit is connected to real AI models and student persistence, designed to eliminate busywork and maximize learning retention.
        </p>
      </div>

      {/* Feature Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featureList.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#1C1C1C] border border-[#2B2B2B] hover:border-[#F2C230]/40 transition-all flex flex-col justify-between space-y-6 shadow-xl"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#262626] border border-[#383838] flex items-center justify-center text-[#F2C230]">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-['Outfit']">{feat.title}</h3>
                  <p className="text-xs text-[#F2C230] font-medium mt-0.5">{feat.tagline}</p>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{feat.description}</p>

                <ul className="space-y-2 pt-2 border-t border-[#262626] text-xs text-neutral-400">
                  {feat.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F2C230] shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setCurrentView(feat.targetView)}
                className="w-full py-2.5 bg-[#252525] hover:bg-[#F2C230] hover:text-black text-neutral-200 text-xs font-semibold rounded-xl border border-[#383838] transition-all flex items-center justify-center gap-2"
              >
                <span>Launch {feat.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#212121] to-[#1A1A1A] border border-[#333333] text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          Ready to experience smarter learning?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto">
          Create your free student account today and upload your first PDF to generate structured revision materials in seconds.
        </p>
        <button
          onClick={() => openAuthModal('signup')}
          className="px-6 py-3 bg-[#F2C230] hover:bg-[#e0b127] text-black font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
        >
          <span>Start Free Student Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
