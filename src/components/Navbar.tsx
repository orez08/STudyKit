import React, { useState } from 'react';
import { BookOpen, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuthModal: (mode: 'signin' | 'signup' | 'forgot') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, openAuthModal }) => {
  const { isAuthenticated, signOut, signInDemo } = useStudy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000]/95 backdrop-blur-md border-b border-[#1C1C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Brand logo & typography in Clash Display Semibold */}
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#EA580C] flex items-center justify-center text-white font-extrabold shadow-md shadow-[#D97706]/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight text-white font-['Clash_Display']">
              Study <span className="text-[#D97706]">Kit</span>
            </span>
          </div>
        </button>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setCurrentView(link.id)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === link.id ? 'text-[#D97706] font-semibold' : ''
              }`}
            >
              {link.label}
            </button>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard' ? 'text-[#D97706] font-semibold' : ''
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Workspace
            </button>
          )}
        </nav>

        {/* Action buttons with darker gold & orange shades */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm shadow-[#D97706]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 text-neutral-400 hover:text-white hover:bg-[#151515] rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-[#151515] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm shadow-[#D97706]/20 cursor-pointer"
              >
                Start Studying Free
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#EA580C] rounded-lg"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('signup')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#EA580C] rounded-lg"
            >
              Start Free
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white hover:bg-[#151515] rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1C1C1C] bg-[#0A0A0A] px-4 pt-3 pb-5 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentView(link.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm text-neutral-200 hover:text-[#D97706]"
            >
              {link.label}
            </button>
          ))}
          {isAuthenticated ? (
            <div className="pt-2 border-t border-[#1C1C1C] flex flex-col gap-2">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#EA580C] rounded-lg"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-sm text-neutral-400 hover:text-white"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#1C1C1C] flex flex-col gap-2">
              <button
                onClick={() => {
                  openAuthModal('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-sm text-white bg-[#151515] border border-[#242424] rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  signInDemo();
                  setCurrentView('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs text-[#FDE047] bg-[#D97706]/15 border border-[#D97706]/40 rounded-lg"
              >
                Explore Demo Account (1-Click)
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
