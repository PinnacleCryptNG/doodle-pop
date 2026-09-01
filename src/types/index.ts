export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  is_email_verified?: boolean;
  created_at?: string;
}

export type NoteColor = 'cyan' | 'purple' | 'amber' | 'mint' | 'coral' | 'pink' | 'violet' | 'sun' | 'slate' | 'teal' | 'indigo' | 'emerald' | 'rose' | 'sky' | 'default';

export interface FolderItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  badgeBg?: string;
}

export const DEFAULT_FOLDERS: FolderItem[] = [
  { id: 'Personal', label: 'Personal & Chill', icon: '✨', color: '#38BDF8', badgeBg: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'School & Work', label: 'School & Projects', icon: '🚀', color: '#C084FC', badgeBg: 'bg-purple-500/20 text-purple-300' },
  { id: 'My Diary', label: 'Secret Diary', icon: '🔮', color: '#FACC15', badgeBg: 'bg-amber-500/20 text-amber-300' },
  { id: 'Fun & Ideas', label: 'Crazy Ideas', icon: '🎨', color: '#FB7185', badgeBg: 'bg-rose-500/20 text-rose-300' },
  { id: 'Wishlist', label: 'Dream Wishlist', icon: '⭐', color: '#34D399', badgeBg: 'bg-emerald-500/20 text-emerald-300' },
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
  primary: string;
  primaryHover: string;
  glow: string;
  pageGradient: string;
  cardBg: string;
  border: string;
  badge: string;
  dot: string;
  buttonGradient: string;
  textAccent: string;
  bgGlowClass: string;
  auroraOrbs: { color: string; position: string; size: string }[];
}

export const NOTE_COLORS: Record<string, ColorOption> = {
  cyan: {
    id: 'cyan',
    label: 'Electric Cyan',
    primary: '#38BDF8',
    primaryHover: '#7DD3FC',
    glow: 'rgba(56, 189, 248, 0.4)',
    pageGradient: 'radial-gradient(circle at 20% 15%, rgba(56,189,248,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(192,132,252,0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(250,204,21,0.06) 0%, transparent 60%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#38BDF8]/40 hover:border-[#38BDF8]/70 shadow-[0_4px_24px_rgba(56,189,248,0.12)]',
    badge: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    dot: 'bg-[#38BDF8]',
    buttonGradient: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
    textAccent: 'text-[#38BDF8]',
    bgGlowClass: 'from-cyan-500/20 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#38BDF8', position: '-top-20 -left-20', size: 'w-96 h-96' },
      { color: '#C084FC', position: 'top-1/3 -right-20', size: 'w-[420px] h-[420px]' },
      { color: '#FACC15', position: '-bottom-20 left-1/4', size: 'w-80 h-80' },
    ],
  },
  purple: {
    id: 'purple',
    label: 'Cosmic Purple',
    primary: '#C084FC',
    primaryHover: '#D8B4FE',
    glow: 'rgba(192, 132, 252, 0.4)',
    pageGradient: 'radial-gradient(circle at 25% 15%, rgba(192,132,252,0.2) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.15) 0%, transparent 50%), radial-gradient(circle at 50% 40%, rgba(251,113,133,0.08) 0%, transparent 60%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#C084FC]/40 hover:border-[#C084FC]/70 shadow-[0_4px_24px_rgba(192,132,252,0.12)]',
    badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    dot: 'bg-[#C084FC]',
    buttonGradient: 'linear-gradient(135deg, #C084FC 0%, #7E22CE 100%)',
    textAccent: 'text-[#C084FC]',
    bgGlowClass: 'from-purple-500/20 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#C084FC', position: '-top-20 right-10', size: 'w-96 h-96' },
      { color: '#38BDF8', position: 'bottom-20 -left-10', size: 'w-[400px] h-[400px]' },
      { color: '#F43F5E', position: 'top-1/2 right-1/4', size: 'w-72 h-72' },
    ],
  },
  mint: {
    id: 'mint',
    label: 'Mint Magic',
    primary: '#34D399',
    primaryHover: '#6EE7B7',
    glow: 'rgba(52, 211, 153, 0.4)',
    pageGradient: 'radial-gradient(circle at 20% 20%, rgba(52,211,153,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(56,189,248,0.14) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#34D399]/40 hover:border-[#34D399]/70 shadow-[0_4px_24px_rgba(52,211,153,0.12)]',
    badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    dot: 'bg-[#34D399]',
    buttonGradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    textAccent: 'text-[#34D399]',
    bgGlowClass: 'from-emerald-500/20 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#34D399', position: '-top-10 left-10', size: 'w-96 h-96' },
      { color: '#38BDF8', position: 'bottom-10 right-10', size: 'w-80 h-80' },
      { color: '#FACC15', position: 'top-1/2 left-1/3', size: 'w-72 h-72' },
    ],
  },
  coral: {
    id: 'coral',
    label: 'Sunset Coral',
    primary: '#FB7185',
    primaryHover: '#FDA4AF',
    glow: 'rgba(251, 113, 133, 0.4)',
    pageGradient: 'radial-gradient(circle at 20% 15%, rgba(251,113,133,0.2) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(250,204,21,0.14) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#FB7185]/40 hover:border-[#FB7185]/70 shadow-[0_4px_24px_rgba(251,113,133,0.12)]',
    badge: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    dot: 'bg-[#FB7185]',
    buttonGradient: 'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)',
    textAccent: 'text-[#FB7185]',
    bgGlowClass: 'from-rose-500/20 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#FB7185', position: '-top-20 right-10', size: 'w-96 h-96' },
      { color: '#FACC15', position: 'bottom-10 left-10', size: 'w-88 h-88' },
      { color: '#C084FC', position: 'top-1/2 left-1/2', size: 'w-72 h-72' },
    ],
  },
  amber: {
    id: 'amber',
    label: 'Sunny Spark',
    primary: '#FACC15',
    primaryHover: '#FDE047',
    glow: 'rgba(250, 204, 21, 0.4)',
    pageGradient: 'radial-gradient(circle at 20% 20%, rgba(250,204,21,0.2) 0%, transparent 45%), radial-gradient(circle at 80% 75%, rgba(251,113,133,0.15) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#FACC15]/40 hover:border-[#FACC15]/70 shadow-[0_4px_24px_rgba(250,204,21,0.12)]',
    badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    dot: 'bg-[#FACC15]',
    buttonGradient: 'linear-gradient(135deg, #FACC15 0%, #D97706 100%)',
    textAccent: 'text-[#FACC15]',
    bgGlowClass: 'from-amber-500/20 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#FACC15', position: '-top-10 left-20', size: 'w-96 h-96' },
      { color: '#FB7185', position: 'bottom-10 right-20', size: 'w-80 h-80' },
      { color: '#38BDF8', position: 'top-1/2 right-1/3', size: 'w-72 h-72' },
    ],
  },
  pink: {
    id: 'pink',
    label: 'Bubblegum Pop',
    primary: '#F472B6',
    primaryHover: '#F9A8D4',
    glow: 'rgba(244, 114, 182, 0.4)',
    pageGradient: 'radial-gradient(circle at 25% 15%, rgba(244,114,182,0.2) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgba(192,132,252,0.16) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#F472B6]/40 hover:border-[#F472B6]/70 shadow-[0_4px_24px_rgba(244,114,182,0.12)]',
    badge: 'bg-pink-500/15 text-pink-300 border border-pink-500/30',
    dot: 'bg-[#F472B6]',
    buttonGradient: 'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)',
    textAccent: 'text-[#F472B6]',
    bgGlowClass: 'from-pink-500/20 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#F472B6', position: '-top-10 right-10', size: 'w-96 h-96' },
      { color: '#C084FC', position: 'bottom-20 left-10', size: 'w-88 h-88' },
      { color: '#38BDF8', position: 'top-1/3 left-1/4', size: 'w-72 h-72' },
    ],
  },
  // Backward compatibility mappings
  teal: {
    id: 'teal',
    label: 'Electric Cyan',
    primary: '#38BDF8',
    primaryHover: '#7DD3FC',
    glow: 'rgba(56, 189, 248, 0.4)',
    pageGradient: 'radial-gradient(circle at 20% 15%, rgba(56,189,248,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(192,132,252,0.15) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#38BDF8]/40 hover:border-[#38BDF8]/70 shadow-[0_4px_24px_rgba(56,189,248,0.12)]',
    badge: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    dot: 'bg-[#38BDF8]',
    buttonGradient: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
    textAccent: 'text-[#38BDF8]',
    bgGlowClass: 'from-cyan-500/20 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#38BDF8', position: '-top-20 -left-20', size: 'w-96 h-96' },
      { color: '#C084FC', position: 'top-1/3 -right-20', size: 'w-[420px] h-[420px]' },
    ],
  },
  indigo: {
    id: 'indigo',
    label: 'Cosmic Purple',
    primary: '#C084FC',
    primaryHover: '#D8B4FE',
    glow: 'rgba(192, 132, 252, 0.4)',
    pageGradient: 'radial-gradient(circle at 25% 15%, rgba(192,132,252,0.2) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.15) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#C084FC]/40 hover:border-[#C084FC]/70',
    badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    dot: 'bg-[#C084FC]',
    buttonGradient: 'linear-gradient(135deg, #C084FC 0%, #7E22CE 100%)',
    textAccent: 'text-[#C084FC]',
    bgGlowClass: 'from-purple-500/20 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#C084FC', position: '-top-20 right-10', size: 'w-96 h-96' },
      { color: '#38BDF8', position: 'bottom-20 -left-10', size: 'w-[400px] h-[400px]' },
    ],
  },
  emerald: {
    id: 'emerald',
    label: 'Mint Magic',
    primary: '#34D399',
    primaryHover: '#6EE7B7',
    glow: 'rgba(52, 211, 153, 0.4)',
    pageGradient: 'radial-gradient(circle at 20% 20%, rgba(52,211,153,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(56,189,248,0.14) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#34D399]/40',
    badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    dot: 'bg-[#34D399]',
    buttonGradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    textAccent: 'text-[#34D399]',
    bgGlowClass: 'from-emerald-500/20 via-transparent to-transparent',
    auroraOrbs: [{ color: '#34D399', position: '-top-10 left-10', size: 'w-96 h-96' }],
  },
  rose: {
    id: 'rose',
    label: 'Sunset Coral',
    primary: '#FB7185',
    primaryHover: '#FDA4AF',
    glow: 'rgba(251, 113, 133, 0.4)',
    pageGradient: 'radial-gradient(circle at 20% 15%, rgba(251,113,133,0.2) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(250,204,21,0.14) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#FB7185]/40',
    badge: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    dot: 'bg-[#FB7185]',
    buttonGradient: 'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)',
    textAccent: 'text-[#FB7185]',
    bgGlowClass: 'from-rose-500/20 via-transparent to-transparent',
    auroraOrbs: [{ color: '#FB7185', position: '-top-20 right-10', size: 'w-96 h-96' }],
  },
  sky: {
    id: 'sky',
    label: 'Electric Cyan',
    primary: '#38BDF8',
    primaryHover: '#7DD3FC',
    glow: 'rgba(56, 189, 248, 0.4)',
    pageGradient: 'radial-gradient(circle at 20% 15%, rgba(56,189,248,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(192,132,252,0.15) 0%, transparent 50%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-[#38BDF8]/40',
    badge: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    dot: 'bg-[#38BDF8]',
    buttonGradient: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
    textAccent: 'text-[#38BDF8]',
    bgGlowClass: 'from-cyan-500/20 via-transparent to-transparent',
    auroraOrbs: [{ color: '#38BDF8', position: '-top-20 -left-20', size: 'w-96 h-96' }],
  },
  default: {
    id: 'default',
    label: 'Cosmic Indigo',
    primary: '#38BDF8',
    primaryHover: '#7DD3FC',
    glow: 'rgba(56, 189, 248, 0.35)',
    pageGradient: 'radial-gradient(circle at 20% 15%, rgba(56,189,248,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(192,132,252,0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(250,204,21,0.06) 0%, transparent 60%)',
    cardBg: 'bg-[#1A1B2F]/80 backdrop-blur-xl',
    border: 'border-white/10 hover:border-cyan-400/40 shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
    badge: 'bg-white/10 text-cyan-200 border border-white/10',
    dot: 'bg-[#38BDF8]',
    buttonGradient: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)',
    textAccent: 'text-cyan-400',
    bgGlowClass: 'from-cyan-500/15 via-transparent to-transparent',
    auroraOrbs: [
      { color: '#38BDF8', position: '-top-20 -left-20', size: 'w-96 h-96' },
      { color: '#C084FC', position: 'top-1/3 -right-20', size: 'w-[420px] h-[420px]' },
      { color: '#FACC15', position: '-bottom-20 left-1/4', size: 'w-80 h-80' },
    ],
  },
};

export const getThemeConfig = (colorName?: string): ColorOption => {
  if (!colorName) return NOTE_COLORS.cyan;
  const key = colorName.toLowerCase();
  return NOTE_COLORS[key] || NOTE_COLORS.cyan;
};


