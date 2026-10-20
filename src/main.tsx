import { StudyProvider } from '@/context/StudyContext';
import { ToastProvider } from '@/context/ToastContext';

createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <StudyProvider>
      <App />
    </StudyProvider>
  </ToastProvider>
);
