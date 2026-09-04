import React, { useState } from 'react';
import { User, SyncStatus, FolderItem, DEFAULT_FOLDERS, ThemeMode } from '../types';
import { BrandLogo } from './BrandLogo';
import { FolderIcon } from './FolderIcon';
import {
  FileText,
  Star,
  Clock,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Hash,
  ChevronDown,
  ChevronRight,
  X,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarNavProps {
  user: User;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeView: 'all' | 'pinned' | 'recent' | string;
  onSelectView: (view: string) => void;
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  activeFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  folders?: FolderItem[];
  folderCounts?: Record<string, number>;
  allTags: string[];
  totalNotes: number;
  pinnedCount: number;
  syncStatus: SyncStatus;
  pendingCount: number;
  onNewNote: () => void;
  onLogout: () => void;
  onOpenCommandPalette: () => void;
  onGoHome?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: (mode?: ThemeMode) => void;
  // Backward compatibility
  pageTheme?: any;
  onThemeChange?: any;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  user,
  isCollapsed,
  onToggleCollapse,
  activeView,
  onSelectView,
  activeTag,
  onSelectTag,
  activeFolder,
  onSelectFolder,
  folders = DEFAULT_FOLDERS,
  folderCounts = {},
  allTags,
  totalNotes,
  pinnedCount,
  syncStatus,
  pendingCount,
  onNewNote,
  onLogout,
  onOpenCommandPalette,
  onGoHome,
  isMobile = false,
  onCloseMobile,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  const isDark = themeMode === 'dark';

  const handleSelectView = (v: string) => {
    onSelectView(v);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectFolder = (f: string | null) => {
    onSelectFolder(f);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectTag = (t: string | null) => {
    onSelectTag(t);
    if (onCloseMobile) onCloseMobile();
  };

  const handleNewNote = () => {
    onNewNote();
    if (onCloseMobile) onCloseMobile();
  };

  const handleBrandClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      onSelectView('all');
      onSelectTag(null);
      onSelectFolder(null);
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      id="main-sidebar"
      className={`relative z-30 h-full flex flex-col transition-all duration-200 select-none border-r ${
        isDark ? 'bg-[#141620] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
      } ${isMobile ? 'w-72 max-w-[85vw] shadow-2xl' : isCollapsed ? 'w-[68px]' : 'w-60 lg:w-64'}`}
    >
      {/* Top Header & Brand (shrink-0) */}
      <div className="shrink-0">
        {/* Workspace Brand & Collapse Toggle */}
        <div
          className={`h-14 px-4 flex items-center justify-between border-b ${
            isDark ? 'border-slate-800 bg-[#141620]' : 'border-slate-200 bg-white'
          }`}
        >
          {(!isCollapsed || isMobile) && (
            <div
              onClick={handleBrandClick}
              role="button"
              tabIndex={0}
              title="DoodlePop - Go to Home"
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBrandClick();
                }
              }}
            >
              <BrandLogo size="sm" onClick={handleBrandClick} />
              <div className="flex flex-col truncate">
                <span
                  className={`font-fredoka text-sm font-bold tracking-tight leading-none transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  DoodlePop
                </span>
                <span
                  className={`font-quicksand text-[10px] font-medium mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Personal Workspace
                </span>
              </div>
            </div>
          )}

          {isCollapsed && !isMobile ? (
            <div className="w-full flex items-center justify-center">
              <button
                id="sidebar-uncollapse-toggle"
                onClick={onToggleCollapse}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className={`p-2 rounded-xl transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center group ${
                  isDark
                    ? 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-amber-500/50 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-amber-500/50 shadow-xs'
                }`}
              >
                <PanelLeftOpen className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : isMobile ? (
            <button
              onClick={onCloseMobile}
              title="Close menu"
              className={`p-2 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="sidebar-collapse-toggle"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* New Note Action Button */}
        <div className={`p-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <button
            id="sidebar-new-note-btn"
            onClick={handleNewNote}
            className={`group w-full py-2.5 rounded-xl font-fredoka font-bold text-xs transition-opacity hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            } ${isCollapsed && !isMobile ? 'px-0 min-h-[44px]' : 'px-3 min-h-[44px]'}`}
            title="Create new note"
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            {(!isCollapsed || isMobile) && <span>New Note</span>}
          </button>
        </div>
      </div>

      {/* Middle Scrollable Navigation Item Lists (flex-1 min-h-0) */}
      <div className="flex-1 min-h-0 px-2 py-3 space-y-4 overflow-y-auto scrollbar-thin">
          {/* Core Views */}
          <div className="space-y-0.5">
            {(!isCollapsed || isMobile) && (
              <span
                className={`px-2.5 mb-1.5 block font-quicksand text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Views
              </span>
            )}

            {/* All Notes */}
            <button
              id="nav-view-all"
              onClick={() => {
                handleSelectView('all');
                handleSelectTag(null);
                handleSelectFolder(null);
              }}
              title={`All Notes (${totalNotes})`}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-quicksand font-semibold transition-colors cursor-pointer min-h-[40px] border ${
                activeView === 'all' && !activeTag && !activeFolder
                  ? isDark
                    ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30'
                    : 'bg-amber-50 text-amber-900 font-bold border-amber-300'
                  : isDark
                  ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 shrink-0" />
                {(!isCollapsed || isMobile) && <span className="truncate">All Notes</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {totalNotes}
                </span>
              )}
            </button>

            {/* Starred Notes */}
            <button
              id="nav-view-pinned"
              onClick={() => {
                handleSelectView('pinned');
                handleSelectTag(null);
                handleSelectFolder(null);
              }}
              title={`Starred Notes (${pinnedCount})`}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-quicksand font-semibold transition-colors cursor-pointer min-h-[40px] border ${
                activeView === 'pinned' && !activeTag && !activeFolder
                  ? isDark
                    ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30'
                    : 'bg-amber-50 text-amber-900 font-bold border-amber-300'
                  : isDark
                  ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2 truncate">
                <Star className="w-4 h-4 shrink-0 fill-current text-amber-400" />
                {(!isCollapsed || isMobile) && <span className="truncate">Starred</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {pinnedCount}
                </span>
              )}
            </button>

            {/* Recent */}
            <button
              id="nav-view-recent"
              onClick={() => {
                handleSelectView('recent');
                handleSelectTag(null);
                handleSelectFolder(null);
              }}
              title="Recent Notes"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-quicksand font-semibold transition-colors cursor-pointer min-h-[40px] border ${
                activeView === 'recent' && !activeTag && !activeFolder
                  ? isDark
                    ? 'bg-indigo-500/15 text-indigo-300 font-bold border-indigo-500/30'
                    : 'bg-indigo-50 text-indigo-900 font-bold border-indigo-300'
                  : isDark
                  ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start'}`}
            >
              <Clock className="w-4 h-4 shrink-0 text-indigo-400" />
              {(!isCollapsed || isMobile) && <span className="truncate">Recent</span>}
            </button>
          </div>

          {/* Folders (Personal, School, Work, Archive) */}
          {isCollapsed && !isMobile ? (
            <div className={`pt-2 border-t space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              {DEFAULT_FOLDERS.map((folder) => {
                const count = folderCounts[folder.id] ?? 0;
                const isFolderActive = activeFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      handleSelectFolder(isFolderActive ? null : folder.id);
                      handleSelectTag(null);
                    }}
                    title={`${folder.label} (${count} notes)`}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer min-h-[40px] border ${
                      isFolderActive
                        ? isDark
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                        : isDark
                        ? 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FolderIcon icon={folder.icon} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`space-y-0.5 pt-1 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between px-2.5 mb-1.5">
                <button
                  onClick={() => setFoldersOpen(!foldersOpen)}
                  className={`flex items-center gap-1.5 font-quicksand text-[11px] font-bold uppercase tracking-wider cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {foldersOpen ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                  <span>Folders</span>
                </button>
              </div>

              {foldersOpen && (
                <div className="space-y-0.5">
                  {DEFAULT_FOLDERS.map((folder) => {
                    const count = folderCounts[folder.id] ?? 0;
                    const isFolderActive = activeFolder === folder.id;

                    return (
                      <button
                        key={folder.id}
                        onClick={() => {
                          handleSelectFolder(isFolderActive ? null : folder.id);
                          handleSelectTag(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-quicksand font-semibold transition-colors cursor-pointer min-h-[38px] border ${
                          isFolderActive
                            ? isDark
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                              : 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                            : isDark
                            ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FolderIcon
                            icon={folder.icon}
                            className={`w-4 h-4 shrink-0 ${
                              isFolderActive
                                ? isDark ? 'text-amber-300' : 'text-amber-600'
                                : isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          />
                          <span className="truncate">{folder.label}</span>
                        </div>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                            isFolderActive
                              ? isDark
                                ? 'bg-slate-800/90 text-slate-200 font-bold'
                                : 'bg-white text-amber-900 font-bold shadow-2xs'
                              : isDark
                              ? 'bg-slate-800/80 text-slate-400'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tags Section (Expanded) */}
          {(!isCollapsed || isMobile) && allTags.length > 0 && (
            <div className={`space-y-1 pt-1 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between px-2.5 mb-1">
                <button
                  onClick={() => setTagsOpen(!tagsOpen)}
                  className={`flex items-center gap-1.5 font-quicksand text-[11px] font-bold uppercase tracking-wider cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tagsOpen ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                  <span>Tags</span>
                </button>
              </div>

              {tagsOpen && (
                <div className="flex flex-wrap gap-1 px-1">
                  {allTags.map((tag) => {
                    const isTagActive = activeTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          handleSelectTag(isTagActive ? null : tag);
                          handleSelectFolder(null);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-quicksand transition-colors cursor-pointer min-h-[28px] border ${
                          isTagActive
                            ? isDark
                              ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/40'
                              : 'bg-amber-50 text-amber-900 font-bold border-amber-300'
                            : isDark
                            ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-slate-700/60'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border-slate-200'
                        }`}
                      >
                        <Hash className="w-3 h-3" />
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      {/* Bottom Theme Mode Switcher & Profile Section (shrink-0) */}
      <div
        className={`shrink-0 p-2.5 border-t space-y-2.5 safe-area-bottom ${
          isDark ? 'border-slate-800 bg-[#141620]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {/* Dark & Light Theme Switcher */}
        {onToggleTheme && (
          <div>
            {!isCollapsed || isMobile ? (
              <div
                className={`p-1 rounded-xl flex items-center justify-between border ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <span
                  className={`text-[11px] font-quicksand font-bold px-2 flex items-center gap-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>Theme</span>
                </span>
                <div
                  className={`flex items-center p-0.5 rounded-lg ${
                    isDark ? 'bg-slate-800/90' : 'bg-slate-100'
                  }`}
                >
                  <button
                    onClick={() => onToggleTheme('light')}
                    title="Switch to light mode"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-quicksand transition-all cursor-pointer ${
                      !isDark
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => onToggleTheme('dark')}
                    title="Switch to dark mode"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-quicksand transition-all cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 text-white shadow-xs font-bold border border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => onToggleTheme(isDark ? 'light' : 'dark')}
                  title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
                  }`}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Profile & Logout */}
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center justify-between px-1 py-0.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-amber-400'
                    : 'bg-white border-slate-300 text-amber-600 shadow-2xs'
                }`}
              >
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span
                  className={`font-fredoka text-xs font-bold truncate ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  {user.name || user.email.split('@')[0]}
                </span>
                <span
                  className={`font-quicksand text-[10px] truncate ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {user.email}
                </span>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              title="Log out"
              className={`p-2 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isDark
                  ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-slate-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-400'
                  : 'bg-white border-slate-300 text-amber-600 shadow-2xs'
              }`}
            >
              {user.email.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-slate-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
