import React, { useState } from 'react';
import { User, Check, Sparkles, Shield, Bell, Save, Flame, Trophy } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PRESET_AVATARS, CartoonAvatar } from '../data/avatars';

export const SettingsPage: React.FC = () => {
  const { profile, stats, updateAvatar, updateProfile, notification } = useStudy();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [targetExam, setTargetExam] = useState(profile?.targetExam || '');
  const [filterGender, setFilterGender] = useState<'All' | 'Female' | 'Male'>('All');
  const [saving, setSaving] = useState(false);

  const filteredAvatars = PRESET_AVATARS.filter(
    (a) => filterGender === 'All' || a.gender === filterGender
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      displayName,
      bio,
      targetExam,
    });
    setSaving(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Customize your scholar profile, select your cartoon avatar, and manage your study preferences.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Avatar Selection Section */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Cartoon Scholar Avatar</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Pre-Designed
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose your representative cartoon character for the Leaderboard and Study Tiers.
            </p>
          </div>

          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
            {(['All', 'Female', 'Male'] as const).map((gender) => (
              <button
                key={gender}
                onClick={() => setFilterGender(gender)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterGender === gender
                    ? 'bg-amber-500 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Current Selected Avatar Preview Banner */}
        <div className="mt-5 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-800 border-2 border-amber-500 shadow-md shadow-amber-500/20 shrink-0">
            {profile?.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile?.displayName || 'User'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <span className="text-xs text-neutral-400">Current Active Avatar</span>
            <h3 className="text-base font-bold text-white">
              {PRESET_AVATARS.find((a) => a.id === profile?.avatarId)?.name || 'Custom Character'}
            </h3>
            <span className="text-xs text-amber-400 font-medium">
              Displayed with your {stats.currentStreak}-day streak on the Leaderboard
            </span>
          </div>
        </div>

        {/* Fun Selection Grid */}
        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredAvatars.map((avatar: CartoonAvatar) => {
              const isSelected = profile.avatarId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => updateAvatar(avatar.id)}
                  className={`group relative p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Avatar Image (rendered via inline SVG Data URI to guarantee visibility!) */}
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-800 p-0.5 my-2 border border-neutral-700/60 group-hover:scale-105 transition-transform">
                    <img
                      src={avatar.svgDataUri}
                      alt={avatar.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Character Name & Tag */}
                  <div className="mt-2 w-full">
                    <span className="text-xs font-bold text-white block truncate">
                      {avatar.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      {avatar.tag}
                    </span>
                    <span
                      className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${
                        avatar.gender === 'Female'
                          ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {avatar.gender}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm space-y-4"
      >
        <h2 className="text-lg font-bold text-white pb-3 border-b border-neutral-800">
          Personal Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="Your scholar name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Target Exam / Focus Goal
            </label>
            <input
              type="text"
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="e.g. MCAT, USMLE, SAT, Algorithms"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Academic Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
            placeholder="Tell your study peers about your study routine or specializations..."
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
