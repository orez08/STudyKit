import React from 'react';
import { Flame, Clock, Brain, BookOpen, ChevronRight, Zap, Target, Sparkles, Award } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StreakActivityTracker } from '../components/StreakActivityTracker';
import { Leaderboard } from '../components/Leaderboard';

export const DashboardPage: React.FC = () => {
  const { profile, stats, setActiveTab } = useStudy();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <button
            onClick={() => setActiveTab('settings')}
            className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-neutral-800 border-2 border-amber-500 hover:border-amber-400 shadow-xl shadow-amber-500/20 shrink-0 cursor-pointer transition-transform hover:scale-105"
            title="Click to change your avatar in Account Settings"
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile?.displayName || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            {/* Fallback initial if image fails or loading */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-600 to-amber-400 text-black font-extrabold text-xl">
              {profile?.displayName?.charAt(0) || 'S'}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
              Edit
            </div>
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-1.5">
              <Zap className="w-3 h-3 fill-amber-400" />
              {stats.tier} Tier Scholar
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile?.displayName || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Target goal: <span className="text-neutral-200 font-semibold">{profile?.targetExam || 'Active Recall & Spaced Repetition'}</span>. Your cognitive recall retention is primed today.
            </p>
          </div>
        </div>

        {/* Quick actions right */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setActiveTab('quiz')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            Start AI Quiz
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Flashcards
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.currentStreak}
            <span className="text-xs text-neutral-400 font-normal ml-1">days</span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium block mt-1">
            Tier: {stats.tier}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Study Focus</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {Math.floor(stats.totalMinutesStudied / 60)}h {stats.totalMinutesStudied % 60}m
          </div>
          <span className="text-[11px] text-neutral-400 block mt-1">
            Total active recall time
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Quizzes Solved</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.totalQuizzesTaken}
          </div>
          <span className="text-[11px] text-purple-400 font-medium block mt-1">
            87% avg accuracy
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Flashcards Mastered</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.totalFlashcardsReviewed}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block mt-1">
            Spaced repetition cycle
          </span>
        </div>
      </div>

      {/* Main Focus: Streak Activity Tracker (Clean, No badge icon) */}
      <StreakActivityTracker />

      {/* Leaderboard Section (Progress rings & Top-3 Badges) */}
      <Leaderboard />
    </div>
  );
};
