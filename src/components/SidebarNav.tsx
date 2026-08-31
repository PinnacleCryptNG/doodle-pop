import React, { useState } from 'react';
import { User, SyncStatus, FolderItem, DEFAULT_FOLDERS } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  FileText,
  Star,
  Clock,
  Folder,
  Tag,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Sparkles,
  Cloud,
  CloudOff,
  FolderPlus,
  Hash,
  ChevronDown,
  ChevronRight,
  BookOpen,
  X,
  Check
} from 'lucide-react';

interface SidebarNavProps {
  user: User;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeView: 'all' | 'pinned' | 'recent' | 'trash' | string;
  onSelectView: (view: string) => void;
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  activeFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  folders?: FolderItem[];
  folderCounts?: Record<string, number>;
  onAddFolder?: (name: string, icon?: string, color?: string) => void;
  allTags: string[];
  totalNotes: number;
  pinnedCount: number;
  syncStatus: SyncStatus;
  pendingCount: number;
  onNewNote: () => void;
  onLogout: () => void;
  onOpenCommandPalette: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
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
  onAddFolder,
  allTags,
  totalNotes,
  pinnedCount,
  syncStatus,
  pendingCount,
  onNewNote,
  onLogout,
  onOpenCommandPalette,
  isMobile = false,
  onCloseMobile
}) => {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  const folderEmojiPresets = ['📁', '🚀', '🎨', '🎮', '🦄', '⚽', '🌟', '📚', '💡', '🎵'];

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

  const handleCreateCustomFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    if (onAddFolder) {
      onAddFolder(trimmed, newFolderIcon, '#2DD4BF');
    }
    handleSelectFolder(trimmed);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  return (
    <aside
      id="main-sidebar"
      className={`relative z-30 h-full bg-[#121212] border-r border-white/[0.08] flex flex-col justify-between transition-all duration-300 select-none ${
        isMobile ? 'w-72 max-w-[85vw] shadow-2xl' : isCollapsed ? 'w-[68px]' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        {/* Workspace Brand & Collapse Toggle */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-white/[0.06]">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-2.5 pl-1 overflow-hidden">
              <BrandLogo size="md" />
              <div className="flex flex-col truncate">
                <span className="font-outfit text-sm font-extrabold tracking-tight text-white flex items-center gap-1 leading-none">
                  Doodle<span className="text-[#2DD4BF]">Pop</span>
                  <span className="text-amber-400 text-xs">✨</span>
                </span>
                <span className="font-cabinet text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
                  My Fun Notes
                </span>
              </div>
            </div>
          )}

          {isCollapsed && !isMobile && (
            <div className="w-full flex justify-center">
              <button
                onClick={onToggleCollapse}
                title="Open DoodlePop menu"
                className="hover:scale-105 transition-transform cursor-pointer"
              >
                <BrandLogo size="md" />
              </button>
            </div>
          )}

          {isMobile ? (
            <button
              onClick={onCloseMobile}
              title="Close menu"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            !isCollapsed && (
              <button
                id="sidebar-collapse-toggle"
                onClick={onToggleCollapse}
                title="Close menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* New Note Action Button */}
        <div className="p-3 border-b border-white/[0.06]">
          <button
            id="sidebar-new-note-btn"
            onClick={handleNewNote}
            className={`group relative w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#5EEAD4] hover:to-[#2DD4BF] text-slate-950 font-outfit font-semibold text-xs transition-all duration-200 shadow-[0_0_20px_rgba(45,212,191,0.25)] hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
              isCollapsed && !isMobile ? 'px-0' : 'px-3'
            }`}
            title="Make a new note"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5] shrink-0 group-hover:rotate-90 transition-transform duration-200" />
            {(!isCollapsed || isMobile) && <span className="font-bold tracking-tight">New Note</span>}
          </button>
        </div>

        {/* Navigation Item Lists */}
        <div className="px-2.5 py-3 space-y-5 overflow-y-auto max-h-[calc(100vh-260px)]">
          {/* Core Views */}
          <div className="space-y-0.5">
            {(!isCollapsed || isMobile) && (
              <span className="px-2.5 mb-1.5 block font-cabinet text-[10px] font-bold uppercase tracking-widest text-slate-400">
                My Notes
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
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeView === 'all' && !activeTag && !activeFolder
                  ? 'bg-[#1E1E2E] text-white shadow-xs border border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText
                  className={`w-4 h-4 shrink-0 ${
                    activeView === 'all' && !activeTag && !activeFolder
                      ? 'text-[#2DD4BF]'
                      : 'text-slate-400'
                  }`}
                />
                {(!isCollapsed || isMobile) && <span className="truncate">All Notes</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="font-jetbrains text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
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
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeView === 'pinned' && !activeTag && !activeFolder
                  ? 'bg-[#1E1E2E] text-white shadow-xs border border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Star
                  className={`w-4 h-4 shrink-0 ${
                    activeView === 'pinned' && !activeTag && !activeFolder
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-400'
                  }`}
                />
                {(!isCollapsed || isMobile) && <span className="truncate">Starred Notes</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="font-jetbrains text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
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
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeView === 'recent' && !activeTag && !activeFolder
                  ? 'bg-[#1E1E2E] text-white shadow-xs border border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start'}`}
            >
              <Clock
                className={`w-4 h-4 shrink-0 ${
                  activeView === 'recent' ? 'text-[#2DD4BF]' : 'text-slate-400'
                }`}
              />
              {(!isCollapsed || isMobile) && <span className="truncate">Recent Notes</span>}
            </button>
          </div>

          {/* Collapsed Mode Folders Quick Access */}
          {isCollapsed && !isMobile && (
            <div className="pt-2 border-t border-white/[0.06] space-y-1">
              {folders.map((folder) => {
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
                    className={`w-full p-2 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                      isFolderActive
                        ? 'bg-[#2DD4BF]/20 text-white ring-1 ring-[#2DD4BF]'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{folder.icon}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Folders (Expanded / Mobile) */}
          {(!isCollapsed || isMobile) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2.5 mb-1 text-slate-400">
                <button
                  onClick={() => setFoldersOpen(!foldersOpen)}
                  className="flex items-center gap-1.5 font-cabinet text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-300 cursor-pointer"
                >
                  {foldersOpen ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                  <span>Folders</span>
                </button>
                <button
                  id="add-folder-btn"
                  onClick={() => {
                    setIsAddingFolder((prev) => !prev);
                    setFoldersOpen(true);
                  }}
                  title="Create a new folder"
                  className="p-1 rounded-md text-slate-400 hover:text-[#2DD4BF] hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Folder Creator */}
              {isAddingFolder && (
                <form
                  onSubmit={handleCreateCustomFolder}
                  className="p-2.5 rounded-xl bg-[#1A1A26] border border-[#2DD4BF]/40 shadow-lg space-y-2 mb-2 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF]">
                    New Folder
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{newFolderIcon}</span>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      autoFocus
                      className="flex-1 bg-[#121212] border border-white/[0.1] focus:border-[#2DD4BF] rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                    />
                  </div>
                  {/* Quick emoji selection */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {folderEmojiPresets.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setNewFolderIcon(emoji)}
                        className={`text-xs p-1 rounded hover:bg-white/[0.1] transition-transform ${
                          newFolderIcon === emoji ? 'scale-125 bg-white/[0.15]' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingFolder(false)}
                      className="px-2 py-1 rounded text-[10px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newFolderName.trim()}
                      className="px-2.5 py-1 rounded-md bg-[#2DD4BF] text-slate-950 font-bold text-[10px] flex items-center gap-1 disabled:opacity-50 hover:bg-[#5EEAD4] cursor-pointer"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      Add
                    </button>
                  </div>
                </form>
              )}

              {foldersOpen && (
                <div className="space-y-0.5">
                  {folders.map((folder) => {
                    const count = folderCounts[folder.id] ?? 0;
                    const isFolderActive = activeFolder === folder.id;

                    return (
                      <button
                        key={folder.id}
                        onClick={() => {
                          handleSelectFolder(isFolderActive ? null : folder.id);
                          handleSelectTag(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer group ${
                          isFolderActive
                            ? 'bg-[#1E1E2E] text-white border border-[#2DD4BF]/40 shadow-xs font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">{folder.icon}</span>
                          <span className="truncate">{folder.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-jetbrains text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                              isFolderActive
                                ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-bold'
                                : 'bg-white/[0.06] text-slate-400 group-hover:text-slate-300'
                            }`}
                          >
                            {count}
                          </span>
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: folder.color || '#2DD4BF' }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile, Quick Status & Logout */}
      <div className="p-3 border-t border-white/[0.06] bg-[#101010] space-y-2">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2DD4BF]/30 to-[#6366F1]/30 border border-white/[0.1] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="font-outfit text-xs font-semibold text-white truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="font-jetbrains text-[10px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {isCollapsed && !isMobile && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2DD4BF]/30 to-[#6366F1]/30 border border-white/[0.1] flex items-center justify-center text-xs font-bold text-white">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
