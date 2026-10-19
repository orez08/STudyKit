import React from 'react';
import {
  Upload,
  Cpu,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCheck,
  Brain,
} from 'lucide-react';

interface HowItWorksPageProps {
  setCurrentView: (view: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  setCurrentView,
  openAuthModal,
}) => {
  const pipeline = [
    {
      step: '01',
      title: 'Secure Document Intake & Validation',
      desc: 'When you upload your lecture PDF, textbook chapter, or research paper, Study Kit validates file structure, calculates page limits, and stores it in your private encrypted vault. Your documents are never shared or made accessible to other students.',
    },
    {
      step: '02',
      title: 'Structural Text Extraction & Page Indexing',
      desc: 'Our document parser identifies page boundaries, headings, subheadings, tables, and mathematical formulas. This structural map ensures that every summary bullet, flashcard, and quiz question retains accurate page citations.',
    },
    {
      step: '03',
      title: 'Hierarchical Gemini AI Comprehension',
      desc: 'For complex multi-page textbooks, Study Kit divides content into logical academic sections, runs hierarchical analysis via Gemini 3.8 Flash, and consolidates findings into high-yield executive summaries, key definitions, and exam formulas.',
    },
    {
      step: '04',
      title: 'Multi-Modal Revision Synthesis',
      desc: 'From a single uploaded document, Study Kit instantaneously derives four distinct active learning tools: structured summary notes, practice quizzes with explanations, spaced-repetition flashcards, and a RAG AI tutoring partner.',
    },
    {
      step: '05',
      title: 'Spaced-Repetition Active Recall Schedule',
      desc: 'Instead of passive re-reading, you test your knowledge through self-paced quizzes and SM-2 flashcard intervals. The algorithm schedules reviews right before the forgetting curve takes effect.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#F2C230]">
          The Study Kit Pipeline
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
          How Intelligent Study Works
        </h1>
        <p className="text-sm sm:text-base text-neutral-300">
          Rooted in proven cognitive science and powered by cutting-edge Gemini AI models to transform passive studying into active mastery.
        </p>
      </div>

      {/* Cognitive Science Explanation */}
      <div className="p-8 rounded-3xl bg-[#1C1C1C] border border-[#2B2B2B] grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#262626] text-[#F2C230] flex items-center justify-center font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-['Outfit']">Active Recall</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Testing your memory with AI quizzes forces the brain to retrieve information, strengthening synaptic pathways far more than simply highlighting notes.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#262626] text-[#F2C230] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-['Outfit']">Spaced Repetition</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Our SuperMemo SM-2 algorithm calculates exact review intervals based on difficulty, combating Ebbinghaus's forgetting curve permanently.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#262626] text-[#F2C230] flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-['Outfit']">Source Grounding</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Every definition, formula, and quiz answer is linked back to the exact page of your uploaded document, preventing hallucinations.
          </p>
        </div>
      </div>

      {/* Step by step pipeline */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white font-['Outfit'] text-center">
          From Raw PDF to Academic Mastery
        </h2>

        <div className="space-y-4">
          {pipeline.map((p, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] flex flex-col sm:flex-row sm:items-start gap-5 hover:border-[#F2C230]/40 transition-colors"
            >
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F2C230] opacity-80 shrink-0">
                {p.step}
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Outfit']">{p.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#212121] to-[#1A1A1A] border border-[#333333] text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-white font-['Outfit']">
          Try it with your own lecture notes today
        </h2>
        <button
          onClick={() => openAuthModal('signup')}
          className="px-6 py-3 bg-[#F2C230] hover:bg-[#e0b127] text-black font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
