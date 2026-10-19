import React, { useState } from 'react';
import {
  FolderArchive,
  FileText,
  HelpCircle,
  Layers,
  GraduationCap,
  Trash2,
  ExternalLink,
  Upload,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface LibraryPageProps {
  setCurrentView: (view: string) => void;
  openUploadModal: () => void;
  onOpenSummary: (summaryId: string) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  setCurrentView,
  openUploadModal,
  onOpenSummary,
}) => {
  const {
    documents,
    summaries,
    quizzes,
    flashcardDecks,
    practiceTests,
    deleteDocument,
    deleteSummary,
    deleteQuiz,
    deleteFlashcardDeck,
    deletePracticeTest,
    setActiveDoc,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'docs' | 'summaries' | 'quizzes' | 'flashcards' | 'tests'>('docs');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSummaries = summaries.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDecks = flashcardDecks.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTests = practiceTests.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase tracking-wider mb-1">
            <FolderArchive className="w-4 h-4" />
            <span>Private Storage Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">My Library</h1>
          <p className="text-sm text-neutral-400 mt-1">
            All your uploaded documents, summaries, and revision kits in one private place.
          </p>
        </div>

        <button
          onClick={openUploadModal}
          className="px-4 py-2.5 bg-[#F2C230] hover:bg-[#e0b127] text-black font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1C1C1C] rounded-lg border border-[#2B2B2B]">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'docs'
                ? 'bg-[#F2C230] text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('summaries')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'summaries'
                ? 'bg-[#F2C230] text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Summaries ({summaries.length})
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'quizzes'
                ? 'bg-[#F2C230] text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'flashcards'
                ? 'bg-[#F2C230] text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Flashcards ({flashcardDecks.length})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'tests'
                ? 'bg-[#F2C230] text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Mock Exams ({practiceTests.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library..."
            className="w-full bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F2C230]"
          />
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. DOCUMENTS */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] hover:border-[#F2C230]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#262626] text-[#F2C230] flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{doc.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                  <span>{doc.pageCount || 1} pages</span>
                  <span>·</span>
                  <span>{(doc.size / (1024 * 1024)).toFixed(1)} MB</span>
                  <span>·</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveDoc(doc);
                    setCurrentView('summarizer');
                  }}
                  className="text-xs font-semibold text-[#F2C230] hover:underline flex items-center gap-1"
                >
                  <span>Summarise</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="col-span-full p-12 text-center rounded-2xl bg-[#1C1C1C] text-neutral-400">
              No documents found. Click "Upload Document" to add your study materials.
            </div>
          )}
        </div>
      )}

      {/* 2. SUMMARIES */}
      {activeTab === 'summaries' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSummaries.map((sum) => (
            <div
              key={sum.id}
              className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] hover:border-[#F2C230]/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-mono text-[#F2C230] uppercase font-semibold">
                  {sum.summaryStyle} · {sum.summaryLength}
                </span>
                <h3 className="text-base font-bold text-white mt-1 font-['Outfit']">{sum.title}</h3>
                <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{sum.executiveSummary}</p>
              </div>

              <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                <button
                  onClick={() => onOpenSummary(sum.id)}
                  className="px-3.5 py-1.5 bg-[#F2C230] text-black text-xs font-semibold rounded-lg"
                >
                  Open Summary Notes
                </button>
                <button
                  onClick={() => deleteSummary(sum.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Delete Summary"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] flex flex-col justify-between space-y-3"
            >
              <div>
                <h3 className="text-sm font-bold text-white">{quiz.title}</h3>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                  <span>{quiz.totalQuestions} Questions</span>
                  <span>·</span>
                  <span>Difficulty: {quiz.difficulty}</span>
                  {quiz.completed && (
                    <>
                      <span>·</span>
                      <span className="text-[#F2C230] font-mono font-bold">
                        Score: {quiz.score}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                <button
                  onClick={() => setCurrentView('quiz')}
                  className="px-3.5 py-1.5 bg-[#2A2A2A] hover:bg-[#333333] text-white text-xs font-medium rounded-lg"
                >
                  Take Quiz
                </button>
                <button
                  onClick={() => deleteQuiz(quiz.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Delete Quiz"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => (
            <div
              key={deck.id}
              className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] flex flex-col justify-between space-y-3"
            >
              <div>
                <h3 className="text-sm font-bold text-white">{deck.title}</h3>
                <p className="text-[11px] text-neutral-400 mt-1">
                  {deck.cardsLearned} of {deck.cards.length} cards mastered · Spaced Repetition Active
                </p>
              </div>

              <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                <button
                  onClick={() => setCurrentView('flashcards')}
                  className="px-3.5 py-1.5 bg-[#F2C230] text-black text-xs font-bold rounded-lg"
                >
                  Study Flashcards
                </button>
                <button
                  onClick={() => deleteFlashcardDeck(deck.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. TESTS */}
      {activeTab === 'tests' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="p-5 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] flex flex-col justify-between space-y-3"
            >
              <div>
                <h3 className="text-sm font-bold text-white">{test.title}</h3>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                  <span>{test.questions.length} Questions</span>
                  <span>·</span>
                  <span>{test.durationMinutes} Minutes</span>
                  {test.completed && (
                    <>
                      <span>·</span>
                      <span className="text-[#F2C230] font-mono font-bold">
                        Score: {test.score}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                <button
                  onClick={() => setCurrentView('practice-tests')}
                  className="px-3.5 py-1.5 bg-[#2A2A2A] hover:bg-[#333333] text-white text-xs font-semibold rounded-lg"
                >
                  Start Simulation
                </button>
                <button
                  onClick={() => deletePracticeTest(test.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
