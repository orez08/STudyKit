import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { PomodoroTimer } from './components/PomodoroTimer';
import { MobileDrawer } from './components/MobileDrawer';

// Lazy-loaded Pages for rapid initial bundle loading and code splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const FeaturesPage = React.lazy(() => import('./pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })));
const HowItWorksPage = React.lazy(() => import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })));
const PricingPage = React.lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const LibraryPage = React.lazy(() => import('./pages/LibraryPage').then((m) => ({ default: m.LibraryPage })));
const SummarizerPage = React.lazy(() => import('./pages/SummarizerPage').then((m) => ({ default: m.SummarizerPage })));
const QuizPage = React.lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })));
const FlashcardsPage = React.lazy(() => import('./pages/FlashcardsPage').then((m) => ({ default: m.FlashcardsPage })));
const PracticeTestsPage = React.lazy(() => import('./pages/PracticeTestsPage').then((m) => ({ default: m.PracticeTestsPage })));
const StudyAssistantPage = React.lazy(() => import('./pages/StudyAssistantPage').then((m) => ({ default: m.StudyAssistantPage })));
const StudyGroupsPage = React.lazy(() => import('./pages/StudyGroupsPage').then((m) => ({ default: m.StudyGroupsPage })));
const PlannerPage = React.lazy(() => import('./pages/PlannerPage').then((m) => ({ default: m.PlannerPage })));
const StreakBadgesPage = React.lazy(() => import('./pages/StreakBadgesPage').then((m) => ({ default: m.StreakBadgesPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const LegalPage = React.lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-[300px] p-6">
    <div className="flex flex-col items-center gap-3">
      <div className="w-7 h-7 rounded-full border-2 border-[#D97706] border-t-transparent animate-spin" />
      <span className="text-xs text-neutral-400 font-mono tracking-wide">Loading workspace...</span>
    </div>
  </div>
);

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

  const isPublicView = [
    'landing',
    'features',
    'how-it-works',
    'pricing',
    'privacy',
    'terms',
  ].includes(currentView);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('studykit_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        import('./pages/DashboardPage');
        import('./pages/SummarizerPage');
        import('./pages/QuizPage');
        import('./pages/LibraryPage');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const prevAuthRef = React.useRef(isAuthenticated);
  React.useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      setCurrentView('landing');
      openAuthModal('signin');
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (!isAuthenticated && !isPublicView) {
      setCurrentView('landing');
      openAuthModal('signin');
    }
  }, [isAuthenticated, isPublicView]);

  const openAuthModal = (mode: 'signin' | 'signup' | 'forgot') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

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
          <React.Suspense fallback={<PageLoadingFallback />}>
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
          </React.Suspense>
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
            <React.Suspense fallback={<PageLoadingFallback />}>
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
              {currentView === 'streak-badges' && <StreakBadgesPage setCurrentView={setCurrentView} />}
              {currentView === 'settings' && (
                <SettingsPage
                  onSignOut={() => {
                    setCurrentView('landing');
                    openAuthModal('signin');
                  }}
                />
              )}
            </React.Suspense>
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
    <ToastProvider>
      <StudyProvider>
        <AppContent />
      </StudyProvider>
    </ToastProvider>
  );
}
