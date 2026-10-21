import React from 'react';
import { Flame, Star, Award, Trophy, User } from 'lucide-react';
import { useStudy } from '@/context/StudyContext';

// Assuming users is derived from a hook or prop, here we simulate with useStudy context stats or similar
// For this UI, we will need to fetch all users. Assuming 'getAllUsers' is added to StudyContext later or using a generic approach.
export const StreakTiersPage: React.FC = () => {
  const { user } = useStudy(); // Need to fetch all users, placeholder for logic

  // Mock Data for Structure - Will be replaced by actual data fetch
  const allUsers = [
    { displayName: 'Moses A.', currentStreak: 5 },
    { displayName: 'Alex C.', currentStreak: 15 },
    { displayName: 'Sarah J.', currentStreak: 35 },
    { displayName: 'Marcus V.', currentStreak: 60 },
  ].filter(u => u.currentStreak > 0);

  const tiers = [
    { name: 'Rising Star', range: '1-10', users: allUsers.filter(u => u.currentStreak >= 1 && u.currentStreak <= 10) },
    { name: 'Consistent', range: '11-20', users: allUsers.filter(u => u.currentStreak >= 11 && u.currentStreak <= 20) },
    { name: 'Expert', range: '21-50', users: allUsers.filter(u => u.currentStreak >= 21 && u.currentStreak <= 50) },
    { name: 'Master', range: '50+', users: allUsers.filter(u => u.currentStreak > 50) },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in bg-[#000000]">
      <div className="pb-6 border-b border-[#1C1C1C]">
        <h1 className="text-3xl font-semibold text-white font-['Clash_Display']">Weekly Streak Tiers</h1>
        <p className="text-sm text-neutral-400 mt-1">See how you compare with other learners in your streak tier.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map(tier => (
          <div key={tier.name} className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">{tier.name}</h3>
              <span className="text-xs font-mono text-amber-500">{tier.range} days</span>
            </div>
            <div className="space-y-2">
              {tier.users.map((u, i) => (
                <div key={i} className={`flex justify-between items-center p-2 rounded-lg ${u.displayName === user?.displayName ? 'bg-amber-950/30 border border-amber-500/50' : 'bg-[#141414]'}`}>
                  <span className="text-sm text-neutral-200">{u.displayName} {u.displayName === user?.displayName && <span className="text-amber-400 font-bold">(You)</span>}</span>
                  <span className="text-xs font-mono text-neutral-500">{u.currentStreak}d</span>
                </div>
              ))}
              {tier.users.length === 0 && <p className="text-xs text-neutral-600 italic">No users in this tier</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
