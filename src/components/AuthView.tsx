import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BrandLogo } from './BrandLogo';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  RefreshCw,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { signUp, login, guestLogin, verifyEmail, resendVerificationCode, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
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
        setResendStatus('A fresh confirmation code has been sent to your inbox.');
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
    <div className="relative min-h-screen min-h-[100dvh] bg-[#0F1117] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200 overflow-y-auto font-nunito safe-area-top safe-area-bottom">
      {/* Main Container Card */}
      <main className="relative z-10 w-full max-w-md my-auto sm:my-6">
        <div
          id="auth-card"
          className="relative bg-[#181A24] border border-slate-800 rounded-2xl p-7 sm:p-8 shadow-xl"
        >
          {/* Header */}
          {mode === 'verify' ? (
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <BrandLogo size="lg" />
              </div>
              <h1
                id="auth-card-title"
                className="font-fredoka text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2"
              >
                Verify Email
              </h1>
              <p
                id="auth-card-subtitle"
                className="mt-2 text-xs text-slate-400 font-quicksand font-medium leading-relaxed"
              >
                We sent a 6-digit confirmation code to{' '}
                <span className="font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">{pendingEmail || email}</span>.
              </p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <BrandLogo size="lg" />
              </div>

              <h1
                id="auth-card-title"
                className="font-fredoka text-2xl font-bold tracking-tight text-white leading-tight"
              >
                {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
              </h1>
              <p
                id="auth-card-subtitle"
                className="mt-1 text-xs text-slate-400 font-quicksand font-medium"
              >
                {mode === 'signup'
                  ? 'Organize your thoughts, tasks, and ideas in one place.'
                  : 'Sign in to access your notes and workspace.'}
              </p>
            </div>
          )}

          {/* Error Message Alert */}
          {displayedError && (
            <div
              id="auth-error-alert"
              className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200 shadow-xs animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-snug font-medium">{displayedError}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div
              id="auth-success-alert"
              className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 shadow-xs animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-snug font-medium">{successMessage}</span>
            </div>
          )}

          {/* Resend Status Alert */}
          {resendStatus && (
            <div
              id="auth-resend-alert"
              className="mb-5 p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-2.5 text-xs text-sky-200 shadow-xs animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
              <span className="leading-snug font-medium">{resendStatus}</span>
            </div>
          )}

          {/* Form */}
          {mode === 'verify' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {latestCodeHint && (
                <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <KeyRound className="w-4 h-4 shrink-0 text-sky-400" />
                    <span className="truncate">
                      Code: <strong className="font-mono text-white tracking-wider">{latestCodeHint}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(latestCodeHint)}
                    className="px-2.5 py-1 text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Auto Fill
                  </button>
                </div>
              )}

              <div>
                <label
                  htmlFor="verification-code"
                  className="block text-xs font-quicksand font-bold uppercase tracking-wider text-slate-400 mb-2"
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
                  className="w-full px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] font-bold text-white bg-[#11131B] border border-slate-700 rounded-xl placeholder-slate-600 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  id="verify-submit-button"
                  type="submit"
                  disabled={submitting || verificationCode.length < 6}
                  className="btn-bouncy w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-fredoka font-bold text-sm transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 text-xs font-quicksand font-bold">
                <button
                  id="resend-code-button"
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendingCode}
                  className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendingCode ? 'animate-spin' : ''}`} />
                  {resendingCode ? 'Sending...' : 'Resend code'}
                </button>

                <button
                  id="back-to-login-button"
                  type="button"
                  onClick={() => toggleMode('login')}
                  className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address field */}
              <div id="field-group-email">
                <label
                  htmlFor="email"
                  className="block text-xs font-quicksand font-bold text-slate-300 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-medium text-slate-100 bg-[#11131B] border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-nunito"
                  />
                </div>
              </div>

              {/* Password field */}
              <div id="field-group-password">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-quicksand font-bold text-slate-300"
                  >
                    Password
                  </label>
                  {mode === 'signup' && (
                    <span className="text-[11px] font-quicksand text-slate-500">Min 8 characters</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'off'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                    className="w-full pl-10 pr-11 py-2.5 text-sm font-medium text-slate-100 bg-[#11131B] border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-nunito"
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
                    className="block text-xs font-quicksand font-bold text-slate-300 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-11 py-2.5 text-sm font-medium text-slate-100 bg-[#11131B] border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-nunito"
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
                  className="btn-bouncy w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-fredoka font-bold text-sm transition-all shadow-xs active:scale-98 disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Please wait...</span>
                    </span>
                  ) : mode === 'signup' ? (
                    <span className="flex items-center gap-1.5">
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>

              {/* Switch between Sign In and Sign Up */}
              <div className="text-center pt-2">
                {mode === 'login' ? (
                  <p className="text-xs text-slate-400 font-quicksand">
                    New to DoodlePop?{' '}
                    <button
                      type="button"
                      id="switch-to-signup-btn"
                      onClick={() => toggleMode('signup')}
                      className="font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 font-quicksand">
                    Already have an account?{' '}
                    <button
                      type="button"
                      id="switch-to-login-btn"
                      onClick={() => toggleMode('login')}
                      className="font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>

              {/* Quick Guest / Instant Access Button */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-quicksand font-bold text-slate-500 uppercase tracking-wider">
                    or
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button
                  id="guest-login-button"
                  type="button"
                  onClick={() => guestLogin()}
                  className="btn-bouncy w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white font-quicksand font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Continue as Guest (Instant Access)</span>
                </button>
              </div>
            </form>
          )}

          {/* Legal Links */}
          {mode !== 'verify' && (
            <p
              id="auth-legal-footer"
              className="mt-6 text-center text-xs leading-relaxed text-slate-500 font-quicksand"
            >
              By continuing, you agree to our{' '}
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Terms
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </p>
          )}
        </div>
      </main>

      {/* Terms & Privacy Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#181A24] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-fredoka text-lg font-bold text-white">
                {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 text-xs text-slate-300 space-y-2.5 leading-relaxed max-h-60 overflow-y-auto pr-1 font-nunito">
              {activeModal === 'terms' ? (
                <>
                  <p>
                    By using DoodlePop, you agree to standard responsible usage terms.
                  </p>
                  <p>
                    <strong>Data Ownership:</strong> You retain complete ownership of all notes, doodles, and content you create.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Your notes and credentials are kept strictly private to your account.
                  </p>
                  <p>
                    <strong>No Data Selling:</strong> We never sell or share your personal data or notes with any third parties.
                  </p>
                </>
              )}
            </div>
            <div className="mt-6 pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


