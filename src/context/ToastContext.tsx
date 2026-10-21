import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Flame, Trophy, CheckCircle2, X, Award } from 'lucide-react';

export type ToastCategory = 'streak' | 'leaderboard' | 'task';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  category: ToastCategory;
  duration: number; // in milliseconds (default 5000)
  createdAt: number;
}

interface ToastContextType {
  showToast: (
    titleOrMessage: string,
    messageOrCategory?: string | ToastCategory,
    category?: ToastCategory,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Individual Toast Card with 5-second progress countdown bar
const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercent = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remainingPercent);
      if (remainingPercent <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration]);

  const isStreak = toast.category === 'streak';
  const isLeaderboard = toast.category === 'leaderboard';
  const isTask = toast.category === 'task';

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-4 ${
        isStreak
          ? 'bg-[#0f0e0d]/95 border-amber-500/40 shadow-amber-500/10'
          : isLeaderboard
          ? 'bg-[#0b1219]/95 border-emerald-500/40 shadow-emerald-500/10'
          : 'bg-[#0f0f10]/95 border-amber-400/30 shadow-amber-400/10'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div
          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm ${
            isStreak
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              : isLeaderboard
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-400/15 border-amber-400/30 text-amber-300'
          }`}
        >
          {isStreak && <Flame className="w-5 h-5 text-amber-400 animate-pulse" />}
          {isLeaderboard && <Trophy className="w-5 h-5 text-emerald-400" />}
          {isTask && <CheckCircle2 className="w-5 h-5 text-amber-300" />}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-[10px] font-bold tracking-wider uppercase ${
                isStreak
                  ? 'text-amber-400'
                  : isLeaderboard
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {isStreak ? 'Streak Badge' : isLeaderboard ? 'Global Leaderboard' : 'Daily Task'}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss notification"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 5-Second Auto-Dismiss Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800/60 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear ${
            isStreak
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : isLeaderboard
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-amber-400 to-amber-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      titleOrMessage: string,
      messageOrCategory?: string | ToastCategory,
      categoryArg?: ToastCategory,
      durationArg = 5000
    ) => {
      let title = titleOrMessage;
      let message = '';
      let category: ToastCategory = 'streak';
      let duration = durationArg;

      // Handle overloaded signatures:
      // Case 1: showToast("Streak maintained!", "streak")
      // Case 2: showToast("Title", "Message", "streak")
      if (
        messageOrCategory === 'streak' ||
        messageOrCategory === 'leaderboard' ||
        messageOrCategory === 'task'
      ) {
        category = messageOrCategory;
        title = titleOrMessage;
        message = '';
      } else if (typeof messageOrCategory === 'string') {
        title = titleOrMessage;
        message = messageOrCategory;
        if (categoryArg) {
          category = categoryArg;
        }
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        title,
        message,
        category,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after duration (default 5000ms)
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Fixed top-right toast container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
