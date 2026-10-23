import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MobileDrawer } from './components/MobileDrawer';
import { DashboardPage } from './pages/DashboardPage';
import { SummarizerPage } from './pages/SummarizerPage';
import { ExamLikelyQuestionsPage } from './pages/ExamLikelyQuestionsPage';
import { StreakTiersPage } from './pages/StreakTiersPage';
import { StreakBadgesPage } from './pages/StreakBadgesPage';
import { QuizGeneratorPage } from './pages/QuizGeneratorPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { PracticeTestsPage } from './pages/PracticeTestsPage';
import { StudyGroupsPage } from './pages/StudyGroupsPage';
import { StudyAssistantPage } from './pages/StudyAssistantPage';
import { PlannerPage } from './pages/PlannerPage';
import { AdminEmailPage } from './pages/AdminEmailPage';
import { LibraryPage } from './pages/LibraryPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useStudy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-100 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'summarizer' && <SummarizerPage />}
          {activeTab === 'likely-questions' && <ExamLikelyQuestionsPage />}
          {activeTab === 'quiz' && <QuizGeneratorPage />}
          {activeTab === 'tiers' && <StreakTiersPage />}
          {activeTab === 'badges' && <StreakBadgesPage />}
          {activeTab === 'flashcards' && <FlashcardsPage />}
          {activeTab === 'practice-tests' && <PracticeTestsPage />}
          {activeTab === 'study-groups' && <StudyGroupsPage />}
          {activeTab === 'study-assistant' && <StudyAssistantPage />}
          {activeTab === 'planner' && <PlannerPage />}
          {activeTab === 'admin-email' && <AdminEmailPage />}
          {activeTab === 'library' && <LibraryPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <StudyProvider>
        <AppContent />
      </StudyProvider>
    </ToastProvider>
  );
}

export default App;
