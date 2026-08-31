import React from 'react';
import { SyncStatus } from '../types';
import { RefreshCw, Wifi, WifiOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface SyncBadgeProps {
  status: SyncStatus;
  pendingCount: number;
  onForceSync: () => void;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({ status, pendingCount, onForceSync }) => {
  let content = {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    text: 'Saved',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
  };

  if (status === 'syncing') {
    content = {
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />,
      text: 'Saving...',
      style: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    };
  } else if (status === 'offline') {
    content = {
      icon: <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      text: pendingCount > 0 ? `Offline (${pendingCount} saved)` : 'Offline',
      style: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    };
  } else if (status === 'error') {
    content = {
      icon: <AlertCircle className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />,
      text: 'Saved on device',
      style: 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
    };
  } else if (pendingCount > 0) {
    content = {
      icon: <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      text: 'Saving changes...',
      style: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    };
  }

  return (
    <button
      id="sync-status-badge"
      onClick={onForceSync}
      title="All changes are saved automatically"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer hover:opacity-90 active:scale-95 ${content.style}`}
    >
      {content.icon}
      <span>{content.text}</span>
    </button>
  );
};
