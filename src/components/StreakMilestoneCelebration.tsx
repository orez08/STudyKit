import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles, X, Flame } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const StreakMilestoneCelebration: React.FC = () => {
  const { user } = useStudy();
  const [celebrationStreak, setCelebrationStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !user.currentStreak) return;
    const currentStreak = user.currentStreak;
    const lastCelebrated = localStorage.getItem('studykit_last_celebrated_streak');

    // Trigger celebration on specific milestones (7, 14, 30, or every 10 days e.g. 20, 30, 40...)
    const isMilestone = currentStreak === 7 || currentStreak === 14 || currentStreak % 10 === 0;

    if (isMilestone && lastCelebrated !== String(currentStreak)) {
      setCelebrationStreak(currentStreak);
      localStorage.setItem('studykit_last_celebrated_streak', String(currentStreak));
    }
  }, [user?.currentStreak]);

  if (!celebrationStreak) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-gradient-to-b from-[#1E170C] via-[#0D0D0D] to-[#0A0A0A] border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl shadow-amber-500/20 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => setCelebrationStreak(null)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-300/40 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30 animate-bounce">
          <Trophy className="w-10 h-10 text-amber-100" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Milestone Unlocked!
          </div>
          <h2 className="text-3xl font-extrabold text-white font-['Clash_Display']">
            {celebrationStreak}-Day Streak!
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Incredible dedication! You have maintained an unbroken {celebrationStreak}-day study momentum. Keep pushing forward!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/20 flex items-center justify-center gap-3">
          <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
          <span className="text-sm font-semibold text-white font-mono">Tier Achievement Unlocked</span>
        </div>

        <button
          onClick={() => setCelebrationStreak(null)}
          className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};
