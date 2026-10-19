import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { PomodoroTimer } from './components/PomodoroTimer';
import { MobileDrawer } from './components/MobileDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PricingPage } from './pages/PricingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { SummarizerPage } from './pages/SummarizerPage';
import { QuizPage } from './pages/QuizPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { PracticeTestsPage } from './pages/PracticeTestsPage';
import { StudyAssistantPage } from './pages/StudyAssistantPage';
import { StudyGroupsPage } from './pages/StudyGroupsPage';
import { PlannerPage } from './pages/PlannerPage';
import { SettingsPage } from './pages/SettingsPage';
import { LegalPage } from './pages/LegalPage';

// Icons for mobile navigation
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Layers,
  MessageSquare,
  Menu,
  X,
  Upload,
} from 'lucide-react';
import { SummaryData, DocumentItem } from './types';

const AppContent: React.FC = () => {
  const { isAuthenticated, setActiveDoc } = useStudy();

  const [currentView, setCurrentView] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('studykit_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' | 'forgot') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const isPublicView = [
    'landing',
    'features',
    'how-it-works',
    'pricing',
    'privacy',
    'terms',
  ].includes(currentView);

  // Transition handlers between study tools
  const handleOpenSummary = (summaryId: string) => {
    setSelectedSummaryId(summaryId);
    setCurrentView('summarizer');
  };

  const handleGenerateQuizFromSummary = (summary: SummaryData) => {
    setCurrentView('quiz');
  };

  const handleGenerateFlashcardsFromSummary = (summary: SummaryData) => {
    setCurrentView('flashcards');
  };

  const handleAskAIAboutSummary = (summary: SummaryData) => {
    setCurrentView('study-assistant');
  };

  const handleDocumentUploaded = (doc: DocumentItem) => {
    setActiveDoc(doc);
    setCurrentView('summarizer');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-['Poppins']">
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          setCurrentView('dashboard');
        }}
      />

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleDocumentUploaded}
      />

      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Top Navbar */}
      {isPublicView ? (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          openAuthModal={openAuthModal}
        />
      ) : (
        /* Authenticated Top Mobile Bar */
        <header className="md:hidden sticky top-0 z-40 bg-[#0A0A0A] border-b border-[#1C1C1C] px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-base font-semibold text-white font-['Clash_Display'] tracking-tight"
          >
            Study <span className="text-[#D97706]">Kit</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="p-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white rounded-lg shadow-sm"
              title="Upload"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-[#1A1A1A]"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      {/* Main Body */}
      {isPublicView ? (
        <main className="flex-1">
          {currentView === 'landing' && (
            <LandingPage setCurrentView={setCurrentView} openAuthModal={openAuthModal} />
          )}
          {currentView === 'features' && (
            <FeaturesPage setCurrentView={setCurrentView} openAuthModal={openAuthModal} />
          )}
          {currentView === 'how-it-works' && (
            <HowItWorksPage setCurrentView={setCurrentView} openAuthModal={openAuthModal} />
          )}
          {currentView === 'pricing' && (
            <PricingPage setCurrentView={setCurrentView} openAuthModal={openAuthModal} />
          )}
          {currentView === 'privacy' && (
            <LegalPage type="privacy" setCurrentView={setCurrentView} />
          )}
          {currentView === 'terms' && (
            <LegalPage type="terms" setCurrentView={setCurrentView} />
          )}
        </main>
      ) : (
        /* Authenticated Split Layout */
        <div className="flex-1 flex min-h-0">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar
              currentView={currentView}
              setCurrentView={setCurrentView}
              openUploadModal={() => setUploadModalOpen(true)}
            />
          </div>

          {/* Authenticated Content Area */}
          <main className="flex-1 min-w-0 overflow-y-auto pb-8">
            {currentView === 'dashboard' && (
              <DashboardPage
                setCurrentView={setCurrentView}
                openUploadModal={() => setUploadModalOpen(true)}
                onOpenSummary={handleOpenSummary}
              />
            )}
            {currentView === 'library' && (
              <LibraryPage
                setCurrentView={setCurrentView}
                openUploadModal={() => setUploadModalOpen(true)}
                onOpenSummary={handleOpenSummary}
              />
            )}
            {currentView === 'summarizer' && (
              <SummarizerPage
                onGenerateQuiz={handleGenerateQuizFromSummary}
                onGenerateFlashcards={handleGenerateFlashcardsFromSummary}
                onAskAI={handleAskAIAboutSummary}
                selectedSummaryId={selectedSummaryId}
              />
            )}
            {currentView === 'quiz' && <QuizPage />}
            {currentView === 'flashcards' && <FlashcardsPage />}
            {currentView === 'practice-tests' && <PracticeTestsPage />}
            {currentView === 'study-groups' && <StudyGroupsPage />}
            {currentView === 'study-assistant' && <StudyAssistantPage />}
            {currentView === 'planner' && <PlannerPage />}
            {currentView === 'settings' && <SettingsPage />}
          </main>
          {!isPublicView && <PomodoroTimer />}
        </div>
      )}

      {/* Mobile Bottom Navigation for Authenticated App (REMOVED) */}
      {/* {!isPublicView && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#000000] border-t border-[#1C1C1C] px-2 py-1.5 flex items-center justify-around z-30">
          ...
        </nav>
      )} */}


      {/* Footer for public views */}
      {isPublicView && <Footer setCurrentView={setCurrentView} />}
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
