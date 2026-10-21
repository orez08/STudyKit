import React, { useState } from 'react';
import {
  Settings,
  User,
  Mail,
  Lock,
  Target,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface SettingsPageProps {
  onSignOut?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSignOut }) => {
  const { user, stats, resetPassword, updateUserGoals, signOut } = useStudy();

  const handleSignOutAction = async () => {
    await signOut();
    onSignOut?.();
  };

  const [displayName, setDisplayName] = useState(user?.displayName || 'Student');
  const [dailyMinutes, setDailyMinutes] = useState(user?.dailyGoalMinutes || 60);
  const [weeklyQuizzes, setWeeklyQuizzes] = useState(user?.weeklyGoalQuizzes || 5);
  const [message, setMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => document.body.classList.contains('theme-light'));

  const toggleTheme = (light: boolean) => {
    setIsLightMode(light);
    if (light) {
      document.body.classList.add('theme-light');
      localStorage.setItem('studykit_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      localStorage.setItem('studykit_theme', 'dark');
    }
    setMessage(`Theme switched to ${light ? 'High-Contrast Light' : 'Deep Black'} mode.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserGoals(dailyMinutes, weeklyQuizzes);
    setMessage('Your study targets have been updated successfully.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    const res = await resetPassword(user.email);
    setIsResetting(false);
    if (res.success) {
      setMessage(`A password reset link has been dispatched to ${user.email}.`);
    } else {
      setMessage(`Notice: ${res.error}`);
    }
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Student Account</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Account Settings</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Manage your personal profile, revision preferences, and security settings.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* 1. Student Profile Card */}
      <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-[#F2C230]" />
          <span>Personal Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-neutral-400 block mb-1">Display Name</label>
            <div className="p-3 rounded-lg bg-[#141414] border border-[#2F2F2F] text-white font-semibold">
              {user?.displayName || 'Student'}
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Registered Email</label>
            <div className="p-3 rounded-lg bg-[#141414] border border-[#2F2F2F] text-white font-mono">
              {user?.email || 'student@studykit.edu'}
            </div>
          </div>
        </div>

        {/* Avatar Selection Grid */}
        <div className="pt-4 border-t border-[#2B2B2B]">
          <label className="text-neutral-400 block mb-3 text-xs">Choose Your Avatar</label>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((id) => {
              const url = `/src/assets/images/toon_avatar_${id}.jpg`;
              return (
                <button
                  key={id}
                  onClick={() => {}}
                  className={`p-1 rounded-full border-2 transition-all ${user?.avatarUrl === url ? 'border-[#F2C230] scale-105' : 'border-transparent hover:border-[#333]'}`}
                >
                  <img src={url} alt={`Avatar ${id}`} className="w-16 h-16 rounded-full" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-xs border-t border-[#2A2A2A]">
          <span className="text-neutral-400">Security & Authentication:</span>
          <button
            onClick={handlePasswordReset}
            disabled={isResetting}
            className="text-[#F2C230] hover:underline font-medium"
          >
            {isResetting ? 'Sending link...' : 'Send Password Reset Email'}
          </button>
        </div>



      {/* 2. Study Targets */}
      <form onSubmit={handleSaveGoals} className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-[#F2C230]" />
          <span>Revision & Study Goals</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-neutral-300 block mb-1.5">Daily Study Target (Minutes)</label>
            <input
              type="number"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-white font-mono"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Recommended for college: 45–90 mins/day</p>
          </div>

          <div>
            <label className="text-neutral-300 block mb-1.5">Weekly Quizzes Target</label>
            <input
              type="number"
              value={weeklyQuizzes}
              onChange={(e) => setWeeklyQuizzes(Number(e.target.value))}
              className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-white font-mono"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Recommended: 3–7 quizzes/week</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#F2C230] hover:bg-[#e0b127] text-black font-bold text-xs rounded-xl shadow-sm"
          >
            Update Study Targets
          </button>
        </div>
      </form>

      {/* Theme & Accessibility Card */}
      <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          {isLightMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#F2C230]" />}
          <span>Appearance & Accessibility Theme</span>
        </h2>
        <p className="text-xs text-neutral-400">
          Choose between the immersive 'Deep Black' theme and high-contrast 'Light' mode for optimal viewing comfort.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => toggleTheme(false)}
            className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !isLightMode
                ? 'bg-[#000000] border-[#D97706] text-white shadow-md'
                : 'bg-[#141414] border-[#2A2A2A] text-neutral-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-[#D97706]" />
            <span>Deep Black (Default)</span>
          </button>
          <button
            type="button"
            onClick={() => toggleTheme(true)}
            className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isLightMode
                ? 'bg-white border-amber-500 text-neutral-900 shadow-md font-bold'
                : 'bg-[#141414] border-[#2A2A2A] text-neutral-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>High-Contrast Light</span>
          </button>
        </div>
      </div>

      {/* 3. Account Storage Overview */}
      <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2B2B2B] space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-[#F2C230]" />
          <span>Storage & Cloud Vault</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626]">
            <span className="text-[10px] text-neutral-400 block">Documents Saved</span>
            <span className="text-lg font-bold font-mono text-white">{stats.totalDocs}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626]">
            <span className="text-[10px] text-neutral-400 block">Summaries Generated</span>
            <span className="text-lg font-bold font-mono text-white">{stats.totalSummaries}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626]">
            <span className="text-[10px] text-neutral-400 block">Quizzes Completed</span>
            <span className="text-lg font-bold font-mono text-white">{stats.totalQuizzes}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626]">
            <span className="text-[10px] text-neutral-400 block">Cards Reviewed</span>
            <span className="text-lg font-bold font-mono text-white">{stats.flashcardsReviewed}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-[#2A2A2A]">
          <span className="text-xs text-neutral-400">Account Session</span>
          <button
            onClick={handleSignOutAction}
            className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 4. Session & Sign Out Card */}
      <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-900/60 flex items-center justify-center text-red-400 shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Sign Out of Account</h2>
            <p className="text-xs text-neutral-400 mt-0.5">End your active session securely on this device.</p>
          </div>
        </div>
        <button
          onClick={handleSignOutAction}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Now</span>
        </button>
      </div>
    </div>
  );
};
