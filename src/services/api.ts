import { Note, User } from '../types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('notes_auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('notes_auth_token', token);
      } else {
        localStorage.removeItem('notes_auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(endpoint, {
        ...options,
        credentials: 'include',
        headers,
      });

      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const errorMessage = (typeof data === 'object' && data?.error) ? data.error : res.statusText || 'Request failed';
        throw new ApiError(errorMessage, res.status);
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Network failure / offline
      throw new ApiError(err.message || 'Network connection offline or unreachable', 0);
    }
  }

  // Auth endpoints
  async signUp(email: string, password: string, fullName?: string): Promise<{
    success?: boolean;
    requiresVerification?: boolean;
    verificationCode?: string;
    email?: string;
    user?: User;
    token?: string;
    message: string;
  }> {
    const res = await this.request<{
      success?: boolean;
      requiresVerification?: boolean;
      verificationCode?: string;
      email?: string;
      user?: User;
      token?: string;
      message: string;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async verifyEmail(email: string, code: string): Promise<{
    success: boolean;
    user: User;
    token: string;
    message: string;
  }> {
    const res = await this.request<{
      success: boolean;
      user: User;
      token: string;
      message: string;
    }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async resendVerificationCode(email: string): Promise<{
    success: boolean;
    email: string;
    verificationCode?: string;
    message: string;
  }> {
    return this.request<{
      success: boolean;
      email: string;
      verificationCode?: string;
      message: string;
    }>('/api/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async login(email: string, password: string): Promise<{
    user?: User;
    token?: string;
    requiresVerification?: boolean;
    verificationCode?: string;
    email?: string;
    message: string;
  }> {
    const res = await this.request<{
      user?: User;
      token?: string;
      requiresVerification?: boolean;
      verificationCode?: string;
      email?: string;
      message: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async getSession(): Promise<{ user: User; backend: string }> {
    return this.request<{ user: User; backend: string }>('/api/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Notes endpoints
  async getNotes(): Promise<{ notes: Note[] }> {
    return this.request<{ notes: Note[] }>('/api/notes');
  }

  async createNote(note: Partial<Note>): Promise<{ note: Note }> {
    return this.request<{ note: Note }>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<{ note: Note }> {
    return this.request<{ note: Note }>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteNote(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  }

  async batchSync(clientNotes: Note[], deletedIds: string[]): Promise<{ success: boolean; notes: Note[]; syncedAt: string }> {
    return this.request<{ success: boolean; notes: Note[]; syncedAt: string }>('/api/notes/sync', {
      method: 'POST',
      body: JSON.stringify({ clientNotes, deletedIds }),
    });
  }
}

export const api = new ApiService();
