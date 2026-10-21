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
  Users,
  X,
  Award,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, currentView, setCurrentView }) => {
  const { stats } = useStudy();
  
  if (!isOpen) return null;

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', name: 'My Library', icon: FolderArchive, badge: stats.totalDocs },
    { id: 'summarizer', name: 'PDF Summariser', icon: FileText },
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
    <div className="fixed inset-0 z-50 md:hidden bg-[#000000]/90 backdrop-blur-sm animate-fade-in">
      <div className="absolute right-0 top-0 h-full w-64 bg-[#0A0A0A] border-l border-[#1C1C1C] p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white p-2">
          <X className="w-6 h-6" />
        </button>
        <nav className="mt-12 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  isActive ? 'bg-[#D97706] text-white' : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
