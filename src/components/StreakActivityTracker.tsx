import React, { useState } from 'react';
import { Flame, Zap } from 'lucide-react';
import { useStudy } from '@/context/StudyContext';

export const StreakActivityTracker: React.FC = () => {
  const { user } = useStudy();
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [customStreak, setCustomStreak] = useState<number | null>(null);

  const baseStreak = user?.currentStreak || 4;
  const currentStreak = customStreak !== null ? customStreak : baseStreak;

  const days = [
    { name: 'Mon', hours: 1.5, active: true },
    { name: 'Tue', hours: 2.0, active: true },
    { name: 'Wed', hours: 2.5, active: true },
    { name: 'Thu', hours: 1.8, active: true },
    { name: 'Fri', hours: 3.0, active: true },
    { name: 'Sat', hours: checkedInToday ? 2.2 : 0.5, active: checkedInToday },
    { name: 'Sun', hours: 0.2, active: false },
  ];

  const todayIndex = (new Date().getDay() + 6) % 7; // 0 for Mon, 6 for Sun

  const handleCheckIn = () => {
    if (!checkedInToday) {
      setCheckedInToday(true);
      setCustomStreak(currentStreak + 1);
    }
  };

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
        <div className="text-right flex items-center gap-4">
          <div>
            <span className="text-2xl font-extrabold text-white font-['Clash_Display']">
              {currentStreak} Days
            </span>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Current Streak</p>
          </div>
          {!checkedInToday && (
            <button
              onClick={handleCheckIn}
              className="px-3.5 py-2 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Check In</span>
            </button>
          )}
        </div>
      </div>

      {/* Bar Chart Representation */}
      <div className="pt-2">
        <div className="flex items-end justify-between gap-3 h-36 px-4 bg-[#050505] border border-[#1C1C1C] rounded-xl pt-6 pb-3 streak-chart-container">
          {days.map((item, idx) => {
            const isToday = idx === todayIndex;
            const isActive = (idx <= todayIndex && idx >= Math.max(0, todayIndex - currentStreak + 1)) || (checkedInToday && isToday) || item.active;
            const heightPercent = Math.min(100, Math.max(15, (item.hours / 3.5) * 100));

            return (
              <div key={item.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.hours}h
                </span>
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
