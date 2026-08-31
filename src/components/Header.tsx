import React from 'react';
import { User, SyncStatus } from '../types';
import { SyncBadge } from './SyncBadge';
import { NotebookPen, Plus, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  backendMode?: string;
  syncStatus: SyncStatus;
  pendingCount: number;
  onNewNote: () => void;
  onLogout: () => void;
  onForceSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  syncStatus,
  pendingCount,
  onNewNote,
  onLogout,
  onForceSync,
}) => {
  const displayName = user.name || user.email.split('@')[0];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & App title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center shadow-xs">
            <NotebookPen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              Notes
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
              All your thoughts, automatically saved
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <SyncBadge
            status={syncStatus}
            pendingCount={pendingCount}
            onForceSync={onForceSync}
          />

          {/* New Note CTA */}
          <button
            id="create-note-button"
            onClick={onNewNote}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-medium transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">New Note</span>
          </button>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-stone-800">
            <div
              className="hidden md:flex flex-col items-end"
              title={user.email}
            >
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 max-w-[160px] truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-stone-400 dark:text-stone-500 max-w-[160px] truncate">
                {user.email}
              </span>
            </div>

            <button
              id="logout-button"
              onClick={onLogout}
              title="Log out"
              className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

