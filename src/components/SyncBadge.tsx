import React from 'react';
import { SyncStatus } from '../types';
import { RefreshCw, Wifi, WifiOff, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface SyncBadgeProps {
  status: SyncStatus;
  pendingCount: number;
  onForceSync: () => void;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({ status, pendingCount, onForceSync }) => {
  let content = {
    icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
    text: 'Cloud Synced',
    style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  };

  if (status === 'syncing') {
    content = {
      icon: <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
      text: 'Syncing...',
      style: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]',
    };
  } else if (status === 'offline') {
    content = {
      icon: <WifiOff className="w-3.5 h-3.5 text-amber-400" />,
      text: pendingCount > 0 ? `Offline (${pendingCount} saved)` : 'Offline mode',
      style: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    };
  } else if (status === 'error') {
    content = {
      icon: <AlertCircle className="w-3.5 h-3.5 text-purple-400" />,
      text: 'Saved locally',
      style: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
    };
  } else if (pendingCount > 0) {
    content = {
      icon: <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
      text: 'Saving changes...',
      style: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    };
  }

  return (
    <button
      id="sync-status-badge"
      onClick={onForceSync}
      title="All changes are automatically synchronized"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-quicksand font-bold border backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 ${content.style}`}
    >
      {content.icon}
      <span>{content.text}</span>
    </button>
  );
};

