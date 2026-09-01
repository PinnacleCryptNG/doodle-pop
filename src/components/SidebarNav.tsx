import React, { useState } from 'react';
import { User, SyncStatus, FolderItem, DEFAULT_FOLDERS, NoteColor, getThemeConfig } from '../types';
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
  Check,
  Zap,
  Compass,
  Smile
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
  pageTheme?: NoteColor;
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
  onCloseMobile,
  pageTheme = 'cyan'
}) => {
  const themeConfig = getThemeConfig(pageTheme);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  const folderEmojiPresets = ['📁', '🚀', '🎨', '🎮', '🦄', '⚽', '🌟', '📚', '💡', '🎵', '🍕', '🐱'];

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
      onAddFolder(trimmed, newFolderIcon, '#38BDF8');
    }
    handleSelectFolder(trimmed);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  return (
    <aside
      id="main-sidebar"
      className={`relative z-30 h-full bg-[#16172B]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 select-none shadow-[10px_0_30px_rgba(0,0,0,0.4)] ${
        isMobile ? 'w-72 max-w-[85vw] shadow-2xl' : isCollapsed ? 'w-[72px]' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        {/* Workspace Brand & Collapse Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-[#1A1B2F]/60">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <BrandLogo size="md" />
              <div className="flex flex-col truncate">
                <span className="font-fredoka text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                  Doodle<span className="text-[#38BDF8]">Pop</span>
                  <span className="text-amber-300 text-xs animate-bounce">✨</span>
                </span>
                <span className="font-quicksand text-[10px] font-bold uppercase tracking-wider text-purple-300/80 mt-0.5">
                  Creative Notes
                </span>
              </div>
            </div>
          )}

          {isCollapsed && !isMobile && (
            <div className="w-full flex justify-center">
              <button
                onClick={onToggleCollapse}
                title="Expand DoodlePop menu"
                className="hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <BrandLogo size="md" />
              </button>
            </div>
          )}

          {isMobile ? (
            <button
              onClick={onCloseMobile}
              title="Close menu"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            !isCollapsed && (
              <button
                id="sidebar-collapse-toggle"
                onClick={onToggleCollapse}
                title="Collapse menu"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hover:scale-105"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* New Note Action Button */}
        <div className="p-3 border-b border-white/10">
          <button
            id="sidebar-new-note-btn"
            onClick={handleNewNote}
            style={{
              backgroundImage: themeConfig.buttonGradient,
              boxShadow: `0 0 25px ${themeConfig.glow}`,
            }}
            className={`btn-bouncy group relative w-full py-3 rounded-2xl text-slate-950 font-fredoka font-bold text-sm transition-all duration-300 hover:brightness-110 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              isCollapsed && !isMobile ? 'px-0' : 'px-4'
            }`}
            title="Make a new note"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3] shrink-0 group-hover:rotate-90 transition-transform duration-300" />
            {(!isCollapsed || isMobile) && (
              <span className="tracking-tight flex items-center gap-1.5">
                <span>New Note</span>
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              </span>
            )}
          </button>
        </div>

        {/* Navigation Item Lists */}
        <div className="px-3 py-3 space-y-5 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-thin">
          {/* Core Views */}
          <div className="space-y-1">
            {(!isCollapsed || isMobile) && (
              <span className="px-2.5 mb-2 block font-fredoka text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>Spaces</span>
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
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-quicksand font-bold transition-all cursor-pointer ${
                activeView === 'all' && !activeTag && !activeFolder
                  ? 'bg-gradient-to-r from-[#38BDF8]/20 to-[#C084FC]/20 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)] border border-[#38BDF8]/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`p-1.5 rounded-xl ${activeView === 'all' && !activeTag && !activeFolder ? 'bg-[#38BDF8] text-slate-950 shadow-sm' : 'bg-white/5 text-cyan-300'}`}>
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                </div>
                {(!isCollapsed || isMobile) && <span className="truncate">All Notes</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-xs">
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
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-quicksand font-bold transition-all cursor-pointer ${
                activeView === 'pinned' && !activeTag && !activeFolder
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-white shadow-[0_0_20px_rgba(250,204,21,0.2)] border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`p-1.5 rounded-xl ${activeView === 'pinned' && !activeTag && !activeFolder ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-white/5 text-amber-300'}`}>
                  <Star className="w-3.5 h-3.5 shrink-0 fill-current" />
                </div>
                {(!isCollapsed || isMobile) && <span className="truncate">Starred Favorites</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 shadow-xs">
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
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-quicksand font-bold transition-all cursor-pointer ${
                activeView === 'recent' && !activeTag && !activeFolder
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-[0_0_20px_rgba(192,132,252,0.2)] border border-purple-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
              } ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start'}`}
            >
              <div className={`p-1.5 rounded-xl ${activeView === 'recent' && !activeTag && !activeFolder ? 'bg-[#C084FC] text-slate-950 shadow-sm' : 'bg-white/5 text-purple-300'}`}>
                <Clock className="w-3.5 h-3.5 shrink-0" />
              </div>
              {(!isCollapsed || isMobile) && <span className="truncate">Recently Updated</span>}
            </button>
          </div>

          {/* Collapsed Mode Folders Quick Access */}
          {isCollapsed && !isMobile && (
            <div className="pt-2 border-t border-white/10 space-y-1.5">
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
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-center text-base transition-all cursor-pointer hover:scale-105 ${
                      isFolderActive
                        ? 'bg-[#38BDF8]/25 text-white ring-2 ring-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
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
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between px-2.5 mb-1.5 text-slate-400">
                <button
                  onClick={() => setFoldersOpen(!foldersOpen)}
                  className="flex items-center gap-1.5 font-fredoka text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {foldersOpen ? (
                    <ChevronDown className="w-3 h-3 text-purple-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-purple-400" />
                  )}
                  <span>Categories & Folders</span>
                </button>
                <button
                  id="add-folder-btn"
                  onClick={() => {
                    setIsAddingFolder((prev) => !prev);
                    setFoldersOpen(true);
                  }}
                  title="Create a new folder"
                  className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Folder Creator */}
              {isAddingFolder && (
                <form
                  onSubmit={handleCreateCustomFolder}
                  className="p-3 rounded-2xl bg-[#1F2038] border border-cyan-500/40 shadow-xl space-y-2.5 mb-2 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="text-[10px] font-fredoka font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    New Folder Category
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg p-1 bg-white/5 rounded-xl">{newFolderIcon}</span>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      autoFocus
                      className="flex-1 bg-[#121324] border border-white/15 focus:border-cyan-400 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden font-nunito"
                    />
                  </div>
                  {/* Quick emoji selection */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {folderEmojiPresets.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setNewFolderIcon(emoji)}
                        className={`text-sm p-1 rounded-xl hover:bg-white/15 transition-transform ${
                          newFolderIcon === emoji ? 'scale-125 bg-cyan-500/30 border border-cyan-400/50' : ''
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
                      className="px-2.5 py-1 rounded-xl text-[11px] font-quicksand font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newFolderName.trim()}
                      className="btn-bouncy px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 font-fredoka font-bold text-[11px] flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      Add
                    </button>
                  </div>
                </form>
              )}

              {foldersOpen && (
                <div className="space-y-1">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-quicksand font-bold transition-all cursor-pointer group ${
                          isFolderActive
                            ? 'bg-[#241B3F] text-white border border-[#C084FC]/50 shadow-[0_0_15px_rgba(192,132,252,0.25)] font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base shrink-0 group-hover:scale-110 transition-transform">{folder.icon}</span>
                          <span className="truncate">{folder.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                              isFolderActive
                                ? 'bg-[#C084FC]/30 text-purple-200 border border-[#C084FC]/40 font-bold'
                                : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                            }`}
                          >
                            {count}
                          </span>
                          <div
                            className="w-2 h-2 rounded-full ring-2 ring-white/20"
                            style={{ backgroundColor: folder.color || '#38BDF8' }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tags Section (Expanded) */}
          {(!isCollapsed || isMobile) && allTags.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between px-2.5 mb-1.5 text-slate-400">
                <button
                  onClick={() => setTagsOpen(!tagsOpen)}
                  className="flex items-center gap-1.5 font-fredoka text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {tagsOpen ? (
                    <ChevronDown className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>Tags</span>
                </button>
              </div>

              {tagsOpen && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {allTags.map((tag) => {
                    const isTagActive = activeTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          handleSelectTag(isTagActive ? null : tag);
                          handleSelectFolder(null);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-quicksand font-bold transition-all cursor-pointer ${
                          isTagActive
                            ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
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

      {/* Bottom Profile, Quick Status & Logout */}
      <div className="p-3 border-t border-white/10 bg-[#1A1B2F]/80 backdrop-blur-md space-y-2">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#38BDF8] via-[#C084FC] to-[#FACC15] p-[1.5px] shadow-[0_0_15px_rgba(56,189,248,0.3)] shrink-0">
                <div className="w-full h-full bg-[#1A1B2F] rounded-[14px] flex items-center justify-center text-xs font-bold text-cyan-300">
                  {user.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex flex-col truncate">
                <span className="font-fredoka text-xs font-bold text-white truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="font-quicksand text-[10px] font-medium text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              title="Log out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {isCollapsed && !isMobile && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#38BDF8] via-[#C084FC] to-[#FACC15] p-[1.5px] shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center justify-center">
              <div className="w-full h-full bg-[#1A1B2F] rounded-[14px] flex items-center justify-center text-xs font-bold text-cyan-300">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

