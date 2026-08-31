import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  backendMode: string;
  signUp: (email: string, password: string, fullName?: string) => Promise<{
    success: boolean;
    requiresVerification?: boolean;
    verificationCode?: string;
    email?: string;
    message?: string;
    error?: string;
  }>;
  verifyEmail: (email: string, code: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  resendVerificationCode: (email: string) => Promise<{
    success: boolean;
    verificationCode?: string;
    message?: string;
    error?: string;
  }>;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    requiresVerification?: boolean;
    verificationCode?: string;
    email?: string;
    message?: string;
    error?: string;
  }>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('notes_user_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [backendMode, setBackendMode] = useState<string>('checking...');

  const clearError = useCallback(() => setError(null), []);

  // Verify session on mount
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const token = api.getToken();
        if (!token && !user) {
          if (isMounted) setLoading(false);
          return;
        }

        const data = await api.getSession();
        if (isMounted && data.user) {
          setUser(data.user);
          setBackendMode(data.backend);
          localStorage.setItem('notes_user_session', JSON.stringify(data.user));
        }
      } catch (err: any) {
        // If offline, keep cached user session to allow offline mode
        if (navigator.onLine && err.status === 401) {
          if (isMounted) {
            setUser(null);
            api.setToken(null);
            localStorage.removeItem('notes_user_session');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.signUp(email, password, fullName);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('notes_user_session', JSON.stringify(res.user));
      }
      return {
        success: true,
        requiresVerification: res.requiresVerification,
        verificationCode: res.verificationCode,
        email: res.email,
        message: res.message,
      };
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.verifyEmail(email, code);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('notes_user_session', JSON.stringify(res.user));
      }
      return { success: true, message: res.message };
    } catch (err: any) {
      const msg = err.message || 'Verification failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async (email: string) => {
    setError(null);
    try {
      const res = await api.resendVerificationCode(email);
      return {
        success: true,
        verificationCode: res.verificationCode,
        message: res.message,
      };
    } catch (err: any) {
      const msg = err.message || 'Failed to resend confirmation code';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('notes_user_session', JSON.stringify(res.user));
      }
      return {
        success: true,
        requiresVerification: res.requiresVerification,
        verificationCode: res.verificationCode,
        email: res.email,
        message: res.message,
      };
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      return {
        success: false,
        requiresVerification: err.status === 403 || msg.toLowerCase().includes('confirm'),
        error: msg,
      };
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.guestLogin();
      setUser(res.user);
      localStorage.setItem('notes_user_session', JSON.stringify(res.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout api call failed:', e);
    } finally {
      setUser(null);
      api.setToken(null);
      localStorage.removeItem('notes_user_session');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        backendMode,
        signUp,
        verifyEmail,
        resendVerificationCode,
        login,
        guestLogin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
