import React, { useState } from 'react';
import { Flame, Shield, Play, CheckCircle2, Calendar } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const StreakActivityTracker: React.FC = () => {
  const { stats, recordStudySession, toggleFreeze } = useStudy();
  const [logging, setLogging] = useState(false);

  const handleStudyLog = async () => {
    setLogging(true);
    await recordStudySession(30);
    setLogging(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const maxMins = Math.max(...stats.weeklyActivity.map(w => w.minutes), 60);

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Streak Status - Notice: NO badge trigger or icon here */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <Flame className="w-8 h-8 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {stats.currentStreak}
              </span>
              <span className="text-amber-500 text-lg font-bold">Days Streak</span>
              {stats.freezeActive && (
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Protected
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Longest: <span className="text-neutral-200 font-semibold">{stats.longestStreak} days</span> • Tier: <span className="text-amber-400 font-semibold">{stats.tier}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleFreeze}
            title={stats.freezeActive ? "Streak Freeze is Active" : "Activate Streak Freeze for 1 Day"}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              stats.freezeActive
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700/60 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <Shield className={`w-4 h-4 ${stats.freezeActive ? 'text-sky-400 fill-sky-400/30' : ''}`} />
            {stats.freezeActive ? 'Freeze ON' : 'Use Freeze'}
          </button>

          <button
            onClick={handleStudyLog}
            disabled={logging}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            {logging ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-black" />
            )}
            Log Study Session (+30m)
          </button>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>Weekly Study Focus</span>
          </div>
          <span className="text-xs text-neutral-400">
            Total this week:{' '}
            <span className="text-white font-semibold">
              {stats.weeklyActivity.reduce((acc, curr) => acc + curr.minutes, 0)} mins
            </span>
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2.5 sm:gap-4 items-end pt-4 pb-2">
          {stats.weeklyActivity.map((dayItem, index) => {
            const isToday = dayItem.date === todayStr;
            const barHeightPercent = Math.max(12, Math.round((dayItem.minutes / maxMins) * 100));

            return (
              <div key={index} className="flex flex-col items-center gap-2 group">
                <div className="text-[10px] text-neutral-500 group-hover:text-amber-400 transition-colors">
                  {dayItem.minutes > 0 ? `${dayItem.minutes}m` : '-'}
                </div>

                {/* Vertical Bar track */}
                <div className="w-full bg-neutral-800/80 rounded-lg h-28 relative flex items-end justify-center p-1 overflow-hidden border border-neutral-800">
                  <div
                    style={{ height: `${barHeightPercent}%` }}
                    className={`w-full rounded-md transition-all duration-500 ${
                      dayItem.completed
                        ? isToday
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/25'
                          : 'bg-gradient-to-t from-amber-700 to-amber-500'
                        : 'bg-neutral-800'
                    }`}
                  />
                  {dayItem.completed && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-300" />
                    </div>
                  )}
                </div>

                <span
                  className={`text-xs font-semibold ${
                    isToday ? 'text-amber-400 underline underline-offset-4' : 'text-neutral-400'
                  }`}
                >
                  {dayItem.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
