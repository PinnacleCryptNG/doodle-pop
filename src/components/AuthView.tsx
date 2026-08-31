import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BrandLogo } from './BrandLogo';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  MailCheck,
  ArrowLeft,
  RefreshCw,
  KeyRound,
  Mail,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { signUp, login, guestLogin, verifyEmail, resendVerificationCode, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login' | 'verify'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification mode state
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [latestCodeHint, setLatestCodeHint] = useState<string | null>(null);
  const [resendingCode, setResendingCode] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'verify') {
      if (!verificationCode.trim()) {
        setLocalError('Please enter the 6-digit confirmation code.');
        return;
      }
      setSubmitting(true);
      try {
        const res = await verifyEmail(pendingEmail || cleanEmail, verificationCode.trim());
        if (res.success && res.message) {
          setSuccessMessage(res.message);
        }
      } catch (err: any) {
        setLocalError(err.message || 'Failed to verify confirmation code.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8 && mode === 'signup') {
      setLocalError('Password must be at least 8 characters long.');
      return;
    } else if (password.length < 6 && mode === 'login') {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        setLocalError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const res = await signUp(cleanEmail, password);
        if (res.success) {
          if (res.requiresVerification) {
            setPendingEmail(cleanEmail);
            if (res.verificationCode) {
              setLatestCodeHint(res.verificationCode);
            }
            setMode('verify');
            setSuccessMessage(
              res.message || 'A 6-digit confirmation code has been sent to your email.'
            );
          } else if (res.message) {
            setSuccessMessage(res.message);
          }
        }
      } else {
        const res = await login(cleanEmail, password);
        if (!res.success && res.requiresVerification) {
          setPendingEmail(cleanEmail);
          if (res.verificationCode) {
            setLatestCodeHint(res.verificationCode);
          }
          setMode('verify');
          setLocalError('Please confirm your email address first before logging in.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    const targetEmail = pendingEmail || email.trim().toLowerCase();
    if (!targetEmail) return;

    setResendingCode(true);
    setResendStatus(null);
    try {
      const res = await resendVerificationCode(targetEmail);
      if (res.success) {
        if (res.verificationCode) {
          setLatestCodeHint(res.verificationCode);
        }
        setResendStatus('A fresh confirmation code has been sent to your email.');
        setTimeout(() => setResendStatus(null), 6000);
      } else if (res.error) {
        setLocalError(res.error);
      }
    } catch {
      setLocalError('Unable to resend code right now. Please try again in a moment.');
    } finally {
      setResendingCode(false);
    }
  };

  const toggleMode = (targetMode: 'signup' | 'login' | 'verify') => {
    setMode(targetMode);
    clearError();
    setLocalError(null);
    setSuccessMessage(null);
    setResendStatus(null);
  };

  const displayedError = localError || error;

  return (
    <div className="relative min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-[#8B5CF6]/30 selection:text-violet-200 overflow-hidden font-['Inter',sans-serif]">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-[#8B5CF6]/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 sm:w-[550px] sm:h-[550px] bg-[#06B6D4]/15 rounded-full blur-[140px] mix-blend-screen" />
      </div>

      {/* Main Container Card (Liquid Glassmorphism) */}
      <main className="relative z-10 w-full max-w-md my-8">
        <div className="relative group">
          {/* Subtle Outer Neon Violet Glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-[#8B5CF6]/50 via-slate-700/30 to-[#06B6D4]/30 rounded-3xl blur-xs opacity-75 group-hover:opacity-100 transition duration-500" />

          {/* Frosted Glass Card Body */}
          <div
            id="auth-card"
            className="relative bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-10px_rgba(139,92,246,0.18)]"
          >
            {/* Header */}
            {mode === 'verify' ? (
              <div className="text-left mb-6">
                <BrandLogo size="lg" className="mb-4" />
                <h1
                  id="auth-card-title"
                  className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold tracking-tight text-white"
                >
                  Verify your email
                </h1>
                <p
                  id="auth-card-subtitle"
                  className="mt-2 text-sm text-slate-400 leading-relaxed font-['Inter',sans-serif]"
                >
                  We sent a 6-digit confirmation code to{' '}
                  <span className="font-semibold text-slate-200">{pendingEmail || email}</span>.
                </p>
              </div>
            ) : (
              <div className="text-left mb-5">
                <div className="flex items-center gap-3 mb-4">
                  <BrandLogo size="lg" />
                  <div>
                    <span className="font-outfit text-base font-extrabold text-white tracking-tight flex items-center gap-1">
                      Doodle<span className="text-[#2DD4BF]">Pop</span>
                      <span className="text-amber-400 text-xs">✨</span>
                    </span>
                    <span className="text-[11px] font-cabinet font-semibold uppercase tracking-wider text-slate-400 block">
                      Your Fun Note Buddy
                    </span>
                  </div>
                </div>

                {/* Primary Mode Switcher Tab (Sign In vs Create Password / Sign Up) */}
                <div className="p-1 rounded-2xl bg-slate-950/60 border border-white/[0.08] flex items-center gap-1 mb-4">
                  <button
                    id="tab-mode-login"
                    type="button"
                    onClick={() => toggleMode('login')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-[#8B5CF6]/30 to-[#06B6D4]/30 border border-[#8B5CF6]/50 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Log In</span>
                  </button>
                  <button
                    id="tab-mode-signup"
                    type="button"
                    onClick={() => toggleMode('signup')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      mode === 'signup'
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Password</span>
                  </button>
                </div>

                <h1
                  id="auth-card-title"
                  className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-[26px] font-bold tracking-tight text-white leading-tight"
                >
                  {mode === 'signup' ? 'Create Your Password' : 'Sign In with Password'}
                </h1>
                <p
                  id="auth-card-subtitle"
                  className="mt-1.5 text-sm text-slate-400 font-['Inter',sans-serif]"
                >
                  {mode === 'signup'
                    ? 'Enter your email and choose a secure password to get started.'
                    : 'Enter your email and password to access your synced notes.'}
                </p>
              </div>
            )}

            {/* Error Message Alert */}
            {displayedError && (
              <div
                id="auth-error-alert"
                className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-snug">{displayedError}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div
                id="auth-success-alert"
                className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* Resend Status Alert */}
            {resendStatus && (
              <div
                id="auth-resend-alert"
                className="mb-5 p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <span className="leading-snug">{resendStatus}</span>
              </div>
            )}

            {/* Form */}
            {mode === 'verify' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {latestCodeHint && (
                  <div className="p-3 bg-violet-950/40 border border-[#8B5CF6]/30 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <KeyRound className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                      <span className="truncate">
                        Verification code: <strong className="font-mono text-white tracking-wider">{latestCodeHint}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVerificationCode(latestCodeHint)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-violet-200 rounded-md transition-colors cursor-pointer shrink-0"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="verification-code"
                    className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2"
                  >
                    6-Digit Confirmation Code
                  </label>
                  <input
                    id="verification-code"
                    name="verificationCode"
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3.5 text-center font-mono text-2xl tracking-[0.45em] font-semibold text-white bg-slate-950/70 border border-slate-700/80 rounded-xl placeholder-slate-600 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/40 focus:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    id="verify-submit-button"
                    type="submit"
                    disabled={submitting || verificationCode.length < 6}
                    className="relative w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:from-[#7C3AED] hover:to-[#0891B2] text-white font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-sm transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.55)] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Verifying...</span>
                      </span>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 text-xs">
                  <button
                    id="resend-code-button"
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendingCode}
                    className="font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendingCode ? 'animate-spin' : ''}`} />
                    {resendingCode ? 'Sending...' : 'Resend code'}
                  </button>

                  <button
                    id="back-to-login-button"
                    type="button"
                    onClick={() => toggleMode('login')}
                    className="font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign in
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address field */}
                <div id="field-group-email">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 text-sm text-slate-100 bg-slate-950/70 border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all font-['Inter',sans-serif]"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div id="field-group-password">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-slate-300"
                    >
                      {mode === 'signup' ? 'Create Password' : 'Password'}
                    </label>
                    {mode === 'signup' ? (
                      <span className="text-[11px] text-violet-300 font-medium">Min 8 characters</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleMode('signup')}
                        className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                      >
                        Create new password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                      className="w-full pl-10 pr-11 py-3 text-sm text-slate-100 bg-slate-950/70 border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all font-['Inter',sans-serif]"
                    />
                    <button
                      id="toggle-password-visibility"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field (Sign Up Mode) */}
                {mode === 'signup' && (
                  <div id="field-group-confirm-password">
                    <label
                      htmlFor="confirm-password"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type your password"
                        className="w-full pl-10 pr-11 py-3 text-sm text-slate-100 bg-slate-950/70 border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all font-['Inter',sans-serif]"
                      />
                      <button
                        id="toggle-confirm-password-visibility"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    id="auth-submit-btn"
                    type="submit"
                    disabled={submitting}
                    className="relative w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:from-[#7C3AED] hover:to-[#0891B2] text-white font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-sm transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.45)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing...</span>
                      </span>
                    ) : mode === 'signup' ? (
                      'Create Account & Password'
                    ) : (
                      'Sign In to Notes'
                    )}
                  </button>
                </div>

                {/* Quick Guest / Instant Access Button */}
                <div className="pt-3">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-700/60"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest">
                      or
                    </span>
                    <div className="flex-grow border-t border-slate-700/60"></div>
                  </div>

                  <button
                    id="guest-login-button"
                    type="button"
                    onClick={() => guestLogin()}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-[#2DD4BF]/50 text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer group shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF] group-hover:scale-110 transition-transform" />
                    <span>Quick Start as Guest (Offline Mode)</span>
                  </button>
                </div>
              </form>
            )}

            {/* Legal Links */}
            {mode !== 'verify' && (
              <p
                id="auth-legal-footer"
                className="mt-6 text-center text-xs leading-relaxed text-slate-400"
              >
                By continuing, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="font-medium text-slate-300 underline underline-offset-2 hover:text-white transition-colors cursor-pointer"
                >
                  Terms
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="font-medium text-slate-300 underline underline-offset-2 hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                .
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Terms & Privacy Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-base font-semibold text-white">
                {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 text-xs text-slate-300 space-y-2.5 leading-relaxed max-h-60 overflow-y-auto pr-1">
              {activeModal === 'terms' ? (
                <>
                  <p>
                    By using this application, you agree to standard responsible usage terms.
                  </p>
                  <p>
                    <strong>Data Ownership:</strong> You retain complete ownership of all notes and content you create.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Your notes and credentials are kept strictly private to your account.
                  </p>
                  <p>
                    <strong>No Data Selling:</strong> We never sell or share your personal data or notes.
                  </p>
                </>
              )}
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg transition-all hover:opacity-90 cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
