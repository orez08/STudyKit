import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Sliders,
  AlertCircle,
  Loader2,
  Share2,
  FileCheck,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { QuizItem, QuizQuestion } from '../types';
import confetti from 'canvas-confetti';

interface QuizPageProps {
  initialSummaryContext?: any;
}

export const QuizPage: React.FC<QuizPageProps> = ({ initialSummaryContext }) => {
  const { documents, summaries, quizzes, addQuiz, updateQuizScore } = useStudy();

  // Mode: 'configure' | 'taking' | 'results' | 'history'
  const [mode, setMode] = useState<'configure' | 'taking' | 'results' | 'history'>(
    quizzes.length > 0 ? 'history' : 'configure'
  );

  // Configuration
  const [sourceType, setSourceMode] = useState<'document' | 'summary' | 'manual'>('document');
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [selectedSummaryId, setSelectedSummaryId] = useState(summaries[0]?.id || '');
  const [manualNotes, setManualNotes] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionTypes, setQuestionTypes] = useState('Multiple Choice Questions');
  const [difficulty, setDifficulty] = useState('Medium');
  const [focusArea, setFocusArea] = useState('Important Concepts');
  const [enableTimer, setEnableTimer] = useState(true);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(quizzes[0] || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (mode === 'taking' && enableTimer && timeRemainingSeconds > 0) {
      const timer = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, enableTimer, timeRemainingSeconds]);

  const handleGenerateQuiz = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      let content = '';
      let title = 'Study Quiz';

      if (sourceType === 'document') {
        const doc = documents.find((d) => d.id === selectedDocId);
        if (!doc) throw new Error('Please select a document from your library.');
        content = doc.extractedText || '';
        title = `${doc.name.replace(/\.[^/.]+$/, '')} Assessment`;
      } else if (sourceType === 'summary') {
        const sum = summaries.find((s) => s.id === selectedSummaryId);
        if (!sum) throw new Error('Please select a summary.');
        content = `${sum.title}\n${sum.overview}\n${sum.executiveSummary}\n${sum.keyPoints.join('\n')}`;
        title = `${sum.title} Quiz`;
      } else {
        if (!manualNotes.trim()) throw new Error('Please enter study notes to generate questions.');
        content = manualNotes;
        title = 'Custom Notes Quiz';
      }

      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          numQuestions,
          questionTypes,
          difficulty,
          focusArea,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate quiz.');
      }

      const res = await response.json();
      if (!res.success || !res.data) throw new Error('Invalid quiz response from AI service.');

      const quizData = res.data;
      const newQuiz: QuizItem = {
        id: `quiz-${Date.now()}`,
        docId: selectedDocId || undefined,
        title: quizData.title || title,
        difficulty,
        totalQuestions: quizData.questions.length,
        completed: false,
        createdAt: new Date().toISOString(),
        questions: quizData.questions,
        focusArea,
      };

      await addQuiz(newQuiz);
      startQuizSession(newQuiz);
    } catch (err: any) {
      console.error('Quiz error:', err);
      setError(err.message || 'Failed to create quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuizSession = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    // 90 seconds per question for timer
    setTimeRemainingSeconds(quiz.questions.length * 90);
    setMode('taking');
  };

  const [cheatingAttempts, setCheatingAttempts] = useState(0);

  const handleCheatingAttempt = () => {
    if (cheatingAttempts === 0) {
      alert("Warning: Copying, pasting, or context switching is prohibited during quizzes. A second violation will automatically terminate your quiz.");
      setCheatingAttempts(1);
    } else {
      alert("Quiz terminated due to repeated cheating attempts.");
      handleSubmitQuiz();
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    const normalizeAns = (str: string) =>
      str.trim().toLowerCase().replace(/^[a-d1-4][\.\)\:\-]\s*/, '').trim();

    const evaluatedQuestions = activeQuiz.questions.map((q) => {
      const userAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();
      const isCorrect = userAns === correctAns || (!!userAns && normalizeAns(userAns) === normalizeAns(correctAns));
      if (isCorrect) correctCount++;
      return {
        ...q,
        userAnswer: userAnswers[q.id] || '',
        isCorrect,
      };
    });

    const finalScore = Math.round((correctCount / activeQuiz.questions.length) * 100);

    await updateQuizScore(activeQuiz.id, finalScore, evaluatedQuestions);

    setActiveQuiz({
      ...activeQuiz,
      score: finalScore,
      completed: true,
      questions: evaluatedQuestions,
    });

    setMode('results');

    if (finalScore >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const currentQ = activeQuiz?.questions[currentQuestionIndex];
  const allAnswered = activeQuiz
    ? activeQuiz.questions.every((q) => !!userAnswers[q.id])
    : false;

  return (
    <div
      className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in bg-[#000000]"
      onCopy={(e) => {
        if (mode === 'taking') {
          e.preventDefault();
          handleCheatingAttempt();
        }
      }}
      onPaste={(e) => {
        if (mode === 'taking') {
          e.preventDefault();
          handleCheatingAttempt();
        }
      }}
      onContextMenu={(e) => {
        if (mode === 'taking') {
          e.preventDefault();
          handleCheatingAttempt();
        }
      }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1C1C1C]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-1 font-['Clash_Display']">
            <HelpCircle className="w-4 h-4 text-[#FDE047]" />
            <span>Active Retrieval Engine</span>
          </div>
          <h1 className="text-3xl font-semibold text-white font-['Clash_Display']">
            AI Quiz Generator
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Turn what you study into questions that test what you know.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 p-1 bg-[#050505] rounded-lg border border-[#1C1C1C]">
          <button
            onClick={() => setMode('configure')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'configure'
                ? 'bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create New Quiz
          </button>
          <button
            onClick={() => setMode('history')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'history' || mode === 'results'
                ? 'bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Quiz History ({quizzes.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: CONFIGURE QUIZ */}
      {mode === 'configure' && (
        <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white font-['Clash_Display'] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#FDE047]" />
            <span>Configure Your Practice Quiz</span>
          </h2>

          {/* Source Selector */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-neutral-300 block">
              Generate Questions From:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSourceMode('document')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  sourceType === 'document'
                    ? 'bg-[#121212] border-[#D97706] text-white shadow-sm shadow-[#D97706]/15'
                    : 'bg-[#050505] border-[#1C1C1C] text-neutral-400 hover:text-white'
                }`}
              >
                Uploaded PDF Document
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('summary')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  sourceType === 'summary'
                    ? 'bg-[#121212] border-[#D97706] text-white shadow-sm shadow-[#D97706]/15'
                    : 'bg-[#050505] border-[#1C1C1C] text-neutral-400 hover:text-white'
                }`}
              >
                Saved Summary Notes
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('manual')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  sourceType === 'manual'
                    ? 'bg-[#121212] border-[#D97706] text-white shadow-sm shadow-[#D97706]/15'
                    : 'bg-[#050505] border-[#1C1C1C] text-neutral-400 hover:text-white'
                }`}
              >
                Pasted Notes
              </button>
            </div>
          </div>

          {/* Document or Summary Picker */}
          {sourceType === 'document' && (
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Select Library Document
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D97706]"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.pageCount || 1} pages)
                  </option>
                ))}
              </select>
            </div>
          )}

          {sourceType === 'summary' && (
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Select Saved Summary
              </label>
              <select
                value={selectedSummaryId}
                onChange={(e) => setSelectedSummaryId(e.target.value)}
                className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D97706]"
              >
                {summaries.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sourceType === 'manual' && (
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Paste Study Notes / Transcript
              </label>
              <textarea
                rows={4}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Paste the concepts, formulas, or definitions you need questions on..."
                className="w-full bg-[#050505] border border-[#222222] rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D97706]"
              />
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D97706]"
              >
                <option value={5}>5 Questions (Quick Test)</option>
                <option value={10}>10 Questions (Standard)</option>
                <option value={25}>25 Questions (Comprehensive)</option>
                <option value={50}>50 Questions (Deep Assessment)</option>
                <option value={75}>75 Questions (Full Unit Quiz)</option>
                <option value={100}>100 Questions (Ultimate Mastery Exam)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Question Types
              </label>
              <select
                value={questionTypes}
                onChange={(e) => setQuestionTypes(e.target.value)}
                className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D97706]"
              >
                <option value="Multiple Choice Questions">Multiple Choice</option>
                <option value="True or False">True or False</option>
                <option value="Mixed Questions">Mixed Question Types</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D97706]"
              >
                <option value="Easy">Easy (Foundational)</option>
                <option value="Medium">Medium (Balanced)</option>
                <option value="Hard">Hard (Exam Level)</option>
                <option value="Mixed Difficulty">Mixed Difficulty</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Focus Area</label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-[#050505] border border-[#222222] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D97706]"
              >
                <option value="Important Concepts">Important Concepts</option>
                <option value="Definitions & Terms">Definitions & Terms</option>
                <option value="Calculations & Laws">Calculations & Formulas</option>
              </select>
            </div>
          </div>

          {/* Timer toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enableTimer"
              checked={enableTimer}
              onChange={(e) => setEnableTimer(e.target.checked)}
              className="accent-[#D97706] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="enableTimer" className="text-xs text-neutral-300 cursor-pointer">
              Enable timed countdown mode (simulates realistic test conditions)
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-[#D97706]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Exam Questions with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Quiz with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: TAKING THE QUIZ */}
      {mode === 'taking' && activeQuiz && currentQ && (
        <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Top Quiz Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#FDE047] uppercase font-['Clash_Display']">
                {activeQuiz.title}
              </span>
              <p className="text-xs text-neutral-400">
                Question <strong className="text-white">{currentQuestionIndex + 1}</strong> of{' '}
                {activeQuiz.questions.length}
              </p>
            </div>

            {enableTimer && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#222222] font-mono text-xs text-white">
                <Clock className="w-3.5 h-3.5 text-[#FDE047]" />
                <span className="tabular-nums">
                  {Math.floor(timeRemainingSeconds / 60)}:
                  {(timeRemainingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#050505] rounded-full overflow-hidden border border-[#1C1C1C]">
            <div
              className="h-full bg-gradient-to-r from-[#D97706] to-[#EA580C] transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-base sm:text-lg font-semibold text-white font-['Clash_Display'] leading-snug">
              {currentQ.question}
            </h3>
            {currentQ.pageRef && (
              <span className="inline-block mt-2 text-[10px] text-neutral-400 font-mono bg-[#141414] px-2 py-0.5 rounded border border-[#222222]">
                Reference: {currentQ.pageRef}
              </span>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options && currentQ.options.length > 0 ? (
              currentQ.options.map((opt, oIdx) => {
                const isSelected = userAnswers[currentQ.id] === opt;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    className={`w-full p-4 rounded-xl text-left text-xs transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-[#121212] border-[#D97706] text-white shadow-sm shadow-[#D97706]/20'
                        : 'bg-[#050505] border-[#1C1C1C] text-neutral-300 hover:bg-[#0F0F0F]'
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#D97706] bg-[#D97706]' : 'border-neutral-500'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={userAnswers[currentQ.id] || ''}
                  onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                  className="w-full bg-[#050505] border border-[#222222] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#D97706]"
                />
              </div>
            )}
          </div>

          {/* Question Navigation */}
          <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-[#141414] hover:bg-[#1E1E1E] text-white text-xs font-medium rounded-lg disabled:opacity-40 flex items-center gap-1.5 cursor-pointer border border-[#222222]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(activeQuiz.questions.length - 1, prev + 1)
                  )
                }
                className="px-5 py-2.5 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm shadow-[#D97706]/20 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Submit Quiz Answers</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: RESULTS & EXPLANATIONS */}
      {mode === 'results' && activeQuiz && (
        <div className="space-y-6">
          {/* Score Header Card */}
          <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 sm:p-8 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FDE047] font-['Clash_Display']">
              Assessment Complete
            </span>
            <h2 className="text-4xl font-semibold font-mono text-white tabular-nums">
              {activeQuiz.score}%
            </h2>
            <p className="text-sm text-neutral-300">
              You answered{' '}
              <strong className="text-white">
                {activeQuiz.questions.filter((q) => q.isCorrect).length}
              </strong>{' '}
              of {activeQuiz.questions.length} questions correctly.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => startQuizSession(activeQuiz)}
                className="px-4 py-2 bg-[#141414] hover:bg-[#1E1E1E] text-white text-xs font-semibold rounded-lg flex items-center gap-2 border border-[#242424] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => setMode('configure')}
                className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white text-xs font-semibold rounded-lg shadow-sm shadow-[#D97706]/20 cursor-pointer"
              >
                Create New Quiz
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white font-['Clash_Display']">
              Answer Review & Explanations
            </h3>

            {activeQuiz.questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className={`p-5 rounded-xl border space-y-3 ${
                  q.isCorrect
                    ? 'bg-[#0E1F12] border-emerald-800/60'
                    : 'bg-[#1F0E0E] border-red-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-neutral-400">
                      Q{(qIdx + 1).toString().padStart(2, '0')}.
                    </span>
                    <h4 className="text-sm font-semibold text-white font-['Clash_Display']">{q.question}</h4>
                  </div>
                  {q.isCorrect ? (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Correct
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1 shrink-0">
                      <XCircle className="w-4 h-4" />
                      Incorrect
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#1C1C1C]">
                    <span className="text-[10px] text-neutral-400 block">Your Answer:</span>
                    <span className={q.isCorrect ? 'text-emerald-300 font-medium' : 'text-red-300 font-medium'}>
                      {q.userAnswer || 'No answer submitted'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#1C1C1C]">
                    <span className="text-[10px] text-neutral-400 block">Correct Answer:</span>
                    <span className="text-emerald-400 font-medium">{q.correctAnswer}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-neutral-300 leading-relaxed border-t border-[#1C1C1C]">
                  <strong className="text-white">Explanation: </strong>
                  {q.explanation}
                  {q.pageRef && (
                    <span className="ml-2 text-[#FDE047] font-mono font-medium">({q.pageRef})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: QUIZ HISTORY */}
      {mode === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white font-['Clash_Display']">
              Your Quiz History
            </h3>
            <button
              onClick={() => setMode('configure')}
              className="px-3 py-1.5 bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              + New Quiz
            </button>
          </div>

          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] hover:border-[#D97706]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white font-['Clash_Display']">{q.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                      <span>{q.totalQuestions} Questions</span>
                      <span>·</span>
                      <span>Difficulty: {q.difficulty}</span>
                      <span>·</span>
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {q.completed ? (
                      <span className="text-base font-mono font-semibold text-[#FDE047]">
                        {q.score}% Score
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500 italic">Not started</span>
                    )}
                    <button
                      onClick={() => startQuizSession(q)}
                      className="px-4 py-2 bg-[#141414] hover:bg-[#1E1E1E] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#242424]"
                    >
                      {q.completed ? 'Retake' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] text-neutral-400">
              No quizzes created yet. Click "Create New Quiz" to generate one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
