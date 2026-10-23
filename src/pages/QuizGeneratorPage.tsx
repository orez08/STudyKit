import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Flame,
  HelpCircle,
  PenTool,
  Check,
  ListFilter,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudy } from '../context/StudyContext';
import { Quiz, QuizQuestion, UserAnswerRecord } from '../types';
import { evaluateWrittenAnswer } from '../utils/quizEvaluator';

const INITIAL_STARTER_QUIZ: Quiz = {
  id: 'starter-quiz-1',
  title: 'Foundations of Computer Systems & Molecular Biology',
  topic: 'Computer Science & Biology',
  format: 'mixed',
  createdAt: Date.now(),
  questions: [
    {
      id: 'q-demo-1',
      type: 'multiple-choice',
      question: 'What is the primary role of mitochondria in cellular energy metabolism?',
      options: [
        'Production of adenosine triphosphate (ATP) via oxidative phosphorylation',
        'Direct synthesis of messenger RNA molecules',
        'Storage of lipid-soluble endocrine hormones',
        'Hydrolysis of non-functional cytosolic proteins'
      ],
      correctAnswer: 0,
      acceptableAnswers: ['ATP production', 'oxidative phosphorylation'],
      keyConcepts: ['ATP', 'oxidative phosphorylation'],
      explanation: 'Mitochondria produce ATP through the electron transport chain and ATP synthase embedded in the inner cristae membrane.'
    },
    {
      id: 'q-demo-2',
      type: 'written',
      question: 'In computer science, what does the CAP theorem state regarding distributed data systems?',
      acceptableAnswers: [
        'A distributed system can only provide two of Consistency, Availability, and Partition tolerance simultaneously.',
        'Consistency, Availability, and Partition tolerance cannot all be achieved at the same time.',
        'You can only choose two of consistency, availability, and partition tolerance.'
      ],
      keyConcepts: ['Consistency', 'Availability', 'Partition tolerance', 'only two'],
      explanation: 'Brewer\'s CAP theorem proves that in the event of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A).'
    },
    {
      id: 'q-demo-3',
      type: 'written',
      question: 'What is the biochemical function of the enzyme DNA Helicase during cellular replication?',
      acceptableAnswers: [
        'Unwinds the double helix DNA by breaking hydrogen bonds between base pairs.',
        'Unzips the DNA double helix.',
        'Separates the two strands of the DNA double helix.'
      ],
      keyConcepts: ['unwinds', 'double helix', 'hydrogen bonds', 'separates strands'],
      explanation: 'Helicase uses ATP hydrolysis to break the hydrogen bonds between complementary base pairs, creating the replication fork.'
    },
    {
      id: 'q-demo-4',
      type: 'multiple-choice',
      question: 'Which CPU cache level is typically the fastest and closest to the core processing units?',
      options: ['L3 Cache', 'System RAM', 'L1 Cache', 'Disk Swap Space'],
      correctAnswer: 2,
      acceptableAnswers: ['L1 Cache', 'L1'],
      keyConcepts: ['L1 Cache'],
      explanation: 'L1 cache has the lowest latency (often ~1 nanosecond) and is built directly inside each CPU core.'
    }
  ]
};

export const QuizGeneratorPage: React.FC = () => {
  const { recordStudySession } = useStudy();

  const [activeQuiz, setActiveQuiz] = useState<Quiz>(INITIAL_STARTER_QUIZ);
  const [currentIdx, setCurrentIdx] = useState(0);

  // User input states for current question
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');
  const [submittedCurrent, setSubmittedCurrent] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);

  // History of all answered questions for accurate grading
  const [answerRecords, setAnswerRecords] = useState<UserAnswerRecord[]>([]);
  const [completed, setCompleted] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);

  // Generation Controls
  const [topicInput, setTopicInput] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [quizFormat, setQuizFormat] = useState<'mixed' | 'multiple-choice' | 'written'>('mixed');
  const [generating, setGenerating] = useState(false);
  const [genProgressText, setGenProgressText] = useState('');

  const currentQuestion: QuizQuestion = activeQuiz.questions[currentIdx] || activeQuiz.questions[0];

  // Submit Multiple Choice Answer
  const handleSelectOption = (idx: number) => {
    if (submittedCurrent) return;
    setSelectedOption(idx);
    setSubmittedCurrent(true);

    const isCorrect = idx === currentQuestion.correctAnswer;
    const scoreEarned = isCorrect ? 1 : 0;

    const record: UserAnswerRecord = {
      questionIndex: currentIdx,
      questionText: currentQuestion.question,
      type: 'multiple-choice',
      userAnswer: idx,
      correctAnswerDisplay: currentQuestion.options ? currentQuestion.options[currentQuestion.correctAnswer ?? 0] : 'N/A',
      isCorrect,
      score: scoreEarned,
      feedback: isCorrect ? 'Correct! Selected right option.' : 'Incorrect option selected.',
    };

    setAnswerRecords(prev => [...prev.filter(r => r.questionIndex !== currentIdx), record]);
  };

  // Submit Written Answer
  const handleSubmitWritten = (e: React.FormEvent) => {
    e.preventDefault();
    if (submittedCurrent || !writtenAnswer.trim()) return;

    const evaluation = evaluateWrittenAnswer(writtenAnswer, currentQuestion);
    setCurrentEvaluation(evaluation);
    setSubmittedCurrent(true);

    const record: UserAnswerRecord = {
      questionIndex: currentIdx,
      questionText: currentQuestion.question,
      type: 'written',
      userAnswer: writtenAnswer.trim(),
      correctAnswerDisplay: evaluation.primaryExpected,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      feedback: evaluation.feedback,
      matchedConcepts: evaluation.matchedConcepts,
    };

    setAnswerRecords(prev => [...prev.filter(r => r.questionIndex !== currentIdx), record]);
  };

  // Move to Next Question or Complete
  const handleNext = async () => {
    if (currentIdx + 1 < activeQuiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setWrittenAnswer('');
      setSubmittedCurrent(false);
      setCurrentEvaluation(null);
    } else {
      setCompleted(true);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
      await recordStudySession(30);
    }
  };

  // Jump to Question (helpful for 50 or 100 question quizzes)
  const jumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    setSelectedOption(null);
    setWrittenAnswer('');
    setSubmittedCurrent(false);
    setCurrentEvaluation(null);
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setWrittenAnswer('');
    setSubmittedCurrent(false);
    setCurrentEvaluation(null);
    setAnswerRecords([]);
    setCompleted(false);
  };

  // Accurate Grading Calculations
  const totalScoreEarned = answerRecords.reduce((acc, curr) => acc + curr.score, 0);
  const totalQuestions = activeQuiz.questions.length;
  // Exact percentage: Math.round((earned / total) * 100)
  const accuratePercentage = totalQuestions > 0 ? Math.round((totalScoreEarned / totalQuestions) * 100) : 0;
  const correctCount = answerRecords.filter(r => r.score === 1).length;
  const partialCount = answerRecords.filter(r => r.score > 0 && r.score < 1).length;
  const incorrectCount = answerRecords.filter(r => r.score === 0).length;

  // Generate Custom Quiz (Supports 5, 10, 25, 50, 100 questions with strict deduplication)
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryTopic = topicInput.trim() || 'Academic Science & Technology';
    setGenerating(true);
    setGenProgressText(`Synthesizing ${questionCount} unique questions with strict novelty validation...`);

    try {
      const res = await fetch('/api/generate-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: queryTopic,
          type: 'quiz',
          count: questionCount,
          format: quizFormat
        })
      });

      const data = await res.json();
      if (data && data.questions && data.questions.length > 0) {
        setActiveQuiz({
          id: `quiz-gen-${Date.now()}`,
          title: data.title || `${queryTopic} Assessment`,
          topic: queryTopic,
          format: quizFormat,
          questions: data.questions,
          createdAt: Date.now()
        });
        restartQuiz();
      }
    } catch (err) {
      console.warn('Quiz generation fallback:', err);
    } finally {
      setGenerating(false);
      setGenProgressText('');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
          <Brain className="w-3.5 h-3.5" />
          Intelligent Active Recall & Precision Grading
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Quiz Generator
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Supports both Multiple-Choice and Written open-ended questions with robust semantic right/wrong detection and guaranteed 100% unique question banks (up to 100 questions).
        </p>
      </div>

      {/* Quiz Generation Configuration Form */}
      <form onSubmit={handleGenerate} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Enter any topic (e.g. Distributed Consensus, Cellular Respiration, Organic Chemistry)..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={generating}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Synthesizing...' : 'Generate Assessment'}
          </button>
        </div>

        {/* Volume & Format Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-800/80 text-xs">
          {/* Question Volume (5, 10, 25, 50, 100) */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              Volume:
            </span>
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {[5, 10, 25, 50, 100].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    questionCount === count
                      ? 'bg-amber-500 text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Question Format (Mixed, MCQ, Written) */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-semibold flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5 text-neutral-500" />
              Format:
            </span>
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {[
                { id: 'mixed', label: 'Mixed Mode' },
                { id: 'multiple-choice', label: 'Multiple Choice' },
                { id: 'written', label: 'Written Only' }
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setQuizFormat(fmt.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                    quizFormat === fmt.id
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {generating && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{genProgressText || 'Enforcing strict deduplication across sub-topics...'}</span>
          </div>
        )}
      </form>

      {/* ACTIVE QUIZ SCREEN */}
      {!completed ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 relative shadow-xl">
          {/* Header & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800 text-xs text-neutral-400 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{activeQuiz.title}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-amber-400 border border-neutral-700 uppercase">
                {currentQuestion.type === 'written' ? 'Written Question' : 'Multiple Choice'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>
                Question <span className="text-white font-bold">{currentIdx + 1}</span> of{' '}
                <span className="text-white font-bold">{activeQuiz.questions.length}</span>
              </span>
              <span className="text-neutral-600">•</span>
              <span>
                Current Score: <span className="text-amber-400 font-bold">{totalScoreEarned}</span> pts
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-800 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-amber-500/50"
              style={{ width: `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%` }}
            />
          </div>

          {/* Quick Navigator Pill Strip for Large Quizzes (e.g. 25, 50, 100) */}
          {activeQuiz.questions.length > 5 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
              {activeQuiz.questions.map((_, idx) => {
                const recorded = answerRecords.find(r => r.questionIndex === idx);
                let pillColor = 'bg-neutral-800/80 text-neutral-400 border-neutral-700/60';
                if (recorded) {
                  pillColor = recorded.score === 1
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : recorded.score > 0
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40';
                } else if (idx === currentIdx) {
                  pillColor = 'bg-amber-500 text-black border-amber-400 font-bold';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToQuestion(idx)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold border shrink-0 flex items-center justify-center cursor-pointer transition-colors ${pillColor}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* QUESTION TYPE 1: MULTIPLE CHOICE */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((optionText, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentQuestion.correctAnswer;
                let btnStyle = 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 text-neutral-200';

                if (submittedCurrent) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/40';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-neutral-950/40 border-neutral-900 text-neutral-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={submittedCurrent}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-neutral-800/80 flex items-center justify-center text-xs font-mono font-bold text-neutral-400">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{optionText}</span>
                    </div>

                    {submittedCurrent && (
                      <div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* QUESTION TYPE 2: WRITTEN OPEN-ENDED ANSWER */}
          {currentQuestion.type === 'written' && (
            <form onSubmit={handleSubmitWritten} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-amber-500" />
                  Type your scientific explanation or concept answer:
                </label>
                <textarea
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  disabled={submittedCurrent}
                  rows={3}
                  placeholder="Explain the mechanism, principle, or key terminology in your own words..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500 resize-none disabled:opacity-80"
                  required
                />
              </div>

              {!submittedCurrent && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!writtenAnswer.trim()}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    Submit Written Answer
                  </button>
                </div>
              )}

              {/* Written Answer Feedback Banner */}
              {submittedCurrent && currentEvaluation && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    currentEvaluation.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : currentEvaluation.score > 0
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {currentEvaluation.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : currentEvaluation.score > 0 ? (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {currentEvaluation.isCorrect
                        ? 'Correct! (+1 pt)'
                        : currentEvaluation.score > 0
                        ? 'Partially Correct (+0.5 pt)'
                        : 'Incorrect (0 pts)'}
                    </span>
                  </div>
                  <p>{currentEvaluation.feedback}</p>

                  {/* Matched Concepts Tags */}
                  {currentEvaluation.matchedConcepts && currentEvaluation.matchedConcepts.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Concepts Detected:</span>
                      {currentEvaluation.matchedConcepts.map((concept: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-700 text-[10px] font-semibold text-white">
                          ✓ {concept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {/* Concept Analysis & Explanation (Revealed after submission) */}
          {submittedCurrent && (
            <div className="mt-6 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
              <span className="font-bold text-amber-400 block mb-1">Concept Analysis & Benchmark:</span>
              <p>{currentQuestion.explanation}</p>
              {currentQuestion.type === 'written' && currentQuestion.acceptableAnswers && (
                <div className="mt-2 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                  <span className="font-semibold text-neutral-300">Accepted Key Formulation: </span>
                  {currentQuestion.acceptableAnswers[0]}
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          {submittedCurrent && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <span>{currentIdx + 1 < activeQuiz.questions.length ? 'Next Question' : 'Finish & View Grading Report'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ACCURATE GRADING REPORT SCREEN */
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
              <Flame className="w-8 h-8 fill-amber-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Assessment Complete!</h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {activeQuiz.title}
            </p>
          </div>

          {/* Precise Score & Percentage Meter */}
          <div className="my-8 p-6 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center items-center">
            <div>
              <span className="text-xs text-neutral-400 font-semibold block uppercase tracking-wider mb-1">
                Final Grade
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-400">
                {accuratePercentage}%
              </div>
              <span className="text-xs font-bold text-neutral-300 mt-1 block">
                {accuratePercentage >= 90
                  ? '🏆 Mastery Standard'
                  : accuratePercentage >= 75
                  ? '⭐ Proficient'
                  : accuratePercentage >= 50
                  ? '📈 Developing'
                  : 'Needs Practice'}
              </span>
            </div>

            <div>
              <span className="text-xs text-neutral-400 font-semibold block uppercase tracking-wider mb-1">
                Raw Score
              </span>
              <div className="text-3xl font-extrabold text-white">
                {totalScoreEarned} <span className="text-neutral-500 text-base font-normal">/ {totalQuestions}</span>
              </div>
              <span className="text-xs text-neutral-400 mt-1 block">
                Points calculated precisely
              </span>
            </div>

            <div>
              <span className="text-xs text-neutral-400 font-semibold block uppercase tracking-wider mb-1">
                Accuracy Breakdown
              </span>
              <div className="flex items-center justify-center gap-2 text-xs font-bold">
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  {correctCount} Correct
                </span>
                {partialCount > 0 && (
                  <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    {partialCount} Partial
                  </span>
                )}
                <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                  {incorrectCount} Wrong
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 mt-1.5 block">
                +30 mins added to daily streak!
              </span>
            </div>
          </div>

          {/* Expandable Review Sheet */}
          <div className="border border-neutral-800 rounded-2xl overflow-hidden mb-6">
            <button
              onClick={() => setShowReviewList(!showReviewList)}
              className="w-full p-4 bg-neutral-950/80 hover:bg-neutral-950 flex items-center justify-between text-xs font-bold text-white cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Review All {activeQuiz.questions.length} Answers & Feedback</span>
              </div>
              {showReviewList ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>

            {showReviewList && (
              <div className="p-4 space-y-3 bg-neutral-950/40 border-t border-neutral-800 max-h-96 overflow-y-auto">
                {activeQuiz.questions.map((q, idx) => {
                  const record = answerRecords.find(r => r.questionIndex === idx);
                  const isCorrect = record ? record.score === 1 : false;
                  const isPartial = record ? record.score > 0 && record.score < 1 : false;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs ${
                        isCorrect
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-neutral-200'
                          : isPartial
                          ? 'bg-amber-500/5 border-amber-500/30 text-neutral-200'
                          : 'bg-rose-500/5 border-rose-500/30 text-neutral-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="font-bold text-white">
                          Q{idx + 1}: {q.question}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isPartial
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isCorrect ? '+1 Pt' : isPartial ? '+0.5 Pt' : '0 Pts'}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-400 space-y-1 mt-1">
                        <div>
                          <span className="text-neutral-500">Your Answer: </span>
                          <span className="text-white font-medium">
                            {record
                              ? typeof record.userAnswer === 'number' && q.options
                                ? q.options[record.userAnswer]
                                : record.userAnswer
                              : 'No answer'}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Benchmark: </span>
                          <span className="text-amber-400 font-medium">
                            {record?.correctAnswerDisplay || q.explanation}
                          </span>
                        </div>
                        {record?.feedback && (
                          <div className="text-neutral-300 italic pt-1">
                            {record.feedback}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={restartQuiz}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Assessment
            </button>
            <button
              onClick={() => {
                setTopicInput('Distributed Systems & Machine Learning');
                setQuestionCount(10);
                setCompleted(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Generate New Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
