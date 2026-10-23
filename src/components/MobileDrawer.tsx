import React from 'react';
import { X, LayoutDashboard, Award, Trophy, Brain, BookOpen, BookMarked, Settings, Zap, GraduationCap, FileText } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab } = useStudy();

  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'summarizer', label: 'PDF Summariser', icon: FileText },
    { id: 'likely-questions', label: 'Exam Likely Questions', icon: GraduationCap },
    { id: 'quiz', label: 'AI Quiz Generator', icon: Brain },
    { id: 'tiers', label: 'Weekly Streak Tiers', icon: Award },
    { id: 'badges', label: 'Streak Badges', icon: Trophy },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
    { id: 'library', label: 'My Library', icon: BookMarked },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer content */}
      <div className="relative w-72 bg-neutral-950 border-r border-neutral-800 p-6 flex flex-col justify-between z-10">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-extrabold">
                <Zap className="w-4 h-4 fill-black stroke-black" />
              </div>
              <span className="text-sm font-bold text-white">Study Kit</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
