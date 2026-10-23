import React, { useState } from 'react';
import { Crown, Star, Flame, Trophy, Award, Sparkles, Filter } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { UserStats } from '../types';

interface MilestoneRange {
  name: string;
  min: number;
  max: number;
}

const TIER_RANGES: Record<string, MilestoneRange> = {
  'Rising Star': { name: 'Rising Star', min: 1, max: 10 },
  'Consistent': { name: 'Consistent', min: 11, max: 20 },
  'Expert': { name: 'Expert', min: 21, max: 50 },
  'Master': { name: 'Master', min: 50, max: 100 },
};

function getTierMilestoneProgress(streak: number, tierName: string) {
  const range = TIER_RANGES[tierName] || { min: 1, max: 10 };
  if (streak <= range.min) return 10; // at least small visible segment
  if (streak >= range.max) return 100;
  const pct = Math.round(((streak - range.min) / (range.max - range.min)) * 100);
  return Math.min(100, Math.max(10, pct));
}

export const Leaderboard: React.FC = () => {
  const { activeLearners, stats, profile } = useStudy();
  const [tierFilter, setTierFilter] = useState<'All' | 'Rising Star' | 'Consistent' | 'Expert' | 'Master'>('All');

  // Ensure active learners includes the current active user if streak > 0 and not already in list
  const combinedLearners: UserStats[] = [...activeLearners];
  if (stats.currentStreak > 0 && !combinedLearners.some((l) => l.uid === stats.uid)) {
    combinedLearners.push(stats);
  }

  // Filter only learners who have actually started their streak (streak > 0)
  const verifiedLearners = combinedLearners
    .filter((learner) => learner.currentStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak);

  const displayedLearners = tierFilter === 'All'
    ? verifiedLearners
    : verifiedLearners.filter((l) => l.tier === tierFilter);

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Scholar Leaderboard
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live & Verified
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Only learners with active streaks are ranked.
            </p>
          </div>
        </div>

        {/* Tier filter pill buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Rising Star', 'Consistent', 'Expert', 'Master'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                tierFilter === tier
                  ? 'bg-amber-500 text-black font-semibold shadow-sm'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="mt-5 space-y-3">
        {displayedLearners.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40">
            <div className="w-12 h-12 mx-auto rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h4 className="text-sm font-semibold text-white">No active learners in this tier yet</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Start your study sessions today to be the first scholar on the board!
            </p>
          </div>
        ) : (
          displayedLearners.map((learner, idx) => {
            const rank = idx + 1;
            const isCurrentUser = learner.uid === stats.uid || learner.uid === profile.uid;
            const progressPct = getTierMilestoneProgress(learner.currentStreak, learner.tier);

            // Progress ring SVG measurements
            const size = 52;
            const strokeWidth = 3;
            const radius = (size - strokeWidth * 2) / 2;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (progressPct / 100) * circumference;

            return (
              <div
                key={learner.uid || idx}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isCurrentUser
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Rank Column */}
                  <div className="w-6 text-center font-bold text-sm">
                    {rank === 1 ? (
                      <span className="text-amber-400 font-extrabold text-base">#1</span>
                    ) : rank === 2 ? (
                      <span className="text-slate-300 font-extrabold text-base">#2</span>
                    ) : rank === 3 ? (
                      <span className="text-amber-600 font-extrabold text-base">#3</span>
                    ) : (
                      <span className="text-neutral-500 text-xs font-semibold">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar with Circular Progress Ring & Rank Badge */}
                  <div className="relative w-[52px] h-[52px] flex items-center justify-center shrink-0">
                    {/* SVG Circular Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      {/* Background track */}
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#27272a"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                      />
                      {/* Active Progress fill */}
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={
                          rank === 1 ? '#F59E0B' : rank === 2 ? '#E2E8F0' : rank === 3 ? '#D97706' : '#EAB308'
                        }
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Cartoon Avatar inside ring */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 p-0.5">
                      <img
                        src={learner.avatarUrl}
                        alt={learner.displayName}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          // Fallback if image path fails
                          const target = e.target as HTMLElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Top 3 Visual Indicator Overlays (Gold Crown, Silver Crown, Bronze Star) */}
                    {rank === 1 && (
                      <div
                        title="Rank #1: Gold Crown"
                        className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-amber-400 border border-neutral-900 flex items-center justify-center text-black shadow-md shadow-amber-500/50"
                      >
                        <Crown className="w-3 h-3 fill-black text-black" />
                      </div>
                    )}
                    {rank === 2 && (
                      <div
                        title="Rank #2: Silver Crown"
                        className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-slate-200 border border-neutral-900 flex items-center justify-center text-neutral-900 shadow-md shadow-slate-400/40"
                      >
                        <Crown className="w-3 h-3 fill-neutral-900 text-neutral-900" />
                      </div>
                    )}
                    {rank === 3 && (
                      <div
                        title="Rank #3: Bronze Star"
                        className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-amber-700 border border-neutral-900 flex items-center justify-center text-white shadow-md shadow-amber-800/40"
                      >
                        <Star className="w-3 h-3 fill-white text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name and tier info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {learner.displayName || 'Scholar'}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="text-neutral-400">{learner.tier}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-neutral-400">{progressPct}% of tier milestone</span>
                    </div>
                  </div>
                </div>

                {/* Streak number column */}
                <div className="flex items-center gap-1.5 text-right">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-base font-bold text-white">{learner.currentStreak}</span>
                  <span className="text-xs text-neutral-400 hidden sm:inline">days</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
