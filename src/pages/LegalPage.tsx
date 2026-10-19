import React from 'react';
import { Shield, FileText, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  setCurrentView: (view: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, setCurrentView }) => {
  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-neutral-300">
      <button
        onClick={() => setCurrentView('landing')}
        className="text-xs text-[#F2C230] hover:underline flex items-center gap-1.5 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </button>

      {type === 'privacy' ? (
        <article className="space-y-6">
          <div className="pb-4 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase mb-1">
              <Shield className="w-4 h-4" />
              <span>Student Privacy Constitution</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Privacy Policy</h1>
            <p className="text-xs text-neutral-400 mt-1">Last updated: October 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Strict Document Isolation</h2>
            <p className="text-xs leading-relaxed">
              Every student account on Study Kit is strictly partitioned. Uploaded PDFs, documents, notes, generated summaries, quizzes, and personal progress analytics are stored in private cloud storage and are mathematically inaccessible to any other user.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Artificial Intelligence Usage & Model Protection</h2>
            <p className="text-xs leading-relaxed">
              Study Kit uses Google Gemini models for document summarisation, quiz synthesis, and RAG study partner tutoring. Your uploaded coursework is sent securely via server-side encrypted transit solely for the purpose of generating your requested revision materials. Your private academic materials are never sold, rented, or made public.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Data Retention and Account Control</h2>
            <p className="text-xs leading-relaxed">
              You maintain full ownership of your study materials. When you delete a document, summary, quiz, or your account, all associated database documents and stored assets are permanently purged.
            </p>
          </section>
        </article>
      ) : (
        <article className="space-y-6">
          <div className="pb-4 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase mb-1">
              <FileText className="w-4 h-4" />
              <span>Terms & Guidelines</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Terms of Service</h1>
            <p className="text-xs text-neutral-400 mt-1">Last updated: October 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p className="text-xs leading-relaxed">
              By accessing Study Kit, you agree to these Terms of Service. Study Kit is an educational enhancement tool created to assist student comprehension and revision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Permissible Material Uploads</h2>
            <p className="text-xs leading-relaxed">
              Users must possess the necessary rights or educational fair-use permissions to upload documents, textbooks, lecture slides, and notes for private study and personal examination preparation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Academic Integrity & Verification</h2>
            <p className="text-xs leading-relaxed">
              Study Kit generates structured summaries and active-recall quizzes to reinforce understanding. While our models cite page references and aim for high accuracy, students are always encouraged to consult their primary textbooks and instructor materials for final exam grading criteria.
            </p>
          </section>
        </article>
      )}
    </div>
  );
};
