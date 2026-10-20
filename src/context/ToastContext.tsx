import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastCategory = 'streak' | 'leaderboard';

interface Toast {
  id: string;
  message: string;
  category: ToastCategory;
}

interface ToastContextType {
  showToast: (message: string, category: ToastCategory) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, category: ToastCategory) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, category }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white flex items-center gap-3 transition-all ${
              toast.category === 'streak' ? 'bg-amber-600' : 'bg-blue-600'
            }`}
          >
            {toast.category === 'streak' ? '🔥' : '🏆'}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
