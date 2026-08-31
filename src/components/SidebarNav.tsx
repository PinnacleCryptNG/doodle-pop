import React, { useState } from 'react';
import { User, SyncStatus } from '../types';
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
  BookOpen
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
  allTags: string[];
  totalNotes: number;
  pinnedCount: number;
  syncStatus: SyncStatus;
  pendingCount: number;
  onNewNote: () => void;
  onLogout: () => void;
  onOpenCommandPalette: () => void;
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
  allTags,
  totalNotes,
  pinnedCount,
  syncStatus,
  pendingCount,
  onNewNote,
  onLogout,
  onOpenCommandPalette
}) => {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  const defaultFolders = [
    { id: 'Personal', label: 'Personal', icon: '🏠', color: '#2DD4BF' },
    { id: 'School & Work', label: 'School & Work', icon: '📚', color: '#6366F1' },
    { id: 'My Diary', label: 'My Diary', icon: '📝', color: '#F59E0B' },
    { id: 'Fun & Ideas', label: 'Fun & Ideas', icon: '💡', color: '#EC4899' },
  ];

  return (
    <aside
      id="main-sidebar"
      className={`relative z-30 h-screen bg-[#121212] border-r border-white/[0.08] flex flex-col justify-between transition-all duration-300 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        {/* Workspace Brand & Collapse Toggle */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-white/[0.06]">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 pl-1 overflow-hidden">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(45,212,191,0.35)] shrink-0 border border-[#2DD4BF]/40 bg-[#1E1E2E]">
                <img
                  src="/src/assets/images/doodlepop_logo_1788192753040.jpg"
                  alt="DoodlePop Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
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

          {isCollapsed && (
            <div className="w-full flex justify-center">
              <button
                onClick={onToggleCollapse}
                title="Open DoodlePop menu"
                className="w-8 h-8 rounded-xl overflow-hidden border border-[#2DD4BF]/40 shadow-[0_0_12px_rgba(45,212,191,0.3)] hover:scale-105 transition-transform cursor-pointer"
              >
                <img
                  src="/src/assets/images/doodlepop_logo_1788192753040.jpg"
                  alt="DoodlePop Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
          )}

          {!isCollapsed && (
            <button
              id="sidebar-collapse-toggle"
              onClick={onToggleCollapse}
              title="Close menu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* New Note Action Button */}
        <div className="p-3 border-b border-white/[0.06]">
          <button
            id="sidebar-new-note-btn"
            onClick={onNewNote}
            className={`group relative w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#5EEAD4] hover:to-[#2DD4BF] text-slate-950 font-outfit font-semibold text-xs transition-all duration-200 shadow-[0_0_20px_rgba(45,212,191,0.25)] hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Make a new note"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5] shrink-0 group-hover:rotate-90 transition-transform duration-200" />
            {!isCollapsed && <span className="font-bold tracking-tight">New Note</span>}
          </button>
        </div>

        {/* Navigation Item Lists */}
        <div className="px-2.5 py-3 space-y-5 overflow-y-auto max-h-[calc(100vh-260px)]">
          {/* Core Views */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <span className="px-2.5 mb-1.5 block font-cabinet text-[10px] font-bold uppercase tracking-widest text-slate-400">
                My Notes
              </span>
            )}

            {/* All Notes */}
            <button
              id="nav-view-all"
              onClick={() => {
                onSelectView('all');
                onSelectTag(null);
                onSelectFolder(null);
              }}
              title="All Notes"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeView === 'all' && !activeTag && !activeFolder
                  ? 'bg-[#1E1E2E] text-white shadow-xs border border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText
                  className={`w-4 h-4 shrink-0 ${
                    activeView === 'all' && !activeTag && !activeFolder
                      ? 'text-[#2DD4BF]'
                      : 'text-slate-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">All Notes</span>}
              </div>
              {!isCollapsed && (
                <span className="font-jetbrains text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                  {totalNotes}
                </span>
              )}
            </button>

            {/* Starred Notes */}
            <button
              id="nav-view-pinned"
              onClick={() => {
                onSelectView('pinned');
                onSelectTag(null);
                onSelectFolder(null);
              }}
              title="Starred Notes"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeView === 'pinned' && !activeTag && !activeFolder
                  ? 'bg-[#1E1E2E] text-white shadow-xs border border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Star
                  className={`w-4 h-4 shrink-0 ${
                    activeView === 'pinned' && !activeTag && !activeFolder
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">Starred Notes</span>}
              </div>
              {!isCollapsed && (
                <span className="font-jetbrains text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                  {pinnedCount}
                </span>
              )}
            </button>

            {/* Recent */}
            <button
              id="nav-view-recent"
              onClick={() => {
                onSelectView('recent');
                onSelectTag(null);
                onSelectFolder(null);
              }}
              title="Recent Notes"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeView === 'recent' && !activeTag && !activeFolder
                  ? 'bg-[#1E1E2E] text-white shadow-xs border border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
            >
              <Clock
                className={`w-4 h-4 shrink-0 ${
                  activeView === 'recent' ? 'text-[#2DD4BF]' : 'text-slate-400'
                }`}
              />
              {!isCollapsed && <span className="truncate">Recent Notes</span>}
            </button>
          </div>

          {/* Folders */}
          {!isCollapsed && (
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
                  onClick={() => {
                    const name = window.prompt('Enter folder name:');
                    if (name && name.trim()) {
                      onSelectFolder(name.trim());
                    }
                  }}
                  title="Add Folder"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-slate-400 hover:text-white" />
                </button>
              </div>

              {foldersOpen && (
                <div className="space-y-0.5">
                  {defaultFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        onSelectFolder(activeFolder === folder.id ? null : folder.id);
                        onSelectTag(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        activeFolder === folder.id
                          ? 'bg-[#1E1E2E] text-white border border-white/[0.08]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs">{folder.icon}</span>
                        <span className="truncate">{folder.label}</span>
                      </div>
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {!isCollapsed && allTags.length > 0 && (
            <div className="space-y-1">
              <button
                onClick={() => setTagsOpen(!tagsOpen)}
                className="w-full flex items-center justify-between px-2.5 mb-1 font-cabinet text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-300 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  {tagsOpen ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                  <span>Tags</span>
                </div>
                <span className="font-jetbrains text-[9px] text-slate-400">
                  {allTags.length}
                </span>
              </button>

              {tagsOpen && (
                <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelectTag(activeTag === tag ? null : tag);
                        onSelectFolder(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        activeTag === tag
                          ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/25 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{tag}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile, Quick Status & Logout */}
      <div className="p-3 border-t border-white/[0.06] bg-[#101010] space-y-2">
        {!isCollapsed && (
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

        {isCollapsed && (
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
