import React from 'react';
import { Flame, Award, Medal, Star, Trophy, Crown, Zap, ShieldCheck, CheckCircle2, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useStudy } from '@/context/StudyContext';

const BADGES = [
  { id: 'scholar', name: '7-Day Scholar', minStreak: 7, icon: Award, color: 'text-amber-500', desc: 'Maintain a 7-day study streak.' },
  { id: 'consistent', name: '14-Day Consistent', minStreak: 14, icon: Medal, color: 'text-sky-500', desc: 'Reach 14 consecutive days of consistent study.' },
  { id: 'achiever', name: '20-Day Achiever', minStreak: 20, icon: Star, color: 'text-indigo-400', desc: 'Progress from 14 to 20 days of focused dedication.' },
  { id: 'master', name: 'Monthly Master', minStreak: 30, icon: Sparkles, color: 'text-emerald-500', desc: 'Achieve 30 consecutive days of learning.' },
  { id: 'fifty', name: '50-Day Scholar', minStreak: 50, icon: Zap, color: 'text-yellow-400', desc: 'Reach the 50-day milestone.' },
  { id: 'seventyfive', name: '75-Day Expert', minStreak: 75, icon: Award, color: 'text-orange-400', desc: 'Maintain an expert 75-day study streak.' },
  { id: 'centurion', name: 'Centurion', minStreak: 100, icon: Trophy, color: 'text-violet-500', desc: 'Reach an elite 100-day streak milestone.' },
  { id: 'elite', name: '150-Day Elite', minStreak: 150, icon: Zap, color: 'text-indigo-400', desc: 'Demonstrate 150 days of unwavering dedication.' },
  { id: 'grandmaster', name: '200-Day Grandmaster', minStreak: 200, icon: Crown, color: 'text-amber-400', desc: 'Mastery across 200 consecutive days.' },
  { id: 'persistence', name: '250-Day Persistence', minStreak: 250, icon: ShieldCheck, color: 'text-teal-400', desc: 'Unstoppable momentum over 250 days.' },
  { id: 'legend', name: '300-Day Legend', minStreak: 300, icon: Crown, color: 'text-rose-400', desc: 'The ultimate 300-day scholar badge.' },
];

interface StreakBadgesPageProps {
  setCurrentView: (view: string) => void;
}

export const StreakBadgesPage: React.FC<StreakBadgesPageProps> = ({ setCurrentView }) => {
  const { user } = useStudy();
  const currentStreak = user?.currentStreak || 0;
  const earnedBadges = BADGES.filter(b => currentStreak >= b.minStreak);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in bg-[#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1C1C1C]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D97706] uppercase tracking-wider mb-1 font-['Clash_Display']">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Achievements & Milestones</span>
          </div>
          <h1 className="text-3xl font-semibold text-white font-['Clash_Display']">Streak Badges Category</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Track your consecutive study days step-by-step. Each badge unlocks progressively as your streak advances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-[#0A0A0A] border border-[#222] rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              🔥
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Current Streak</p>
              <p className="text-sm font-bold text-white font-['Clash_Display']">{currentStreak} Days Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#16120A] via-[#0D0D0D] to-[#0A0A0A] border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Sequential Progression System
          </div>
          <h2 className="text-xl font-semibold text-white font-['Clash_Display']">Counted Day-by-Day (e.g., 14 to 20 Days)</h2>
          <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
            Your streak achievements build sequentially. Once you complete 14 days, the next milestone badge counts progressively from 14 towards 20 days, ensuring accurate, transparent progress tracking.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 border border-amber-500/20 px-5 py-3.5 rounded-xl shrink-0">
          <div className="text-center">
            <span className="text-2xl font-extrabold text-amber-400 font-['Clash_Display']">{earnedBadges.length}</span>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Badges Unlocked</p>
          </div>
          <div className="w-[1px] h-8 bg-neutral-800" />
          <div className="text-center">
            <span className="text-2xl font-extrabold text-white font-['Clash_Display']">{BADGES.length}</span>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Total Tiers</p>
          </div>
        </div>
      </div>

      {/* Badges Grid with Sequential Counting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGES.map((badge, idx) => {
          const prevThreshold = idx === 0 ? 0 : BADGES[idx - 1].minStreak;
          const target = badge.minStreak;
          const isUnlocked = currentStreak >= target;

          // Sequential step-by-step progress calculation
          let progress = 0;
          if (isUnlocked) {
            progress = 100;
          } else if (currentStreak <= prevThreshold) {
            progress = 0;
          } else {
            progress = Math.round(((currentStreak - prevThreshold) / (target - prevThreshold)) * 100);
          }

          const currentTierDays = Math.max(0, Math.min(target - prevThreshold, currentStreak - prevThreshold));
          const totalTierDays = target - prevThreshold;

          return (
            <div
              key={badge.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-br from-[#16120A] via-[#0D0D0D] to-[#0A0A0A] border-amber-500/40 shadow-xl shadow-amber-500/5'
                  : 'bg-[#0A0A0A] border-[#1C1C1C] opacity-80'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    isUnlocked
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-lg'
                      : 'bg-[#141414] border-[#262626] text-neutral-600'
                  }`}>
                    {isUnlocked ? <badge.icon className={`w-7 h-7 ${badge.color}`} /> : <Lock className="w-5 h-5 text-neutral-500" />}
                  </div>

                  {isUnlocked ? (
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
                      Tier Target: {badge.minStreak} Days
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white font-['Clash_Display']">{badge.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{badge.desc}</p>
                </div>
              </div>

              {/* Sequential Progress Bar */}
              <div className="pt-4 border-t border-[#1C1C1C] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Sequential Progress ({prevThreshold} → {target}d)</span>
                  <span className={isUnlocked ? 'text-amber-400 font-bold' : 'text-neutral-300'}>
                    {currentTierDays} / {totalTierDays} Days ({progress}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden border border-[#222]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isUnlocked ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-sm' : 'bg-neutral-700'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
