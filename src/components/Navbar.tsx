import React from 'react';
import { Menu, Zap, Flame, Award, Shield, User } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const Navbar: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const { stats, profile, setActiveTab } = useStudy();

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-extrabold">
            <Zap className="w-4 h-4 fill-black stroke-black" />
          </div>
          <span className="text-sm font-bold text-white">Study Kit</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{stats.currentStreak}d Streak</span>
        </div>

        {/* User Avatar Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-900 transition-colors cursor-pointer"
          title="Account Settings"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 border border-amber-500">
            {profile?.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile?.displayName || 'User'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
