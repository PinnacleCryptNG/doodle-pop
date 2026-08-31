export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  is_email_verified?: boolean;
  created_at?: string;
}

export type NoteColor = 'default' | 'teal' | 'indigo' | 'amber' | 'emerald' | 'rose' | 'slate';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  color_tag: NoteColor | string;
  tags: string[];
  folder?: string;
  created_at: string;
  updated_at: string;
  _syncStatus?: 'synced' | 'pending' | 'error';
}

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'error';

export interface SyncAction {
  id: string;
  action: 'create' | 'update' | 'delete';
  noteId: string;
  userId: string;
  payload?: Partial<Note>;
  timestamp: number;
}

export type SortOption = 'created_desc' | 'created_asc' | 'updated_desc' | 'title_asc';

export interface ColorOption {
  id: NoteColor;
  label: string;
  cardBg: string;
  border: string;
  badge: string;
  dot: string;
}

export const NOTE_COLORS: Record<NoteColor, ColorOption> = {
  default: {
    id: 'default',
    label: 'Standard Slate',
    cardBg: 'bg-[#1E1E2E]/90',
    border: 'border-white/[0.08]',
    badge: 'bg-white/[0.06] text-slate-300 border border-white/[0.08]',
    dot: 'bg-slate-400',
  },
  teal: {
    id: 'teal',
    label: 'Pastel Teal',
    cardBg: 'bg-[#1E1E2E]/90',
    border: 'border-[#2DD4BF]/30',
    badge: 'bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/25',
    dot: 'bg-[#2DD4BF]',
  },
  indigo: {
    id: 'indigo',
    label: 'Soft Indigo',
    cardBg: 'bg-[#1E1E2E]/90',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25',
    dot: 'bg-indigo-400',
  },
  amber: {
    id: 'amber',
    label: 'Warm Amber',
    cardBg: 'bg-[#1E1E2E]/90',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-300 border border-amber-500/25',
    dot: 'bg-amber-400',
  },
  emerald: {
    id: 'emerald',
    label: 'Sage Emerald',
    cardBg: 'bg-[#1E1E2E]/90',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
  rose: {
    id: 'rose',
    label: 'Rose Quartz',
    cardBg: 'bg-[#1E1E2E]/90',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/10 text-rose-300 border border-rose-500/25',
    dot: 'bg-rose-400',
  },
  slate: {
    id: 'slate',
    label: 'Deep Granite',
    cardBg: 'bg-[#1A1A26]/90',
    border: 'border-slate-700/60',
    badge: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    dot: 'bg-slate-500',
  },
};

