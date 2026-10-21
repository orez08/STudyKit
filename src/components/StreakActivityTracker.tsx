import React, { useState } from 'react';
import { Flame, Award, Medal, Star, Trophy, Crown, Zap, ShieldCheck, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { useStudy } from '@/context/StudyContext';

const BADGES = [
  { id: 'scholar', name: '7-Day Scholar', minStreak: 7, icon: Award, color: 'text-amber-500', desc: 'Maintain a 7-day study streak.', animation: 'animate-bounce' },
  { id: 'consistent', name: '14-Day Consistent', minStreak: 14, icon: Medal, color: 'text-sky-500', desc: 'Unlock bonus Streak Freezes and 14 days of consistency.', animation: 'animate-pulse' },
  { id: 'master', name: 'Monthly Master', minStreak: 30, icon: Star, color: 'text-emerald-500', desc: 'Achieve 30 consecutive days of focused learning.', animation: 'animate-bounce' },
  { id: 'centurion', name: 'Centurion', minStreak: 100, icon: Trophy, color: 'text-violet-500', desc: 'Reach an elite 100-day streak milestone.', animation: 'animate-pulse' },
  { id: 'elite', name: '150-Day Elite', minStreak: 150, icon: Zap, color: 'text-indigo-400', desc: 'Demonstrate 150 days of unwavering dedication.', animation: 'animate-bounce' },
  { id: 'grandmaster', name: '200-Day Grandmaster', minStreak: 200, icon: Crown, color: 'text-amber-400', desc: 'Mastery across 200 consecutive days.', animation: 'animate-pulse' },
  { id: 'persistence', name: '250-Day Persistence', minStreak: 250, icon: ShieldCheck, color: 'text-teal-400', desc: 'Unstoppable momentum over 250 days.', animation: 'animate-bounce' },
  { id: 'legend', name: '300-Day Legend', minStreak: 300, icon: Crown, color: 'text-rose-400', desc: 'The ultimate 300-day scholar badge.', animation: 'animate-pulse' },
];

export const StreakActivityTracker: React.FC = () => {
  const { user } = useStudy();
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  const currentStreak = user?.currentStreak || 0;
  const earnedBadges = BADGES.filter(b => currentStreak >= b.minStreak);

  // Accurate 7-day calculation: current streak covers the last N days up to today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    // A day is active if it falls within the current streak window ending today
    // i.e., index >= (7 - Math.min(7, currentStreak))
    const isActive = i >= (7 - Math.min(7, currentStreak)) && currentStreak > 0;
    
    return {
      name: dayName,
      date: d.toDateString(),
      isActive,
      height: isActive ? (i === 6 ? 95 : 75 + (i * 3) % 15) : 25,
    };
  });

  const todayIndex = 6;

  if (!user || user.currentStreak === 0) return null;

  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black border border-[#333333] flex items-center justify-center text-white shadow-md">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white font-['Clash_Display']">
              Study Streak & Weekly Activity
            </h3>
            <p className="text-xs text-neutral-400">
              Consistency builds mastery. Keep your momentum!
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBadgesModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Streak Badges ({earnedBadges.length}/{BADGES.length})</span>
          </button>
        </div>

        <div className="text-right sm:text-right">
          <span className="text-2xl font-extrabold text-white font-['Clash_Display']">
            {currentStreak} Days
          </span>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Current Streak</p>
          <p className="text-xs text-sky-400 font-semibold mt-1">
            ❄️ {user?.streakFreezes || 0} Freezes Available
          </p>
        </div>
      </div>

      {/* Accurate Bar Chart Representation */}
      <div className="pt-2">
        <div className="flex items-end justify-between gap-3 h-36 px-4 bg-[#050505] border border-[#1C1C1C] rounded-xl pt-6 pb-3 streak-chart-container">
          {days.map((item, idx) => {
            const isToday = idx === todayIndex;

            return (
              <div key={item.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full max-w-[36px] bg-[#141414] rounded-t-lg overflow-hidden h-full flex items-end border border-[#222222] streak-bar-track">
                  <div
                    className={`w-full transition-all duration-500 rounded-t-lg ${
                      item.isActive
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20 streak-bar-active'
                        : 'bg-neutral-800 streak-bar-inactive'
                    }`}
                    style={{ height: `${item.height}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${isToday ? 'text-amber-400 font-bold' : 'text-neutral-400'} streak-day-label`}>
                  {item.name} {item.isActive && '🔥'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Badges & Achievements Category Modal */}
      {showBadgesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0D0D0D] border border-[#262626] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#222]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white font-['Clash_Display']">Streak Badges & Achievements</h3>
                  <p className="text-xs text-neutral-400">Unlock legendary badges as your consistency grows.</p>
                </div>
              </div>
              <button
                onClick={() => setShowBadgesModal(false)}
                className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#222] text-neutral-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BADGES.map((badge) => {
                const isUnlocked = currentStreak >= badge.minStreak;
                const progress = Math.min(100, Math.round((currentStreak / badge.minStreak) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-[#16120A] to-[#0A0A0A] border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : 'bg-[#0A0A0A] border-[#1C1C1C] opacity-75'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-md'
                        : 'bg-[#141414] border-[#262626] text-neutral-600'
                    }`}>
                      {isUnlocked ? <badge.icon className={`w-6 h-6 ${badge.color}`} /> : <Lock className="w-5 h-5 text-neutral-500" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white font-['Clash_Display'] truncate">{badge.name}</h4>
                        {isUnlocked ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-amber-400" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                            {badge.minStreak} Days
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">{badge.desc}</p>

                      {!isUnlocked && (
                        <div className="pt-2 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                            <span>Progress</span>
                            <span>{currentStreak} / {badge.minStreak} Days ({progress}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden border border-[#222]">
                            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-[#121212] border border-[#222] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Current Streak Momentum</p>
                <p className="text-xs text-neutral-400 mt-0.5">Study daily to maintain your streak and earn exclusive milestone honors.</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-amber-400 font-['Clash_Display']">{currentStreak} Days Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
