import React, { useState } from 'react';
import { Award, Lock, Zap, Sparkles, Flame, Shield, Trophy, Brain, Crown, Star, Medal, Check } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ALL_STREAK_BADGES } from '../data/badges';
import { StreakBadge } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Sparkles,
  Flame,
  Shield,
  Trophy,
  Brain,
  Crown,
  Star,
  Medal,
};

export const StreakBadgesPage: React.FC = () => {
  const { stats } = useStudy();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Initiation', 'Consistency', 'Endurance', 'Ascent'];

  const filteredBadges = ALL_STREAK_BADGES.filter(
    (b) => filterCategory === 'All' || b.category === filterCategory
  );

  const unlockedCount = ALL_STREAK_BADGES.filter((b) => stats.currentStreak >= b.requiredDays).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Milestone Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Streak Badges & Honors
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Permanent academic awards unlocked through unbroken consecutive days of focused study.
          </p>
        </div>

        {/* Progress summary card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Badges Unlocked</div>
            <div className="text-base font-bold text-white flex items-center gap-1.5">
              <span>{unlockedCount}</span>
              <span className="text-neutral-500 font-normal">/ {ALL_STREAK_BADGES.length}</span>
            </div>
            <div className="w-32 bg-neutral-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / ALL_STREAK_BADGES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredBadges.map((badge: StreakBadge) => {
          const isUnlocked = stats.currentStreak >= badge.requiredDays;
          const daysLeft = badge.requiredDays - stats.currentStreak;
          const IconComponent = ICON_MAP[badge.iconName] || Award;

          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-neutral-900/95 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-neutral-950/70 border-neutral-800/80 opacity-75'
              }`}
            >
              {/* Unlocked / Locked Top Status */}
              <div className="flex items-start justify-between">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${
                    isUnlocked
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                  }`}
                >
                  <IconComponent className={`w-7 h-7 ${isUnlocked ? 'stroke-[2.2]' : ''}`} />
                </div>

                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                    <Lock className="w-3 h-3" />
                    {daysLeft} days to go
                  </span>
                )}
              </div>

              {/* Title & Info */}
              <div className="my-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-amber-500">
                    {badge.requiredDays} Day Streak
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    • {badge.rarity}
                  </span>
                </div>
                <h3 className={`text-base font-bold ${isUnlocked ? 'text-white' : 'text-neutral-400'}`}>
                  {badge.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Bottom Progress or Tier details */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Category: {badge.category}</span>
                <span className="font-mono text-neutral-400">Tier #{badge.tierLevel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
