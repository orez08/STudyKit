import React from 'react';
import { BookOpen } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  return (
    <footer className="w-full bg-[#000000] border-t border-[#1A1A1A] text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#EA580C] flex items-center justify-center text-white font-bold shadow-sm shadow-[#D97706]/20">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white font-['Clash_Display'] tracking-tight">
                Study <span className="text-[#D97706]">Kit</span>
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Transform your PDFs, lecture notes, and textbooks into structured summaries, AI quizzes, flashcards, and personalized study plans.
            </p>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 font-['Clash_Display']">
              Study Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('summarizer')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  AI PDF Summariser
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('quiz')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  Smart Quiz Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('flashcards')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  Spaced Repetition Flashcards
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('practice-tests')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  Timed Practice Tests
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Features */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 font-['Clash_Display']">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('features')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  All Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('how-it-works')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('pricing')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  Plans & Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('study-assistant')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  Ask Study Kit AI
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 font-['Clash_Display']">
              Privacy & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('privacy')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('terms')}
                  className="hover:text-[#FDE047] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li className="text-[11px] text-neutral-400 pt-1">
                Your uploaded documents are private to your student account.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} Study Kit. All rights reserved.</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Student-First Architecture</span>
            <span>·</span>
            <span>Grounded Document Intelligence</span>
            <span>·</span>
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
