import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Sliders,
  FileCheck,
  Check,
  XCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PracticeTestItem, PracticeTestQuestion } from '../types';
import confetti from 'canvas-confetti';

export const PracticeTestsPage: React.FC = () => {
  const { documents, practiceTests, addPracticeTest, submitPracticeTest } = useStudy();

  const [mode, setMode] = useState<'list' | 'configure' | 'exam' | 'confirm' | 'review'>(
    practiceTests.length > 0 ? 'list' : 'configure'
  );

  // Configuration Form
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [testTitle, setTestTitle] = useState('Biology 101 Midterm Mock Exam');
  const [subject, setSubject] = useState('Biology');
  const [numQuestions, setNumQuestions] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Exam State
  const [activeTest, setActiveTest] = useState<PracticeTestItem | null>(practiceTests[0] || null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Countdown timer in exam mode
  useEffect(() => {
    if (mode === 'exam' && secondsRemaining > 0) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, secondsRemaining]);

  const handleGenerateTest = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const doc = documents.find((d) => d.id === selectedDocId);
      if (!doc) throw new Error('Please select a reference document.');

      const res = await fetch('/api/ai/practice-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: doc.extractedText || '',
          title: testTitle,
          subject,
          numQuestions,
          durationMinutes,
          passingScore,
          difficulty,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate practice test.');
      }

      const resData = await res.json();
      if (!resData.success || !resData.data) throw new Error('Invalid format returned by AI service.');

      const examData = resData.data;
      const newTest: PracticeTestItem = {
        id: `test-${Date.now()}`,
        docId: selectedDocId,
        title: examData.title || testTitle,
        subject: examData.subject || subject,
        durationMinutes,
        passingScore,
        instructions:
          examData.instructions ||
          'Simulate realistic examination conditions. Answer all questions to the best of your ability before the timer expires.',
        questions: examData.questions,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      await addPracticeTest(newTest);
      startExam(newTest);
    } catch (err: any) {
      console.error('Exam generator error:', err);
      setError(err.message || 'Failed to create practice test.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startExam = (test: PracticeTestItem) => {
    setActiveTest(test);
    setStudentAnswers({});
    setCurrentQIndex(0);
    setSecondsRemaining(test.durationMinutes * 60);
    setStartTime(Date.now());
    setMode('exam');
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleConfirmSubmit = () => {
    setMode('confirm');
  };

  const handleFinalSubmit = async () => {
    if (!activeTest) return;

    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    let totalPoints = 0;
    let earnedPoints = 0;

    const normalizeAns = (str: string) =>
      str.trim().toLowerCase().replace(/^[a-d1-4][\.\)\:\-]\s*/, '').trim();

    activeTest.questions.forEach((q) => {
      totalPoints += q.weight || 10;
      const userAns = (studentAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();
      const isCorrect = userAns === correctAns || (!!userAns && normalizeAns(userAns) === normalizeAns(correctAns));
      if (isCorrect) {
        earnedPoints += q.weight || 10;
      }
    });

    const finalScore = Math.round((earnedPoints / Math.max(1, totalPoints)) * 100);

    await submitPracticeTest(activeTest.id, studentAnswers, finalScore, timeSpentSeconds);

    const evaluatedQuestions = activeTest.questions.map((q) => ({
      ...q,
      userAnswer: studentAnswers[q.id] || '',
      isCorrect:
        (studentAnswers[q.id] || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase(),
    }));

    setActiveTest({
      ...activeTest,
      completed: true,
      score: finalScore,
      passed: finalScore >= activeTest.passingScore,
      timeSpentSeconds,
      questions: evaluatedQuestions,
    });

    setMode('review');

    if (finalScore >= activeTest.passingScore) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleAutoSubmit = () => {
    handleFinalSubmit();
  };

  const currentQ = activeTest?.questions[currentQIndex];
  const unansweredCount = activeTest
    ? activeTest.questions.filter((q) => !studentAnswers[q.id]).length
    : 0;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Timed Exam Simulation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
            Practice Tests & Mock Exams
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Simulate realistic exam conditions under time pressure with instant grading and review.
          </p>
        </div>

        {mode !== 'exam' && mode !== 'confirm' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('configure')}
              className="px-4 py-2 bg-[#F2C230] hover:bg-[#e0b127] text-black font-semibold text-xs rounded-xl shadow-sm"
            >
              + Create Mock Exam
            </button>
            <button
              onClick={() => setMode('list')}
              className="px-4 py-2 bg-[#252525] hover:bg-[#2F2F2F] text-white text-xs font-semibold rounded-xl"
            >
              Saved Exams ({practiceTests.length})
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: CONFIGURE TEST */}
      {mode === 'configure' && (
        <div className="bg-[#1C1C1C] border border-[#2B2B2B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F2C230]" />
            <span>Exam Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Reference Document
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Test Title</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Duration (Minutes)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value={10}>10 Minutes (Express)</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Full Mock)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Passing Score (%)
              </label>
              <select
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value={60}>60% (Pass standard)</option>
                <option value={70}>70% (Merit)</option>
                <option value={80}>80% (Distinction)</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateTest}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#F2C230] hover:bg-[#e0b127] text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Synthesizing Exam Questions...' : 'Generate Practice Exam'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: TAKING THE EXAM */}
      {mode === 'exam' && activeTest && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Box */}
          <div className="lg:col-span-8 bg-[#1C1C1C] border border-[#2B2B2B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A]">
              <div>
                <span className="text-[10px] font-mono text-[#F2C230] uppercase font-bold tracking-wider">
                  {activeTest.subject} · {activeTest.title}
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Question <strong className="text-white">{currentQIndex + 1}</strong> of{' '}
                  {activeTest.questions.length}
                </p>
              </div>

              {/* Countdown timer */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-950/40 border border-red-800/80 font-mono text-xs text-red-200">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span className="tabular-nums font-bold">
                  {Math.floor(secondsRemaining / 60)}:
                  {(secondsRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options && currentQ.options.length > 0 ? (
                currentQ.options.map((opt, oIdx) => {
                  const isSelected = studentAnswers[currentQ.id] === opt;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswerSelect(currentQ.id, opt)}
                      className={`w-full p-4 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#292929] border-[#F2C230] text-white shadow-sm'
                          : 'bg-[#181818] border-[#2B2B2B] text-neutral-300 hover:bg-[#222222]'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#F2C230] bg-[#F2C230]' : 'border-neutral-500'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <textarea
                  rows={4}
                  value={studentAnswers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
                  placeholder="Type your exam response here..."
                  className="w-full bg-[#141414] border border-[#333333] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#F2C230]"
                />
              )}
            </div>

            {/* Bottom Question Controls */}
            <div className="pt-4 border-t border-[#2A2A2A] flex items-center justify-between">
              <button
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="px-4 py-2 bg-[#262626] hover:bg-[#303030] text-white text-xs font-semibold rounded-lg disabled:opacity-40 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  if (currentQIndex < activeTest.questions.length - 1) {
                    setCurrentQIndex(currentQIndex + 1);
                  } else {
                    handleConfirmSubmit();
                  }
                }}
                className="px-5 py-2.5 bg-[#F2C230] hover:bg-[#e0b127] text-black text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <span>
                  {currentQIndex < activeTest.questions.length - 1 ? 'Next Question' : 'Review & Submit'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Question Number Panel & Status */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#1C1C1C] border border-[#2B2B2B] rounded-2xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Question Navigator
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {activeTest.questions.map((q, idx) => {
                  const isAnswered = !!studentAnswers[q.id];
                  const isCurrent = currentQIndex === idx;
                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-9 rounded-lg font-mono text-xs font-bold transition-all ${
                        isCurrent
                          ? 'ring-2 ring-[#F2C230] bg-[#333333] text-white'
                          : isAnswered
                          ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                          : 'bg-[#161616] border border-[#2E2E2E] text-neutral-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#2A2A2A] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Answered:</span>
                  <span className="font-mono text-white font-bold">
                    {activeTest.questions.length - unansweredCount} / {activeTest.questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Unanswered:</span>
                  <span
                    className={`font-mono font-bold ${
                      unansweredCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {unansweredCount}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmSubmit}
                className="w-full py-2.5 bg-[#F2C230] hover:bg-[#e0b127] text-black font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CONFIRMATION SCREEN */}
      {mode === 'confirm' && activeTest && (
        <div className="max-w-xl mx-auto bg-[#1C1C1C] border border-[#2B2B2B] rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#F2C230] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-white font-['Outfit']">Ready to submit your exam?</h2>

          <div className="p-4 rounded-xl bg-[#141414] border border-[#282828] text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Total Questions:</span>
              <span className="font-mono text-white">{activeTest.questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Answered:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {activeTest.questions.length - unansweredCount}
              </span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Unanswered Questions:</span>
                <span className="font-mono">{unansweredCount}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-400">
            Once submitted, your responses will be evaluated against source criteria and cannot be
            altered.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setMode('exam')}
              className="px-5 py-2.5 bg-[#262626] hover:bg-[#303030] text-white text-xs font-semibold rounded-xl"
            >
              Return to Questions
            </button>
            <button
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl shadow-md"
            >
              Confirm and Submit Now
            </button>
          </div>
        </div>
      )}

      {/* VIEW 4: REVIEW MODE */}
      {mode === 'review' && activeTest && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F2C230]">
              Exam Evaluation
            </span>
            <h2 className="text-5xl font-extrabold font-mono text-white tabular-nums">
              {activeTest.score}%
            </h2>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase">
              {activeTest.passed ? (
                <span className="text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                  Passed (Target: {activeTest.passingScore}%)
                </span>
              ) : (
                <span className="text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800">
                  Needs Revision (Target: {activeTest.passingScore}%)
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => startExam(activeTest)}
                className="px-4 py-2 bg-[#262626] hover:bg-[#303030] text-white text-xs font-semibold rounded-lg flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Exam</span>
              </button>
              <button
                onClick={() => setMode('list')}
                className="px-4 py-2 bg-[#F2C230] text-black text-xs font-semibold rounded-lg"
              >
                Back to Exam List
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Comprehensive Answer Analysis
            </h3>
            {activeTest.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className={`p-5 rounded-xl border space-y-3 ${
                  q.isCorrect
                    ? 'bg-[#1C241D] border-emerald-800/60'
                    : 'bg-[#261C1C] border-red-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">Q{idx + 1}.</span>
                    <h4 className="text-sm font-semibold text-white">{q.question}</h4>
                  </div>
                  {q.isCorrect ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      +{q.weight || 10} pts
                    </span>
                  ) : (
                    <span className="text-xs text-red-400 font-bold flex items-center gap-1 shrink-0">
                      <XCircle className="w-4 h-4" />0 pts
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-[#181818] border border-[#2E2E2E]">
                    <span className="text-[10px] text-neutral-400 block">Your Response:</span>
                    <span className={q.isCorrect ? 'text-emerald-300' : 'text-red-300'}>
                      {q.userAnswer || 'No response entered'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#181818] border border-[#2E2E2E]">
                    <span className="text-[10px] text-neutral-400 block">Correct Solution:</span>
                    <span className="text-emerald-400 font-medium">{q.correctAnswer}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-neutral-300 leading-relaxed border-t border-[#2A2A2A]">
                  <strong className="text-white">Explanation: </strong>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: EXAM LIST */}
      {mode === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit']">Your Practice Exams</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {practiceTests.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-xl bg-[#1C1C1C] border border-[#2B2B2B] hover:border-[#F2C230]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{t.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                    <span>{t.subject}</span>
                    <span>·</span>
                    <span>{t.questions.length} Questions</span>
                    <span>·</span>
                    <span>{t.durationMinutes} Minutes</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {t.completed ? (
                    <span className="text-base font-mono font-bold text-[#F2C230]">
                      {t.score}% Score
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-500 italic">Not taken</span>
                  )}
                  <button
                    onClick={() => startExam(t)}
                    className="px-4 py-2 bg-[#F2C230] text-black text-xs font-bold rounded-lg shadow-sm"
                  >
                    {t.completed ? 'Retake Exam' : 'Start Simulation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
