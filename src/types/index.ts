export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  is_email_verified?: boolean;
  created_at?: string;
}

export type NoteColor =
  | 'obsidian'
  | 'sahara'
  | 'nordic'
  | 'kyoto'
  | 'bordeaux'
  | 'titanium'
  | 'cyan'
  | 'purple'
  | 'amber'
  | 'mint'
  | 'coral'
  | 'pink'
  | 'default';

export interface FolderItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const DEFAULT_FOLDERS: FolderItem[] = [
  { id: 'Personal', label: 'Personal', icon: 'folder', color: '#0EA5E9' },
  { id: 'School', label: 'School', icon: 'book', color: '#10B981' },
  { id: 'Work', label: 'Work', icon: 'briefcase', color: '#818CF8' },
  { id: 'Archive', label: 'Archive', icon: 'archive', color: '#94A3B8' },
];

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
  themeTitle: string;
  primary: string;
  primaryHover: string;
  rgb: string;
  glow: string;
  pageGradient: string;
  cardBg: string;
  border: string;
  badge: string;
  dot: string;
  buttonGradient: string;
  textAccent: string;
  bgTint: string;
  borderTint: string;
  activeNavBg: string;
  activeNavText: string;
  activeNavBorder: string;
}

export const THEME_PALETTES: { id: NoteColor; label: string; primary: string; hover: string }[] = [
  { id: 'obsidian', label: 'Obsidian Cyan', primary: '#0EA5E9', hover: '#38BDF8' },
  { id: 'sahara', label: 'Sahara Ochre', primary: '#F59E0B', hover: '#FBBF24' },
  { id: 'nordic', label: 'Nordic Pine', primary: '#10B981', hover: '#34D399' },
  { id: 'kyoto', label: 'Kyoto Violet', primary: '#818CF8', hover: '#A5B4FC' },
  { id: 'bordeaux', label: 'Bordeaux Crimson', primary: '#F43F5E', hover: '#FB7185' },
  { id: 'titanium', label: 'Titanium Graphite', primary: '#94A3B8', hover: '#CBD5E1' },
];

export const NOTE_COLORS: Record<string, ColorOption> = {
  obsidian: {
    id: 'obsidian',
    label: 'Obsidian Cyan',
    themeTitle: 'Obsidian Deep',
    primary: '#0EA5E9',
    primaryHover: '#38BDF8',
    rgb: '14, 165, 233',
    glow: 'rgba(14, 165, 233, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#161824]',
    border: 'border-slate-800 hover:border-sky-500/40',
    badge: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    dot: 'bg-sky-400',
    buttonGradient: '#0EA5E9',
    textAccent: 'text-sky-400',
    bgTint: 'bg-sky-500/15',
    borderTint: 'border-sky-500/40',
    activeNavBg: 'bg-sky-500/15',
    activeNavText: 'text-sky-300',
    activeNavBorder: 'border-sky-500/30',
  },
  sahara: {
    id: 'sahara',
    label: 'Sahara Ochre',
    themeTitle: 'Sahara Amber',
    primary: '#F59E0B',
    primaryHover: '#FBBF24',
    rgb: '245, 158, 11',
    glow: 'rgba(245, 158, 11, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#18161A]',
    border: 'border-amber-950/60 hover:border-amber-500/40',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
    buttonGradient: '#F59E0B',
    textAccent: 'text-amber-400',
    bgTint: 'bg-amber-500/15',
    borderTint: 'border-amber-500/40',
    activeNavBg: 'bg-amber-500/15',
    activeNavText: 'text-amber-300',
    activeNavBorder: 'border-amber-500/30',
  },
  nordic: {
    id: 'nordic',
    label: 'Nordic Pine',
    themeTitle: 'Nordic Emerald',
    primary: '#10B981',
    primaryHover: '#34D399',
    rgb: '16, 185, 129',
    glow: 'rgba(16, 185, 129, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#14191E]',
    border: 'border-emerald-950/60 hover:border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
    buttonGradient: '#10B981',
    textAccent: 'text-emerald-400',
    bgTint: 'bg-emerald-500/15',
    borderTint: 'border-emerald-500/40',
    activeNavBg: 'bg-emerald-500/15',
    activeNavText: 'text-emerald-300',
    activeNavBorder: 'border-emerald-500/30',
  },
  kyoto: {
    id: 'kyoto',
    label: 'Kyoto Violet',
    themeTitle: 'Kyoto Twilight',
    primary: '#818CF8',
    primaryHover: '#A5B4FC',
    rgb: '129, 140, 248',
    glow: 'rgba(129, 140, 248, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#171626]',
    border: 'border-indigo-950/60 hover:border-indigo-500/40',
    badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    dot: 'bg-indigo-400',
    buttonGradient: '#818CF8',
    textAccent: 'text-indigo-400',
    bgTint: 'bg-indigo-500/15',
    borderTint: 'border-indigo-500/40',
    activeNavBg: 'bg-indigo-500/15',
    activeNavText: 'text-indigo-300',
    activeNavBorder: 'border-indigo-500/30',
  },
  bordeaux: {
    id: 'bordeaux',
    label: 'Bordeaux Crimson',
    themeTitle: 'Bordeaux Rose',
    primary: '#F43F5E',
    primaryHover: '#FB7185',
    rgb: '244, 63, 94',
    glow: 'rgba(244, 63, 94, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#1B151C]',
    border: 'border-rose-950/60 hover:border-rose-500/40',
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    dot: 'bg-rose-400',
    buttonGradient: '#F43F5E',
    textAccent: 'text-rose-400',
    bgTint: 'bg-rose-500/15',
    borderTint: 'border-rose-500/40',
    activeNavBg: 'bg-rose-500/15',
    activeNavText: 'text-rose-300',
    activeNavBorder: 'border-rose-500/30',
  },
  titanium: {
    id: 'titanium',
    label: 'Titanium Graphite',
    themeTitle: 'Monochrome Slate',
    primary: '#94A3B8',
    primaryHover: '#CBD5E1',
    rgb: '148, 163, 184',
    glow: 'rgba(148, 163, 184, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#16171D]',
    border: 'border-slate-800 hover:border-slate-500/40',
    badge: 'bg-slate-500/10 text-slate-300 border border-slate-500/20',
    dot: 'bg-slate-400',
    buttonGradient: '#94A3B8',
    textAccent: 'text-slate-300',
    bgTint: 'bg-slate-700/40',
    borderTint: 'border-slate-500/40',
    activeNavBg: 'bg-slate-700/40',
    activeNavText: 'text-slate-200',
    activeNavBorder: 'border-slate-500/30',
  },
  // Compatibility aliases
  cyan: {
    id: 'obsidian',
    label: 'Obsidian Cyan',
    themeTitle: 'Obsidian Deep',
    primary: '#0EA5E9',
    primaryHover: '#38BDF8',
    rgb: '14, 165, 233',
    glow: 'rgba(14, 165, 233, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#161824]',
    border: 'border-slate-800 hover:border-sky-500/40',
    badge: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    dot: 'bg-sky-400',
    buttonGradient: '#0EA5E9',
    textAccent: 'text-sky-400',
    bgTint: 'bg-sky-500/15',
    borderTint: 'border-sky-500/40',
    activeNavBg: 'bg-sky-500/15',
    activeNavText: 'text-sky-300',
    activeNavBorder: 'border-sky-500/30',
  },
  purple: {
    id: 'kyoto',
    label: 'Kyoto Violet',
    themeTitle: 'Kyoto Twilight',
    primary: '#818CF8',
    primaryHover: '#A5B4FC',
    rgb: '129, 140, 248',
    glow: 'rgba(129, 140, 248, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#171626]',
    border: 'border-indigo-950/60 hover:border-indigo-500/40',
    badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    dot: 'bg-indigo-400',
    buttonGradient: '#818CF8',
    textAccent: 'text-indigo-400',
    bgTint: 'bg-indigo-500/15',
    borderTint: 'border-indigo-500/40',
    activeNavBg: 'bg-indigo-500/15',
    activeNavText: 'text-indigo-300',
    activeNavBorder: 'border-indigo-500/30',
  },
  mint: {
    id: 'nordic',
    label: 'Nordic Pine',
    themeTitle: 'Nordic Emerald',
    primary: '#10B981',
    primaryHover: '#34D399',
    rgb: '16, 185, 129',
    glow: 'rgba(16, 185, 129, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#14191E]',
    border: 'border-emerald-950/60 hover:border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
    buttonGradient: '#10B981',
    textAccent: 'text-emerald-400',
    bgTint: 'bg-emerald-500/15',
    borderTint: 'border-emerald-500/40',
    activeNavBg: 'bg-emerald-500/15',
    activeNavText: 'text-emerald-300',
    activeNavBorder: 'border-emerald-500/30',
  },
  coral: {
    id: 'bordeaux',
    label: 'Bordeaux Crimson',
    themeTitle: 'Bordeaux Rose',
    primary: '#F43F5E',
    primaryHover: '#FB7185',
    rgb: '244, 63, 94',
    glow: 'rgba(244, 63, 94, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#1B151C]',
    border: 'border-rose-950/60 hover:border-rose-500/40',
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    dot: 'bg-rose-400',
    buttonGradient: '#F43F5E',
    textAccent: 'text-rose-400',
    bgTint: 'bg-rose-500/15',
    borderTint: 'border-rose-500/40',
    activeNavBg: 'bg-rose-500/15',
    activeNavText: 'text-rose-300',
    activeNavBorder: 'border-rose-500/30',
  },
  amber: {
    id: 'sahara',
    label: 'Sahara Ochre',
    themeTitle: 'Sahara Amber',
    primary: '#F59E0B',
    primaryHover: '#FBBF24',
    rgb: '245, 158, 11',
    glow: 'rgba(245, 158, 11, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#18161A]',
    border: 'border-amber-950/60 hover:border-amber-500/40',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
    buttonGradient: '#F59E0B',
    textAccent: 'text-amber-400',
    bgTint: 'bg-amber-500/15',
    borderTint: 'border-amber-500/40',
    activeNavBg: 'bg-amber-500/15',
    activeNavText: 'text-amber-300',
    activeNavBorder: 'border-amber-500/30',
  },
  pink: {
    id: 'bordeaux',
    label: 'Bordeaux Crimson',
    themeTitle: 'Bordeaux Rose',
    primary: '#F43F5E',
    primaryHover: '#FB7185',
    rgb: '244, 63, 94',
    glow: 'rgba(244, 63, 94, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#1B151C]',
    border: 'border-rose-950/60 hover:border-rose-500/40',
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    dot: 'bg-rose-400',
    buttonGradient: '#F43F5E',
    textAccent: 'text-rose-400',
    bgTint: 'bg-rose-500/15',
    borderTint: 'border-rose-500/40',
    activeNavBg: 'bg-rose-500/15',
    activeNavText: 'text-rose-300',
    activeNavBorder: 'border-rose-500/30',
  },
  default: {
    id: 'obsidian',
    label: 'Obsidian Cyan',
    themeTitle: 'Obsidian Deep',
    primary: '#0EA5E9',
    primaryHover: '#38BDF8',
    rgb: '14, 165, 233',
    glow: 'rgba(14, 165, 233, 0.2)',
    pageGradient: 'none',
    cardBg: 'bg-[#161824]',
    border: 'border-slate-800 hover:border-sky-500/40',
    badge: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    dot: 'bg-sky-400',
    buttonGradient: '#0EA5E9',
    textAccent: 'text-sky-400',
    bgTint: 'bg-sky-500/15',
    borderTint: 'border-sky-500/40',
    activeNavBg: 'bg-sky-500/15',
    activeNavText: 'text-sky-300',
    activeNavBorder: 'border-sky-500/30',
  },
};

export const getThemeConfig = (colorName?: string): ColorOption => {
  if (!colorName) return NOTE_COLORS.obsidian;
  const key = colorName.toLowerCase();
  return NOTE_COLORS[key] || NOTE_COLORS.obsidian;
};
