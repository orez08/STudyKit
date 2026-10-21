import React from 'react';
import {
  LayoutDashboard,
  FolderArchive,
  FileText,
  HelpCircle,
  Layers,
  GraduationCap,
  MessageSquare,
  CalendarCheck,
  Settings,
  LogOut,
  BookOpen,
  FileCheck,
  Users,
  Award,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openUploadModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, openUploadModal }) => {
  const { user, signOut, activeDoc, stats } = useStudy();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', name: 'My Library', icon: FolderArchive, badge: stats.totalDocs },
    { id: 'summarizer', name: 'PDF Summariser', icon: FileText, highlight: true },
    { id: 'quiz', name: 'AI Quiz Generator', icon: HelpCircle },
    { id: 'flashcards', name: 'Flashcards', icon: Layers },
    { id: 'practice-tests', name: 'Practice Tests', icon: GraduationCap },
    { id: 'study-groups', name: 'Study Groups', icon: Users },
    { id: 'study-assistant', name: 'Ask Study Kit', icon: MessageSquare },
    { id: 'planner', name: 'Study Planner', icon: CalendarCheck },
    { id: 'streak-badges', name: 'Streak Badges', icon: Award },
    { id: 'settings', name: 'Account Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#050505] border-r border-[#1A1A1A] flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1A1A1A] flex items-center justify-between">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#EA580C] flex items-center justify-center text-white font-extrabold shadow-sm shadow-[#D97706]/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-white font-['Clash_Display'] block leading-none">
              Study <span className="text-[#D97706]">Kit</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">Smart AI Workspace</span>
          </div>
        </button>
      </div>

      {/* Quick Upload CTA */}
      <div className="p-4 border-b border-[#1A1A1A]">
        <button
          onClick={openUploadModal}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#D97706]/25 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Active Document Indicator (if any) */}
      {activeDoc && (
        <div className="mx-4 my-3 p-2.5 rounded-lg bg-[#0C0C0C] border border-[#222222] text-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1 text-[10px] uppercase font-semibold">
            <span>Active Study Focus</span>
            <FileCheck className="w-3 h-3 text-[#FDE047]" />
          </div>
          <p className="font-medium text-white truncate" title={activeDoc.name}>
            {activeDoc.name}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-400">
            <span>{activeDoc.pageCount || 1} pages</span>
            <span>·</span>
            <span>{(activeDoc.size / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white font-semibold shadow-sm shadow-[#D97706]/25'
                  : 'text-neutral-300 hover:text-white hover:bg-[#121212]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-black/30 text-white' : 'text-neutral-400 bg-[#1A1A1A]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Student Profile & Footer */}
      <div className="p-4 border-t border-[#1A1A1A] bg-[#000000]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-xs font-bold text-[#FDE047] shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.displayName || 'Student'}
              </p>
              <p className="text-[10px] text-neutral-400 truncate font-mono">
                {user?.email || 'student@studykit.edu'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-[#141414] rounded transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
