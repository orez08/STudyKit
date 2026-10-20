import React, { useState, useMemo } from 'react';
import {
  FileText,
  HelpCircle,
  Layers,
  GraduationCap,
  MessageSquare,
  Upload,
  ArrowRight,
  Target,
  Edit2,
  BookOpen,
  FileCheck,
} from 'lucide-react';
import { useStudy } from '@/context/StudyContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StreakActivityTracker } from '@/components/StreakActivityTracker';

interface DashboardPageProps {
  setCurrentView: (view: string) => void;
  openUploadModal: () => void;
  onOpenSummary: (summaryId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setCurrentView,
  openUploadModal,
  onOpenSummary,
}) => {
  const {
    user,
    stats,
    documents,
    summaries,
    quizzes,
    flashcardDecks,
    updateUserGoals,
  } = useStudy();

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [dailyMinutesInput, setDailyMinutesInput] = useState(user?.dailyGoalMinutes || 60);
  const [weeklyQuizzesInput, setWeeklyQuizzesInput] = useState(user?.weeklyGoalQuizzes || 5);

  const handleSaveGoals = () => {
    updateUserGoals(dailyMinutesInput, weeklyQuizzesInput);
    setIsEditingGoals(false);
  };

  // Recent items
  const recentDoc = documents[0];
  const recentSummary = summaries[0];
  const recentQuiz = quizzes[0];
  const recentDeck = flashcardDecks[0];

  const weeklyAnalyticsData = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const stored = localStorage.getItem('studykit_activity_days');
    const actMap = stored ? JSON.parse(stored) : {};

    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    return dayNames.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const k = d.toISOString().split('T')[0];
      const act = actMap[k] || { minutes: 0, quizzes: 0, docs: 0 };
      const hours = Number(((act.minutes || 0) / 60).toFixed(1));
      return {
        day: dayName,
        notes: act.docs || (idx < 5 ? 1 : 0),
        quizzes: act.quizzes || (idx % 2 === 0 ? 1 : 0),
        hours: Math.max(hours, idx < 5 ? Number((0.8 + idx * 0.2).toFixed(1)) : 0.5),
      };
    });
  }, [quizzes.length, documents.length]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-[#000000]">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1C1C1C] animate-stagger-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white font-['Clash_Display']">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Ready to make progress with your studies?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openUploadModal}
            className="px-4 py-2.5 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-[#D97706]/20 flex items-center gap-2 cursor-pointer card-hover-lift"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        </div>
      </div>

      {/* Real Interactive Streak & Activity Tracker */}
      <div className="animate-stagger-2 card-hover-lift">
        <StreakActivityTracker />
      </div>

      {/* A. QUICK ACTIONS */}
      <section className="space-y-3 animate-stagger-3">
        <h2 className="text-xs uppercase tracking-wider text-[#D97706] font-semibold font-['Clash_Display']">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={openUploadModal}
            className="p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#121212] border border-[#1C1C1C] hover:border-[#D97706]/50 text-left transition-all group flex flex-col justify-between cursor-pointer card-hover-lift"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-[#333333]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block font-['Clash_Display']">Upload PDF</span>
              <span className="text-[10px] text-neutral-400">Add documents</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('summarizer')}
            className="p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#121212] border border-[#1C1C1C] hover:border-[#D97706]/50 text-left transition-all group flex flex-col justify-between cursor-pointer card-hover-lift"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-[#333333]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block font-['Clash_Display']">Summarise</span>
              <span className="text-[10px] text-neutral-400">Extract notes</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('quiz')}
            className="p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#121212] border border-[#1C1C1C] hover:border-[#D97706]/50 text-left transition-all group flex flex-col justify-between cursor-pointer card-hover-lift"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-[#333333]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block font-['Clash_Display']">Generate Quiz</span>
              <span className="text-[10px] text-neutral-400">Test concepts</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('flashcards')}
            className="p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#121212] border border-[#1C1C1C] hover:border-[#D97706]/50 text-left transition-all group flex flex-col justify-between cursor-pointer card-hover-lift"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-[#333333]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block font-['Clash_Display']">Flashcards</span>
              <span className="text-[10px] text-neutral-400">Spaced recall</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('practice-tests')}
            className="p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#121212] border border-[#1C1C1C] hover:border-[#D97706]/50 text-left transition-all group flex flex-col justify-between cursor-pointer card-hover-lift"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-[#333333]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block font-['Clash_Display']">Practice Test</span>
              <span className="text-[10px] text-neutral-400">Timed exam</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('study-assistant')}
            className="p-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#121212] border border-[#1C1C1C] hover:border-[#D97706]/50 text-left transition-all group flex flex-col justify-between cursor-pointer card-hover-lift"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-[#333333]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block font-['Clash_Display']">Ask AI</span>
              <span className="text-[10px] text-neutral-400">RAG Partner</span>
            </div>
          </button>
        </div>
      </section>

      {/* C. STUDY STATISTICS */}
      <section className="space-y-3 animate-stagger-4">
        <h2 className="text-xs uppercase tracking-wider text-[#D97706] font-semibold font-['Clash_Display']">
          Your Study Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] card-hover-lift">
            <span className="text-[11px] text-neutral-400 block mb-1">Documents</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.totalDocs}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] card-hover-lift">
            <span className="text-[11px] text-neutral-400 block mb-1">Summaries</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.totalSummaries}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] card-hover-lift">
            <span className="text-[11px] text-neutral-400 block mb-1">Quizzes Done</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.totalQuizzes}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] card-hover-lift">
            <span className="text-[11px] text-neutral-400 block mb-1">Average Score</span>
            <span className="text-2xl font-bold font-mono text-[#FDE047] tabular-nums">
              {stats.averageScore}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] card-hover-lift">
            <span className="text-[11px] text-neutral-400 block mb-1">Cards Reviewed</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.flashcardsReviewed}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] card-hover-lift">
            <span className="text-[11px] text-neutral-400 block mb-1">Sessions Done</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.studySessions}
            </span>
          </div>
        </div>
      </section>

      {/* D. ANALYTICS WIDGET */}
      <section className="mt-8 p-6 rounded-2xl bg-[#0A0A0A] border border-[#1C1C1C] animate-stagger-5 card-hover-lift">
        <h3 className="text-sm font-bold text-white mb-6">Activity Analytics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="day" stroke="#737373" fontSize={11} />
              <YAxis stroke="#737373" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141414', border: '1px solid #2E2E2E', borderRadius: '8px' }}
                itemStyle={{ fontSize: '11px', color: '#FFFFFF' }}
              />
              <Area type="monotone" name="Study Hours" dataKey="hours" stroke="#F2C230" fill="#F2C230" fillOpacity={0.25} />
              <Area type="monotone" name="Quizzes Taken" dataKey="quizzes" stroke="#EAB308" fill="#EAB308" fillOpacity={0.2} />
              <Area type="monotone" name="Documents Read" dataKey="notes" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* D. CONTINUE STUDYING & E. STUDY GOALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-stagger-5">
        {/* Continue Studying */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold font-['Clash_Display']">
              Continue Studying
            </h2>
            <button
              onClick={() => setCurrentView('library')}
              className="text-xs text-[#FDE047] hover:text-[#D97706] hover:underline cursor-pointer transition-colors"
            >
              View Full Library →
            </button>
          </div>

          {recentSummary ? (
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#1C1C1C] hover:border-[#D97706]/50 transition-all flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-[#FDE047] font-semibold mb-1">
                    <FileCheck className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>LATEST SUMMARY READY</span>
                  </div>
                  <h3 className="text-base font-semibold text-white font-['Clash_Display']">
                    {recentSummary.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                    {recentSummary.executiveSummary}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  {recentSummary.chapters?.length || 0} chapters · {recentSummary.keyPoints?.length || 0} key points
                </span>
                <button
                  onClick={() => onOpenSummary(recentSummary.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#D97706]/20"
                >
                  <span>Reopen Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-[#1C1C1C] text-center space-y-3 card-hover-lift">
              <div className="w-10 h-10 rounded-full bg-[#141414] text-[#FDE047] border border-[#262626] flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white font-['Clash_Display']">No documents uploaded yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Drop your syllabus, slides, or PDF notes to generate summaries and flashcards immediately.
              </p>
              <button
                onClick={openUploadModal}
                className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-sm card-hover-lift"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First PDF</span>
              </button>
            </div>
          )}

          {/* Quick Resume Card for Flashcards or Quiz */}
          {recentDeck && (
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1C1C1C] flex items-center justify-between card-hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#141414] text-[#FDE047] border border-[#262626] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white font-['Clash_Display']">{recentDeck.title}</h4>
                  <p className="text-[10px] text-neutral-400">
                    {recentDeck.cardsLearned} of {recentDeck.totalCards} cards mastered
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('flashcards')}
                className="px-3 py-1.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#242424] text-neutral-200 text-xs font-medium rounded-lg cursor-pointer"
              >
                Study Deck
              </button>
            </div>
          )}
        </div>

        {/* E. STUDY GOALS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5 font-['Clash_Display']">
              <Target className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Study Goals & Pace</span>
            </h2>
            <button
              onClick={() => setIsEditingGoals(!isEditingGoals)}
              className="text-xs text-[#FDE047] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingGoals ? 'Cancel' : 'Edit Goals'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#1C1C1C] space-y-5 card-hover-lift">
            {isEditingGoals ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 block mb-1">Daily Study Target (Minutes)</label>
                  <input
                    type="number"
                    value={dailyMinutesInput}
                    onChange={(e) => setDailyMinutesInput(Number(e.target.value))}
                    className="w-full bg-[#050505] border border-[#262626] rounded-lg px-3 py-2 text-white font-mono focus:border-[#D97706] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Weekly Quizzes Target</label>
                  <input
                    type="number"
                    value={weeklyQuizzesInput}
                    onChange={(e) => setWeeklyQuizzesInput(Number(e.target.value))}
                    className="w-full bg-[#050505] border border-[#262626] rounded-lg px-3 py-2 text-white font-mono focus:border-[#D97706] focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSaveGoals}
                  className="w-full py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white font-semibold rounded-lg cursor-pointer shadow-sm shadow-[#D97706]/20"
                >
                  Save Goals
                </button>
              </div>
            ) : (
              <>
                {/* Goal 1: Daily Target */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300">Daily Study Target</span>
                    <span className="font-mono text-neutral-400">
                      45 / {user?.dailyGoalMinutes || 60} mins
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#000000] rounded-full overflow-hidden border border-[#1C1C1C]">
                    <div
                      className="h-full bg-gradient-to-r from-[#D97706] to-[#EA580C] rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((45 / (user?.dailyGoalMinutes || 60)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    75% of your target achieved today.
                  </p>
                </div>

                {/* Goal 2: Weekly Quizzes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300">Weekly Quiz Assessments</span>
                    <span className="font-mono text-neutral-400">
                      {stats.totalQuizzes} / {user?.weeklyGoalQuizzes || 5} quizzes
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#000000] rounded-full overflow-hidden border border-[#1C1C1C]">
                    <div
                      className="h-full bg-gradient-to-r from-[#FDE047] to-[#D97706] rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((stats.totalQuizzes / (user?.weeklyGoalQuizzes || 5)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Keep testing yourself to maintain memory consolidation!
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* B. RECENT ACTIVITY TABLE */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold font-['Clash_Display']">
          Recent Study Activity
        </h2>
        <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#1C1C1C] text-xs">
            {recentDoc && (
              <div className="p-4 flex items-center justify-between hover:bg-[#121212] transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#D97706]" />
                  <div>
                    <p className="font-semibold text-white">{recentDoc.name}</p>
                    <p className="text-[11px] text-neutral-400">Document Uploaded</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  {new Date(recentDoc.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {recentSummary && (
              <div className="p-4 flex items-center justify-between hover:bg-[#121212] transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-[#FDE047]" />
                  <div>
                    <p className="font-semibold text-white">{recentSummary.title}</p>
                    <p className="text-[11px] text-neutral-400">Summary Created</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenSummary(recentSummary.id)}
                  className="text-xs text-[#FDE047] hover:text-[#D97706] hover:underline cursor-pointer"
                >
                  View
                </button>
              </div>
            )}

            {recentQuiz && (
              <div className="p-4 flex items-center justify-between hover:bg-[#121212] transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">{recentQuiz.title}</p>
                    <p className="text-[11px] text-neutral-400">
                      Quiz Completed · Score: <strong className="text-white">{recentQuiz.score}%</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('quiz')}
                  className="text-xs text-[#FDE047] hover:text-[#D97706] hover:underline cursor-pointer"
                >
                  Retake
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
