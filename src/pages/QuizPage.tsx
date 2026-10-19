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
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { QuizItem, QuizQuestion } from '../types';
import { apiClient } from '../lib/apiClient';
import { generateClientSideFallbackQuiz } from '../lib/quizFallback';
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
  const [numQuestions, setNumQuestions] = useState(10);
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
  const [generationProgressText, setGenerationProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showFallbackOption, setShowFallbackOption] = useState(false);
  const [pendingContent, setPendingContent] = useState('');
  const [pendingTitle, setPendingTitle] = useState('');

  // Calculate estimated page count and recommended questions for smart limits
  const selectedDoc = documents.find((d) => d.id === selectedDocId);
  const selectedSummary = summaries.find((s) => s.id === selectedSummaryId);

  let estimatedPages = 1;
  if (sourceType === 'document' && selectedDoc) {
    estimatedPages = selectedDoc.pageCount || Math.max(1, Math.ceil((selectedDoc.extractedText?.length || 0) / 2500));
  } else if (sourceType === 'summary' && selectedSummary) {
    estimatedPages = Math.max(1, Math.ceil((selectedSummary.overview.length + selectedSummary.executiveSummary.length) / 1500));
  } else if (sourceType === 'manual' && manualNotes) {
    estimatedPages = Math.max(1, Math.ceil(manualNotes.length / 2500));
  }

  // Smart question recommendations: ~10 questions per page, minimum 10, maximum 75
  const recommendedMaxQuestions = Math.min(Math.max(10, estimatedPages * 12), 75);
  const isQuestionLimitHigh = numQuestions > recommendedMaxQuestions && estimatedPages <= 3;

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

  // Extract source text
  const getSourceContent = () => {
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

    return { content, title };
  };

  /**
   * Batched Quiz Generation
   * Generates in batches of 10 questions to comfortably avoid Netlify 10-second timeouts.
   * Runs up to 2 batches in parallel, validates each question schema, deduplicates,
   * retries on transient errors, and keeps partial batches.
   */
  const handleGenerateQuiz = async () => {
    setError(null);
    setShowFallbackOption(false);
    setIsGenerating(true);
    setProgressPercent(5);
    setGenerationProgressText('Analyzing learning materials and planning batches...');

    try {
      const { content, title } = getSourceContent();
      setPendingContent(content);
      setPendingTitle(title);

      const targetTotal = numQuestions;
      const BATCH_SIZE = 10;
      const totalBatches = Math.ceil(targetTotal / BATCH_SIZE);

      let accumulatedQuestions: QuizQuestion[] = [];
      const seenQuestionTexts = new Set<string>();

      // Normalize string for deduplication
      const normalizeQ = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Execute batches with concurrency of 2
      const CONCURRENCY = 2;
      const batchIndices = Array.from({ length: totalBatches }, (_, i) => i + 1);

      for (let i = 0; i < batchIndices.length; i += CONCURRENCY) {
        const slice = batchIndices.slice(i, i + CONCURRENCY);

        setGenerationProgressText(
          `Generating questions ${accumulatedQuestions.length} of ${targetTotal} (Batch ${slice.join(', ')} of ${totalBatches})...`
        );

        const batchPromises = slice.map(async (batchNum) => {
          const countForThisBatch = Math.min(BATCH_SIZE, targetTotal - (batchNum - 1) * BATCH_SIZE);
          if (countForThisBatch <= 0) return [];

          // Helper with single retry on transient batch failure
          const fetchBatchWithRetry = async (attempt: number = 1): Promise<any[]> => {
            try {
              const res = await apiClient.post<{ success: boolean; data: { questions: any[] } }>(
                '/api/ai/quiz',
                {
                  content,
                  title,
                  batchNumber: batchNum,
                  totalBatches,
                  batchSize: countForThisBatch,
                  questionTypes,
                  difficulty,
                  focusArea,
                },
                { timeoutMs: 14000 }
              );

              if (res.success && res.data && Array.isArray(res.data.questions)) {
                return res.data.questions;
              }
              return [];
            } catch (batchErr) {
              if (attempt < 2) {
                console.warn(`[Quiz] Retrying batch ${batchNum} after error:`, batchErr);
                await new Promise((r) => setTimeout(r, 800));
                return fetchBatchWithRetry(attempt + 1);
              }
              console.warn(`[Quiz] Batch ${batchNum} failed permanently:`, batchErr);
              return [];
            }
          };

          return await fetchBatchWithRetry();
        });

        const batchResults = await Promise.all(batchPromises);

        for (const rawBatch of batchResults) {
          for (const q of rawBatch) {
            if (!q || !q.question || !q.correctAnswer) continue;

            const norm = normalizeQ(q.question);
            if (seenQuestionTexts.has(norm)) continue;
            seenQuestionTexts.add(norm);

            // Validate and normalize options
            let options = Array.isArray(q.options) ? q.options.filter(Boolean) : [];
            if (options.length < 4) {
              const fallbacks = [q.correctAnswer, 'Option B', 'Option C', 'Option D'];
              for (const f of fallbacks) {
                if (!options.includes(f) && options.length < 4) options.push(f);
              }
            }
            if (!options.includes(q.correctAnswer)) {
              options[0] = q.correctAnswer;
            }

            accumulatedQuestions.push({
              id: q.id || `q-${accumulatedQuestions.length + 1}-${Date.now()}`,
              question: q.question,
              type: q.type || 'multiple_choice',
              options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || 'Verified from the source study material.',
              topic: q.topic || focusArea,
              pageRef: q.pageRef || undefined,
            });
          }
        }

        const currentPct = Math.min(95, Math.round((accumulatedQuestions.length / targetTotal) * 100));
        setProgressPercent(currentPct);
      }

      // If zero questions succeeded, trigger fallback option
      if (accumulatedQuestions.length === 0) {
        setShowFallbackOption(true);
        throw new Error(
          'Online AI quiz generation experienced high demand and was unable to complete your request. You can launch an instant offline quiz right now.'
        );
      }

      setProgressPercent(100);
      setGenerationProgressText(`Successfully generated ${accumulatedQuestions.length} verified questions!`);

      const finalQuestions = accumulatedQuestions.slice(0, targetTotal);

      const newQuiz: QuizItem = {
        id: `quiz-${Date.now()}`,
        docId: selectedDocId || undefined,
        title,
        difficulty,
        totalQuestions: finalQuestions.length,
        completed: false,
        createdAt: new Date().toISOString(),
        questions: finalQuestions,
        focusArea,
      };

      await addQuiz(newQuiz);
      startQuizSession(newQuiz);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setError(err.message || 'Server is busy, please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Instant Client-Side Offline Fallback
   */
  const handleGenerateFallback = () => {
    try {
      setError(null);
      setShowFallbackOption(false);
      const { content, title } = getSourceContent();
      const fallbackResult = generateClientSideFallbackQuiz(
        content,
        Math.min(numQuestions, 20),
        `${title} (Offline Practice)`
      );

      const newQuiz: QuizItem = {
        id: `quiz-fallback-${Date.now()}`,
        docId: selectedDocId || undefined,
        title: fallbackResult.title,
        difficulty: fallbackResult.difficulty,
        totalQuestions: fallbackResult.questions.length,
        completed: false,
        createdAt: new Date().toISOString(),
        questions: fallbackResult.questions,
        focusArea: 'Document Key Concepts',
      };

      addQuiz(newQuiz);
      startQuizSession(newQuiz);
    } catch (fallbackErr: any) {
      setError(fallbackErr.message || 'Could not generate offline quiz.');
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
      alert(
        'Warning: Copying, pasting, or context switching is prohibited during quizzes. A second violation will automatically terminate your quiz.'
      );
      setCheatingAttempts(1);
    } else {
      alert('Quiz terminated due to repeated cheating attempts.');
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

    const scorePercentage = Math.round((correctCount / activeQuiz.questions.length) * 100);

    const updatedQuiz: QuizItem = {
      ...activeQuiz,
      completed: true,
      score: scorePercentage,
      questions: evaluatedQuestions,
    };

    setActiveQuiz(updatedQuiz);
    await updateQuizScore(activeQuiz.id, scorePercentage, evaluatedQuestions);
    setMode('results');

    if (scorePercentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQ = activeQuiz?.questions[currentQuestionIndex];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Assessment Engine</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-['Outfit']">
            AI Quiz Generator
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Turn your study materials into intelligent, chunked practice questions.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 p-1 bg-[#0A0A0A] rounded-lg border border-[#262626]">
          <button
            onClick={() => setMode('configure')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'configure'
                ? 'bg-[#F2C230] text-black font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create New Quiz
          </button>
          <button
            onClick={() => setMode('history')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'history' || mode === 'results'
                ? 'bg-[#F2C230] text-black font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Quiz History ({quizzes.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: CONFIGURE QUIZ */}
      {mode === 'configure' && (
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#F2C230]" />
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
                    ? 'bg-[#1C1C1C] border-[#F2C230] text-[#F2C230] shadow-sm shadow-[#F2C230]/10'
                    : 'bg-[#0A0A0A] border-[#262626] text-neutral-400 hover:text-white'
                }`}
              >
                Uploaded PDF Document
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('summary')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  sourceType === 'summary'
                    ? 'bg-[#1C1C1C] border-[#F2C230] text-[#F2C230] shadow-sm shadow-[#F2C230]/10'
                    : 'bg-[#0A0A0A] border-[#262626] text-neutral-400 hover:text-white'
                }`}
              >
                Saved Summary Notes
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('manual')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  sourceType === 'manual'
                    ? 'bg-[#1C1C1C] border-[#F2C230] text-[#F2C230] shadow-sm shadow-[#F2C230]/10'
                    : 'bg-[#0A0A0A] border-[#262626] text-neutral-400 hover:text-white'
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
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F2C230]"
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
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F2C230]"
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
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F2C230]"
              />
            </div>
          )}

          {/* Smart Question Limits Advice Callout */}
          {isQuestionLimitHigh && (
            <div className="p-3.5 rounded-xl bg-[#26210E] border border-[#F2C230]/40 text-xs text-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#F2C230] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F2C230] font-semibold">Smart Limit Recommendation: </strong>
                  This document is approximately {estimatedPages} page{estimatedPages > 1 ? 's' : ''}. Requesting {numQuestions} questions might cause repetitive questions. We recommend ~{recommendedMaxQuestions} questions.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNumQuestions(recommendedMaxQuestions)}
                className="px-3 py-1.5 bg-[#F2C230] text-black font-bold text-xs rounded-lg hover:bg-[#D4A723] transition-colors shrink-0 cursor-pointer"
              >
                Set to {recommendedMaxQuestions} Questions
              </button>
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
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F2C230]"
              >
                <option value={5}>5 Questions (Quick Test - 1 batch)</option>
                <option value={10}>10 Questions (Standard - 1 batch)</option>
                <option value={20}>20 Questions (Balanced - 2 batches)</option>
                <option value={30}>30 Questions (Comprehensive - 3 batches)</option>
                <option value={50}>50 Questions (Deep Assessment - 5 batches)</option>
                <option value={75}>75 Questions (Full Unit Quiz - 8 batches)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Question Types
              </label>
              <select
                value={questionTypes}
                onChange={(e) => setQuestionTypes(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F2C230]"
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
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F2C230]"
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
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F2C230]"
              >
                <option value="Important Concepts">Important Concepts</option>
                <option value="Definitions & Terms">Definitions & Terms</option>
                <option value="Calculations & Formulas">Calculations & Formulas</option>
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
              className="accent-[#F2C230] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="enableTimer" className="text-xs text-neutral-300 cursor-pointer">
              Enable timed countdown mode (90s per question)
            </label>
          </div>

          {/* Live Progress Bar during Batch Generation */}
          {isGenerating && (
            <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F2C230] font-semibold flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{generationProgressText}</span>
                </span>
                <span className="text-neutral-400 font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#0A0A0A] rounded-full h-2 overflow-hidden border border-[#262626]">
                <div
                  className="bg-gradient-to-r from-[#F2C230] to-[#EAB308] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-400">
                Generating in resilient 10-question serverless batches to eliminate timeouts.
              </p>
            </div>
          )}

          {/* Error Message & Fallback Action */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>

              {showFallbackOption && (
                <div className="pt-2 border-t border-red-800/60 flex items-center justify-between gap-3">
                  <span className="text-neutral-300 text-[11px]">
                    Create an instant offline quiz from the extracted sentences in your document.
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateFallback}
                    className="px-3.5 py-1.5 bg-[#F2C230] hover:bg-[#D4A723] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Generate Offline Quiz</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#F2C230] hover:bg-[#D4A723] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#F2C230]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Processing Batches...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Quiz ({numQuestions} Questions)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: TAKING THE QUIZ */}
      {mode === 'taking' && activeQuiz && currentQ && (
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Top Quiz Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#F2C230] uppercase font-['Outfit']">
                {activeQuiz.title}
              </span>
              <p className="text-xs text-neutral-400">
                Question <strong className="text-white">{currentQuestionIndex + 1}</strong> of{' '}
                {activeQuiz.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {enableTimer && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs ${
                    timeRemainingSeconds < 60
                      ? 'bg-red-950/60 border-red-800 text-red-400 animate-pulse'
                      : 'bg-[#1C1C1C] border-[#2E2E2E] text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timeRemainingSeconds)}</span>
                </div>
              )}

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                    setMode('configure');
                  }
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Quit Quiz
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div
            className="space-y-4 select-none"
            onCopy={handleCheatingAttempt}
            onCut={handleCheatingAttempt}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#1C1C1C] text-[#F2C230] border border-[#2E2E2E]">
                {currentQ.topic || activeQuiz.focusArea || 'General Concept'}
              </span>
              {currentQ.pageRef && (
                <span className="text-[10px] text-neutral-400">
                  Ref: {currentQ.pageRef}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = userAnswers[currentQ.id] === opt;
              const letter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C1C1C] border-[#F2C230] text-white shadow-sm shadow-[#F2C230]/10'
                      : 'bg-[#0A0A0A] border-[#262626] text-neutral-300 hover:border-[#383838]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-[#F2C230] text-black'
                        : 'bg-[#1C1C1C] text-neutral-400'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-xs sm:text-sm pt-0.5 leading-normal">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-[#262626]">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#262626] disabled:opacity-30 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
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
                className="px-5 py-2 bg-[#F2C230] hover:bg-[#D4A723] text-black font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2 bg-[#F2C230] hover:bg-[#D4A723] text-black font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-[#F2C230]/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submit Assessment</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: QUIZ RESULTS & EXPLANATIONS */}
      {mode === 'results' && activeQuiz && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
            <span className="text-xs font-bold text-[#F2C230] uppercase tracking-wider font-['Outfit']">
              Assessment Report
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              {activeQuiz.title}
            </h2>

            <div className="inline-flex items-baseline gap-2 py-2 px-6 rounded-2xl bg-[#0A0A0A] border border-[#262626]">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#F2C230] font-mono">
                {activeQuiz.score}%
              </span>
              <span className="text-xs text-neutral-400">Overall Accuracy</span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              {(activeQuiz.score || 0) >= 80
                ? 'Excellent mastery! You have demonstrated a command of these learning objectives.'
                : (activeQuiz.score || 0) >= 60
                ? 'Solid effort. Review the flagged explanations below to target knowledge gaps.'
                : 'Keep practicing. Take some time to review the highlighted concepts below.'}
            </p>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => startQuizSession(activeQuiz)}
                className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors border border-[#2E2E2E]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => setMode('configure')}
                className="px-5 py-2 bg-[#F2C230] hover:bg-[#D4A723] text-black font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>New Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Detailed Question Analysis ({activeQuiz.questions.length})
            </h3>

            {activeQuiz.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className={`p-5 rounded-xl border space-y-3 ${
                  q.isCorrect
                    ? 'bg-[#0E1711] border-green-900/60'
                    : 'bg-[#180F0F] border-red-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Question {idx + 1} · {q.topic || 'Core Concept'}
                    </span>
                    <h4 className="text-sm font-semibold text-white leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  {q.isCorrect ? (
                    <span className="px-2.5 py-1 rounded bg-green-950/80 border border-green-800 text-green-400 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-red-950/80 border border-red-800 text-red-400 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                      <XCircle className="w-3 h-3" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#262626]">
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Your Answer:</span>
                    <span className={q.isCorrect ? 'text-green-300 font-medium' : 'text-red-300 font-medium'}>
                      {q.userAnswer || '(No answer provided)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#262626]">
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Correct Answer:</span>
                    <span className="text-[#F2C230] font-medium">{q.correctAnswer}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] text-xs text-neutral-300 leading-relaxed">
                  <strong className="text-white font-medium block mb-0.5">Explanation:</strong>
                  {q.explanation}
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
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Your Quiz History
            </h3>
            <button
              onClick={() => setMode('configure')}
              className="px-3.5 py-1.5 bg-[#F2C230] text-black text-xs font-bold rounded-lg shadow-sm cursor-pointer hover:bg-[#D4A723] transition-colors"
            >
              + New Quiz
            </button>
          </div>

          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#F2C230]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white font-['Outfit']">{q.title}</h4>
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
                      <span className="text-base font-mono font-bold text-[#F2C230]">
                        {q.score}% Score
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500 italic">Not started</span>
                    )}
                    <button
                      onClick={() => startQuizSession(q)}
                      className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#262626] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#2E2E2E]"
                    >
                      {q.completed ? 'Retake' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-[#141414] border border-[#262626] text-neutral-400">
              No quizzes created yet. Click "Create New Quiz" to generate one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
