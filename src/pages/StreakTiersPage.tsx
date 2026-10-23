import React from 'react';
import { Award, Flame, Users, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { UserStats } from '../types';

interface TierDefinition {
  name: 'Rising Star' | 'Consistent' | 'Expert' | 'Master';
  range: string;
  minDays: number;
  maxDays: number;
  description: string;
  perks: string[];
  color: string;
  badgeBg: string;
}

const TIERS: TierDefinition[] = [
  {
    name: 'Rising Star',
    range: '1 – 10 Days',
    minDays: 1,
    maxDays: 10,
    description: 'The foundation stage. Establishing basic daily focus routines and active recall habits.',
    perks: ['Profile Badge', 'Basic Streaks Stats', 'Community Recognition'],
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
  },
  {
    name: 'Consistent',
    range: '11 – 20 Days',
    minDays: 11,
    maxDays: 20,
    description: 'Daily study has become natural. Knowledge retention accelerates via consistent spacing.',
    perks: ['Consistent Icon Ring', 'Streak Freeze Access', 'Top Tier Leaderboard Eligibility'],
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
  },
  {
    name: 'Expert',
    range: '21 – 50 Days',
    minDays: 21,
    maxDays: 50,
    description: 'Synaptic reinforcement. Proven mental stamina and mastery over distraction.',
    perks: ['Silver Crown Ranking', 'Advanced Quiz Customization', 'Priority Peer Group Access'],
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
  },
  {
    name: 'Master',
    range: '50+ Days',
    minDays: 50,
    maxDays: 9999,
    description: 'The peak echelon of academic persistence. Unshakable habit and deep subject mastery.',
    perks: ['Golden Crown Tier Indicator', 'Hall of Fame Badge', 'Mastery Multiplier'],
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
  },
];

export const StreakTiersPage: React.FC = () => {
  const { stats, profile, activeLearners } = useStudy();

  // Combine learners, ensuring current user is present if their streak > 0
  const combinedLearners: UserStats[] = [...activeLearners];
  if (stats.currentStreak > 0 && !combinedLearners.some((l) => l.uid === stats.uid)) {
    combinedLearners.push(stats);
  }

  // Filter only real learners who have started their streak (streak > 0)
  const verifiedLearners = combinedLearners.filter((l) => l.currentStreak > 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            Verified Active Scholars Only
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Weekly Streak Tiers
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Progress through tiered mastery brackets based exclusively on real, verified active study streaks.
          </p>
        </div>

        {/* Current user tier card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 border-2 border-amber-500 shrink-0">
            <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Your Current Placement</div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{stats.tier}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                {stats.currentStreak} Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tiers List */}
      <div className="grid grid-cols-1 gap-6">
        {TIERS.map((tier) => {
          // Get verified learners in this specific tier
          const learnersInTier = verifiedLearners.filter((l) => l.tier === tier.name);
          const isUserInThisTier = stats.tier === tier.name && stats.currentStreak > 0;

          return (
            <div
              key={tier.name}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isUserInThisTier
                  ? 'bg-neutral-900/95 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl border text-sm font-bold flex items-center gap-2 ${tier.badgeBg} ${tier.color}`}>
                      <Flame className="w-4 h-4 fill-current" />
                      {tier.name}
                    </div>
                    <span className="text-xs font-semibold text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-md">
                      {tier.range}
                    </span>
                    {isUserInThisTier && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                        YOUR TIER
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Users className="w-4 h-4 text-neutral-500" />
                    <span>
                      {learnersInTier.length} {learnersInTier.length === 1 ? 'active learner' : 'active learners'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-neutral-300 mt-3">{tier.description}</p>

                {/* Tier Perks */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {tier.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-950/60 px-2.5 py-1 rounded-md border border-neutral-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                {/* Active Learners in this Tier or Encouraging Empty State */}
                <div className="mt-6 pt-5 border-t border-neutral-800/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                    <span>Scholars in {tier.name}</span>
                  </h4>

                  {learnersInTier.length === 0 ? (
                    // Encouraging Empty State (NO false data)
                    <div className="py-6 px-4 rounded-xl bg-neutral-950/40 border border-dashed border-neutral-800/90 text-center">
                      <Sparkles className="w-6 h-6 text-amber-500/70 mx-auto mb-2" />
                      <p className="text-xs font-medium text-neutral-300">
                        No learners in this tier yet — complete daily study sessions to claim the first spot!
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Once a learner starts their streak and reaches {tier.minDays} consecutive days, they will be recognized here.
                      </p>
                    </div>
                  ) : (
                    // Verified Learners Grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {learnersInTier.map((scholar, idx) => {
                        const isMe = scholar.uid === stats.uid || (profile && scholar.uid === profile.uid);
                        return (
                          <div
                            key={scholar.uid || idx}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${
                              isMe
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-neutral-950/50 border-neutral-800'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
                              {scholar.avatarUrl && (
                                <img
                                  src={scholar.avatarUrl}
                                  alt={scholar.displayName || 'Scholar'}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>{scholar.displayName}</span>
                                {isMe && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-black font-extrabold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span>{scholar.currentStreak} day streak</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
