import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}) => {
  const { signIn, signUp, signInDemo, resetPassword } = useStudy();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [university, setUniversity] = useState('');
  const [matricNo, setMatricNo] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Invalid email or password.');
        }
      } else if (mode === 'signup') {
        if (!name.trim() || !surname.trim() || !university.trim() || !matricNo.trim() || !department.trim()) {
          setError('Please fill in all academic profile fields.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password should be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        const res = await signUp(email, password, name, surname, university, matricNo, department);
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Failed to create student account.');
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMsg('A password reset link has been dispatched to your email address.');
        } else {
          setError(res.error || 'Failed to send password reset link.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = () => {
    signInDemo();
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-2xl animate-modal-pop">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#141414] transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 animate-stagger-1">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#EA580C] text-white font-extrabold flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#D97706]/20 animate-soft-pulse">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white font-['Clash_Display']">
            {mode === 'signin' && 'Welcome Back to Study Kit'}
            {mode === 'signup' && 'Create Your Student Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'signin' && 'Sign in to access your private documents, summaries, and quizzes.'}
            {mode === 'signup' && 'Your personal AI study companion grounded in your learning materials.'}
            {mode === 'forgot' && 'Enter your email to receive password reset instructions.'}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-[#050505] border border-[#262626] rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D97706] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Surname</label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="e.g. Morgan"
                    className="w-full bg-[#050505] border border-[#262626] rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D97706] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">University / College Name</label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. State University"
                  className="w-full bg-[#050505] border border-[#262626] rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D97706] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Matric No</label>
                  <input
                    type="text"
                    required
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    placeholder="e.g. U/2023/1234"
                    className="w-full bg-[#050505] border border-[#262626] rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D97706] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-[#050505] border border-[#262626] rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D97706] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-[#050505] border border-[#262626] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-300">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-[#FDE047] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050505] border border-[#262626] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D97706] transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#D97706]/20 disabled:opacity-50 cursor-pointer card-hover-lift"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In to Workspace'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Option */}
        <div className="mt-5 pt-4 border-t border-[#1C1C1C]">
          <button
            type="button"
            onClick={handleDemoClick}
            className="w-full py-2 px-3 bg-[#121212] hover:bg-[#1A1A1A] text-neutral-200 border border-[#242424] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group cursor-pointer card-hover-lift"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FDE047] group-hover:scale-110 transition-transform" />
            <span>Continue with Student Demo Account (Instant Access)</span>
          </button>
        </div>

        {/* Mode Toggle Footer */}
        <div className="mt-4 text-center text-xs text-neutral-400">
          {mode === 'signin' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-[#FDE047] hover:text-[#D97706] font-medium hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="text-[#FDE047] hover:text-[#D97706] font-medium hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
