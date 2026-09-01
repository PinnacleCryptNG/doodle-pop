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
  Star,
  Heart,
  Smile
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
        setLocalError('Please enter the 6-digit magic confirmation code! 🪄');
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
        setLocalError('Oops! Passwords do not match.');
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
        setResendStatus('A fresh confirmation code has been sent to your inbox! ✨');
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
    <div className="relative min-h-screen bg-[#121324] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-[#C084FC]/30 selection:text-purple-200 overflow-hidden font-nunito">
      {/* Floating Ambient Aurora Glow Spheres */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Cyan Aurora Orb */}
        <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-[#38BDF8]/20 rounded-full blur-[130px] animate-pulse-glow" />
        {/* Vibrant Purple Aurora Orb */}
        <div className="absolute top-1/4 -right-32 w-[520px] h-[520px] bg-[#C084FC]/20 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        {/* Sunny Yellow / Coral Glow Orb */}
        <div className="absolute -bottom-32 left-1/3 w-[460px] h-[460px] bg-[#FACC15]/15 rounded-full blur-[130px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Decorative cosmic floating sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute top-16 left-24 text-cyan-400/40 text-xl animate-float" style={{ animationDuration: '6s' }}>✨</div>
        <div className="absolute top-28 right-32 text-purple-400/40 text-2xl animate-float" style={{ animationDuration: '5s', animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-24 left-32 text-amber-400/40 text-lg animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }}>🎨</div>
        <div className="absolute bottom-32 right-28 text-rose-400/40 text-xl animate-float" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}>🚀</div>
      </div>

      {/* Main Container Card (Playful Glassmorphism) */}
      <main className="relative z-10 w-full max-w-md my-6">
        <div className="relative group">
          {/* Subtle Outer Neon Aurora Border */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-[#38BDF8] via-[#C084FC] to-[#FACC15] rounded-[32px] blur-sm opacity-70 group-hover:opacity-100 transition duration-700" />

          {/* Frosted Glass Card Body */}
          <div
            id="auth-card"
            className="relative bg-[#1A1B2F]/85 backdrop-blur-2xl border border-white/15 rounded-[30px] p-7 sm:p-9 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(56,189,248,0.15)]"
          >
            {/* Header with Playful Animated Mascot */}
            {mode === 'verify' ? (
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <BrandLogo size="xl" />
                </div>
                <h1
                  id="auth-card-title"
                  className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2"
                >
                  Verify your email <Sparkles className="w-5 h-5 text-amber-300" />
                </h1>
                <p
                  id="auth-card-subtitle"
                  className="mt-2 text-sm text-slate-300 font-quicksand font-medium leading-relaxed"
                >
                  We sent a 6-digit confirmation code to{' '}
                  <span className="font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">{pendingEmail || email}</span>.
                </p>
              </div>
            ) : (
              <div className="text-center mb-6">
                {/* Floating Mascot */}
                <div className="flex justify-center mb-3">
                  <BrandLogo size="xl" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-amber-500/15 border border-white/15 text-xs font-bold text-cyan-200 mb-2 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span className="font-quicksand">Your Fun, Creative Note Space</span>
                </div>

                <h1
                  id="auth-card-title"
                  className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight"
                >
                  {mode === 'signup' ? (
                    <span className="flex items-center justify-center gap-2">
                      Join DoodlePop! <span className="text-amber-400">🚀</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Welcome Back! <span className="text-cyan-400">✨</span>
                    </span>
                  )}
                </h1>
                <p
                  id="auth-card-subtitle"
                  className="mt-1.5 text-xs sm:text-sm text-slate-300 font-quicksand font-semibold"
                >
                  {mode === 'signup'
                    ? 'Start capturing doodles, ideas, and stories in full color!'
                    : 'Sign in to jump straight into your colorful notes!'}
                </p>
              </div>
            )}

            {/* Error Message Alert */}
            {displayedError && (
              <div
                id="auth-error-alert"
                className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-200 shadow-md animate-in fade-in slide-in-from-top-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-snug font-medium">{displayedError}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div
                id="auth-success-alert"
                className="mb-5 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-start gap-2.5 text-xs text-emerald-200 shadow-md animate-in fade-in slide-in-from-top-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-snug font-medium">{successMessage}</span>
              </div>
            )}

            {/* Resend Status Alert */}
            {resendStatus && (
              <div
                id="auth-resend-alert"
                className="mb-5 p-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 flex items-start gap-2.5 text-xs text-cyan-200 shadow-md animate-in fade-in slide-in-from-top-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <span className="leading-snug font-medium">{resendStatus}</span>
              </div>
            )}

            {/* Form */}
            {mode === 'verify' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {latestCodeHint && (
                  <div className="p-3 bg-purple-950/50 border border-[#C084FC]/40 rounded-2xl flex items-center justify-between gap-2 text-xs shadow-inner">
                    <div className="flex items-center gap-2 text-purple-200 truncate">
                      <KeyRound className="w-4 h-4 shrink-0 text-[#C084FC]" />
                      <span className="truncate">
                        Confirmation code: <strong className="font-mono text-white tracking-wider font-bold">{latestCodeHint}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVerificationCode(latestCodeHint)}
                      className="px-3 py-1 text-xs font-bold bg-[#C084FC]/25 hover:bg-[#C084FC]/40 border border-[#C084FC]/50 text-purple-100 rounded-xl transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                    >
                      Fill Code
                    </button>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="verification-code"
                    className="block text-xs font-quicksand font-bold uppercase tracking-wider text-slate-300 mb-2"
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
                    className="w-full px-4 py-3.5 text-center font-mono text-2xl tracking-[0.45em] font-bold text-white bg-[#121324]/80 border-2 border-slate-700/80 rounded-2xl placeholder-slate-600 focus:outline-none focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/30 focus:shadow-[0_0_30px_rgba(56,189,248,0.35)] transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    id="verify-submit-button"
                    type="submit"
                    disabled={submitting || verificationCode.length < 6}
                    className="btn-bouncy relative w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] hover:from-[#0284C7] hover:to-[#A855F7] text-white font-fredoka font-bold text-base transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:shadow-[0_0_40px_rgba(192,132,252,0.6)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Verifying Magic Code...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Verify & Enter Workspace</span>
                        <Sparkles className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 text-xs font-quicksand font-bold">
                  <button
                    id="resend-code-button"
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendingCode}
                    className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5 hover:scale-105"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendingCode ? 'animate-spin' : ''}`} />
                    {resendingCode ? 'Sending...' : 'Resend code'}
                  </button>

                  <button
                    id="back-to-login-button"
                    type="button"
                    onClick={() => toggleMode('login')}
                    className="text-slate-300 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1 hover:scale-105"
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
                    className="block text-xs font-quicksand font-bold text-slate-200 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-[#38BDF8] transition-colors">
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
                      placeholder="hello@doodlepop.app"
                      className="w-full pl-10 pr-4 py-3 text-sm font-medium text-slate-100 bg-[#121324]/80 border border-slate-700/80 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/25 focus:shadow-[0_0_25px_rgba(56,189,248,0.25)] transition-all font-nunito"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div id="field-group-password">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-quicksand font-bold text-slate-200"
                    >
                      Password
                    </label>
                    {mode === 'signup' && (
                      <span className="text-[11px] font-quicksand font-bold text-purple-300">Min 8 characters</span>
                    )}
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-[#C084FC] transition-colors">
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
                      placeholder={mode === 'signup' ? 'Choose a super secure password' : 'Enter your password'}
                      className="w-full pl-10 pr-11 py-3 text-sm font-medium text-slate-100 bg-[#121324]/80 border border-slate-700/80 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/25 focus:shadow-[0_0_25px_rgba(192,132,252,0.25)] transition-all font-nunito"
                    />
                    <button
                      id="toggle-password-visibility"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-300 cursor-pointer transition-colors"
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
                      className="block text-xs font-quicksand font-bold text-slate-200 mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-[#FB7185] transition-colors">
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
                        placeholder="Re-enter password to match"
                        className="w-full pl-10 pr-11 py-3 text-sm font-medium text-slate-100 bg-[#121324]/80 border border-slate-700/80 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-[#FB7185] focus:ring-4 focus:ring-[#FB7185]/25 focus:shadow-[0_0_25px_rgba(251,113,133,0.25)] transition-all font-nunito"
                      />
                      <button
                        id="toggle-confirm-password-visibility"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit button with playful bouncy styling and dynamic glow */}
                <div className="pt-2">
                  <button
                    id="auth-submit-btn"
                    type="submit"
                    disabled={submitting}
                    className="btn-bouncy relative w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] hover:from-[#0284C7] hover:to-[#9333EA] text-white font-fredoka font-bold text-base transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.45)] hover:shadow-[0_0_40px_rgba(192,132,252,0.65)] active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Opening Door...</span>
                      </span>
                    ) : mode === 'signup' ? (
                      <span className="flex items-center gap-2">
                        <span>Create My Account</span>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Sign In to DoodlePop</span>
                        <Zap className="w-4 h-4 text-amber-300" />
                      </span>
                    )}
                  </button>
                </div>

                {/* Switch between Sign In and Sign Up */}
                <div className="text-center pt-2">
                  {mode === 'login' ? (
                    <p className="text-xs text-slate-300 font-quicksand font-bold">
                      New to DoodlePop?{' '}
                      <button
                        type="button"
                        id="switch-to-signup-btn"
                        onClick={() => toggleMode('signup')}
                        className="font-bold text-[#38BDF8] hover:text-[#7DD3FC] underline underline-offset-4 transition-colors cursor-pointer"
                      >
                        Create an account ✨
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-300 font-quicksand font-bold">
                      Already have an account?{' '}
                      <button
                        type="button"
                        id="switch-to-login-btn"
                        onClick={() => toggleMode('login')}
                        className="font-bold text-[#C084FC] hover:text-[#D8B4FE] underline underline-offset-4 transition-colors cursor-pointer"
                      >
                        Sign In 🚀
                      </button>
                    </p>
                  )}
                </div>

                {/* Quick Guest / Instant Access Button */}
                <div className="pt-2">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-700/60"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-quicksand font-bold text-slate-400 uppercase tracking-widest">
                      or
                    </span>
                    <div className="flex-grow border-t border-slate-700/60"></div>
                  </div>

                  <button
                    id="guest-login-button"
                    type="button"
                    onClick={() => guestLogin()}
                    className="btn-bouncy w-full py-3 px-4 rounded-2xl bg-[#241B3F]/70 hover:bg-[#2F2156]/90 border border-[#C084FC]/30 hover:border-[#38BDF8]/60 text-slate-200 hover:text-white font-quicksand font-bold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer group shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-[#FACC15] group-hover:scale-125 transition-transform" />
                    <span>Quick Play as Guest (Instant Access)</span>
                  </button>
                </div>
              </form>
            )}

            {/* Legal Links */}
            {mode !== 'verify' && (
              <p
                id="auth-legal-footer"
                className="mt-6 text-center text-xs leading-relaxed text-slate-400 font-quicksand"
              >
                By continuing, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="font-bold text-slate-300 underline underline-offset-2 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Terms
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="font-bold text-slate-300 underline underline-offset-2 hover:text-cyan-300 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#1A1B2F]/95 border-2 border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl text-left backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
              <h3 className="font-fredoka text-lg font-bold text-white flex items-center gap-2">
                {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
            <div className="mt-6 pt-3 border-t border-slate-700/70 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="btn-bouncy px-5 py-2 text-xs font-bold bg-gradient-to-r from-[#38BDF8] to-[#C084FC] text-white rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              >
                Understood! 👍
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

