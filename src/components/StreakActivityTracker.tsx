import React from 'react';
import { Flame, Award, Medal, Star, Trophy } from 'lucide-react';
import { useStudy } from '@/context/StudyContext';

const BADGES = [
  { id: 'scholar', name: '7-Day Scholar', minStreak: 7, icon: Award, color: 'text-amber-500', animation: 'animate-bounce' },
  { id: 'consistent', name: '14-Day Consistent', minStreak: 14, icon: Medal, color: 'text-sky-500', animation: 'animate-pulse' },
  { id: 'master', name: 'Monthly Master', minStreak: 30, icon: Star, color: 'text-emerald-500', animation: 'animate-bounce' },
  { id: 'centurion', name: 'Centurion', minStreak: 100, icon: Trophy, color: 'text-violet-500', animation: 'animate-pulse' },
];

export const StreakActivityTracker: React.FC = () => {
  const { user } = useStudy();

  const currentStreak = user?.currentStreak || 0;
  const lastStudyDate = user?.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : '';
  const earnedBadges = BADGES.filter(b => currentStreak >= b.minStreak);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toDateString(),
    };
  });

  const todayIndex = 6; // last element is today

  if (!user || user.currentStreak === 0) return null;

  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
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
        
        {/* Badges Display */}
        <div className="flex gap-2">
            {earnedBadges.map(badge => (
                <div key={badge.id} className={`p-2 rounded-full bg-neutral-900 border border-neutral-800 ${badge.animation}`} title={badge.name}>
                    <badge.icon className={`w-5 h-5 ${badge.color}`} />
                </div>
            ))}
        </div>

        <div className="text-right">
          <span className="text-2xl font-extrabold text-white font-['Clash_Display']">
            {currentStreak} Days
          </span>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Current Streak</p>
          <p className="text-xs text-sky-400 font-semibold mt-1">
            ❄️ {user?.streakFreezes || 0} Freezes Available
          </p>
        </div>
      </div>

      {/* Bar Chart Representation */}
      <div className="pt-2">
        <div className="flex items-end justify-between gap-3 h-36 px-4 bg-[#050505] border border-[#1C1C1C] rounded-xl pt-6 pb-3 streak-chart-container">
          {days.map((item, idx) => {
            const isToday = idx === todayIndex;
            const isActive = item.date === lastStudyDate;
            const heightPercent = isActive ? 80 : 30;

            return (
              <div key={item.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full max-w-[36px] bg-[#141414] rounded-t-lg overflow-hidden h-full flex items-end border border-[#222222] streak-bar-track">
                  <div
                    className={`w-full transition-all duration-500 rounded-t-lg ${
                      isActive
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20 streak-bar-active'
                        : 'bg-neutral-800 streak-bar-inactive'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${isToday ? 'text-amber-400 font-bold' : 'text-neutral-400'} streak-day-label`}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
