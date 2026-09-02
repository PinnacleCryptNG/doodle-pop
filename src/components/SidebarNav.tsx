import React, { useState } from 'react';
import { User, SyncStatus, FolderItem, DEFAULT_FOLDERS, NoteColor, THEME_PALETTES, getThemeConfig } from '../types';
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
  Palette,
  Check
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
  pageTheme?: NoteColor;
  onThemeChange?: (theme: NoteColor) => void;
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
  pageTheme = 'obsidian',
  onThemeChange,
}) => {
  const themeConfig = getThemeConfig(pageTheme);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [showThemePicker, setShowThemePicker] = useState(false);

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
      className={`relative z-30 h-full bg-[#141620] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none ${
        isMobile ? 'w-72 max-w-[85vw] shadow-2xl' : isCollapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        {/* Workspace Brand & Collapse Toggle */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 bg-[#141620]">
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
                  className="font-fredoka text-sm font-bold tracking-tight text-white leading-none transition-colors"
                  style={{ color: '#FFFFFF' }}
                >
                  DoodlePop
                </span>
                <span className="font-quicksand text-[10px] font-medium text-slate-400 mt-0.5">
                  Personal Workspace
                </span>
              </div>
            </div>
          )}

          {isCollapsed && !isMobile && (
            <div className="w-full flex justify-center">
              <button
                onClick={handleBrandClick}
                title="DoodlePop Notes - Go to Home"
                className="hover:opacity-80 transition-opacity cursor-pointer p-1"
              >
                <BrandLogo size="sm" onClick={handleBrandClick} />
              </button>
            </div>
          )}

          {isMobile ? (
            <button
              onClick={onCloseMobile}
              title="Close menu"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            !isCollapsed && (
              <button
                id="sidebar-collapse-toggle"
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* New Note Action Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            id="sidebar-new-note-btn"
            onClick={handleNewNote}
            style={{ backgroundColor: themeConfig.primary }}
            className={`group w-full py-2.5 rounded-xl text-slate-950 font-fredoka font-bold text-xs transition-opacity hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
              isCollapsed && !isMobile ? 'px-0 min-h-[44px]' : 'px-3 min-h-[44px]'
            }`}
            title="Create new note"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5] shrink-0" />
            {(!isCollapsed || isMobile) && <span>New Note</span>}
          </button>
        </div>

        {/* Navigation Item Lists */}
        <div className="px-2 py-3 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin">
          {/* Core Views */}
          <div className="space-y-0.5">
            {(!isCollapsed || isMobile) && (
              <span className="px-2.5 mb-1.5 block font-quicksand text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
              style={
                activeView === 'all' && !activeTag && !activeFolder
                  ? {
                      backgroundColor: themeConfig.glow,
                      borderColor: themeConfig.primary,
                      color: themeConfig.primaryHover,
                    }
                  : undefined
              }
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-quicksand font-semibold transition-colors cursor-pointer min-h-[40px] border ${
                activeView === 'all' && !activeTag && !activeFolder
                  ? 'font-bold'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 shrink-0" />
                {(!isCollapsed || isMobile) && <span className="truncate">All Notes</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
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
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2 truncate">
                <Star className="w-4 h-4 shrink-0 fill-current" />
                {(!isCollapsed || isMobile) && <span className="truncate">Starred</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
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
                  ? 'bg-indigo-500/15 text-indigo-300 font-bold border-indigo-500/30'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start'}`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              {(!isCollapsed || isMobile) && <span className="truncate">Recent</span>}
            </button>
          </div>

          {/* Folders (Simplified: Personal, School, Work, Archive) */}
          {isCollapsed && !isMobile ? (
            <div className="pt-2 border-t border-slate-800 space-y-1">
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
                    style={
                      isFolderActive
                        ? {
                            backgroundColor: themeConfig.glow,
                            borderColor: themeConfig.primary,
                            color: themeConfig.primaryHover,
                          }
                        : undefined
                    }
                    className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer min-h-[40px] border ${
                      isFolderActive
                        ? 'font-bold'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <FolderIcon icon={folder.icon} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-0.5 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between px-2.5 mb-1.5 text-slate-400">
                <button
                  onClick={() => setFoldersOpen(!foldersOpen)}
                  className="flex items-center gap-1.5 font-quicksand text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
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
                        style={
                          isFolderActive
                            ? {
                                backgroundColor: themeConfig.glow,
                                borderColor: themeConfig.primary,
                                color: themeConfig.primaryHover,
                              }
                            : undefined
                        }
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-quicksand font-semibold transition-colors cursor-pointer min-h-[38px] border ${
                          isFolderActive
                            ? 'font-bold'
                            : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FolderIcon
                            icon={folder.icon}
                            className="w-4 h-4 shrink-0 text-slate-400"
                          />
                          <span className="truncate">{folder.label}</span>
                        </div>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                            isFolderActive
                              ? 'bg-slate-800/90 text-slate-200 font-bold'
                              : 'bg-slate-800/80 text-slate-400'
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
            <div className="space-y-1 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between px-2.5 mb-1 text-slate-400">
                <button
                  onClick={() => setTagsOpen(!tagsOpen)}
                  className="flex items-center gap-1.5 font-quicksand text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
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
                        style={
                          isTagActive
                            ? {
                                backgroundColor: themeConfig.glow,
                                borderColor: themeConfig.primary,
                                color: themeConfig.primaryHover,
                              }
                            : undefined
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-quicksand transition-colors cursor-pointer min-h-[28px] border ${
                          isTagActive
                            ? 'font-bold'
                            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-slate-700/60'
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
      </div>

      {/* Bottom Workspace Theme Switcher & Profile Section */}
      <div className="p-2.5 border-t border-slate-800 bg-[#141620] space-y-2">
        {/* Global Website Theme Switcher */}
        {(!isCollapsed || isMobile) && onThemeChange && (
          <div className="px-1 py-1 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between px-1.5 py-0.5 mb-1">
              <span className="font-quicksand text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Palette className="w-3 h-3 text-slate-400" />
                <span>Site Theme</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{themeConfig.label}</span>
            </div>
            <div className="flex items-center justify-between gap-1 px-1">
              {THEME_PALETTES.map((palette) => {
                const isCurrent = pageTheme === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => onThemeChange(palette.id)}
                    title={`Switch website theme to ${palette.label}`}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-white scale-110 shadow-md'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: palette.primary }}
                  >
                    {isCurrent && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsed Mode Theme Switcher */}
        {isCollapsed && !isMobile && onThemeChange && (
          <div className="relative flex justify-center">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              title={`Current Theme: ${themeConfig.label}. Click to change theme.`}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4" style={{ color: themeConfig.primary }} />
            </button>

            {showThemePicker && (
              <div className="absolute bottom-full left-full ml-2 mb-2 w-44 bg-[#1a1d2e] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 border-b border-slate-800 pb-1">
                  Site Theme
                </div>
                {THEME_PALETTES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onThemeChange(p.id);
                      setShowThemePicker(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                      pageTheme === p.id
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile & Logout */}
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold shrink-0"
                style={{ color: themeConfig.primaryHover }}
              >
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="font-fredoka text-xs font-bold text-slate-200 truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="font-quicksand text-[10px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              title="Log out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold"
              style={{ color: themeConfig.primaryHover }}
            >
              {user.email.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
