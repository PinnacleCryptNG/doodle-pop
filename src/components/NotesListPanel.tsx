import React from 'react';
import { Note, SortOption, NOTE_COLORS, NoteColor, FolderItem, DEFAULT_FOLDERS, getThemeConfig } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  Search,
  Star,
  Clock,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  Tag,
  X,
  FileText,
  Menu,
  Sparkles,
  Zap,
  Folder as FolderIcon
} from 'lucide-react';

interface NotesListPanelProps {
  notes: Note[];
  allNotesCount: number;
  activeNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onNewNote: (folder?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeTag: string | null;
  onClearTag: () => void;
  activeFolder: string | null;
  onClearFolder: () => void;
  onTogglePin: (id: string, current: boolean) => void;
  onDeleteNote: (note: Note) => void;
  onOpenCommandPalette: () => void;
  isCollapsed?: boolean;
  onOpenSidebarMobile?: () => void;
  folders?: FolderItem[];
  pageTheme?: NoteColor;
}

export const NotesListPanel: React.FC<NotesListPanelProps> = ({
  notes,
  allNotesCount,
  activeNoteId,
  onSelectNote,
  onNewNote,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  activeTag,
  onClearTag,
  activeFolder,
  onClearFolder,
  onTogglePin,
  onDeleteNote,
  onOpenCommandPalette,
  onOpenSidebarMobile,
  folders = DEFAULT_FOLDERS,
  pageTheme = 'cyan'
}) => {
  const themeConfig = getThemeConfig(pageTheme);
  const [viewStyle, setViewStyle] = React.useState<'preview' | 'compact'>('preview');

  const currentFolderObj = folders.find((f) => f.id === activeFolder);
  const folderIcon = currentFolderObj ? currentFolderObj.icon : '📁';

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const regularNotes = notes.filter((n) => !n.is_pinned);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      id="notes-list-panel"
      className="w-full md:w-80 lg:w-96 h-full bg-[#16172B]/85 backdrop-blur-2xl border-r border-white/10 flex flex-col shrink-0 select-none overflow-hidden"
    >
      {/* Top Header & Search Bar */}
      <div className="p-3.5 sm:p-4 border-b border-white/10 space-y-3 bg-[#1A1B2F]/60 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {onOpenSidebarMobile && (
              <button
                type="button"
                onClick={onOpenSidebarMobile}
                title="Open categories and folders"
                className="md:hidden p-2 -ml-1 rounded-2xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5 text-cyan-300" />
              </button>
            )}
            <h2 className="font-fredoka text-lg font-bold text-white tracking-tight truncate max-w-[160px] sm:max-w-[200px] flex items-center gap-2">
              {activeFolder ? (
                <>
                  <span className="text-xl">{folderIcon}</span>
                  <span className="truncate">{activeFolder}</span>
                </>
              ) : activeTag ? (
                `#${activeTag}`
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>My Doodles</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </span>
              )}
            </h2>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold shadow-xs">
              {notes.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View style toggle */}
            <button
              onClick={() => setViewStyle(viewStyle === 'preview' ? 'compact' : 'preview')}
              title={viewStyle === 'preview' ? 'Show simple list' : 'Show preview cards'}
              className="p-2 rounded-2xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer hover:scale-105"
            >
              {viewStyle === 'preview' ? (
                <ListIcon className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative group">
              <button
                title="Sort notes"
                className="p-2 rounded-2xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer flex items-center hover:scale-105"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#1B1C33] border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 hidden group-hover:block backdrop-blur-2xl animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] font-fredoka uppercase tracking-wider text-slate-400 font-bold border-b border-white/10">
                  Sort Order
                </div>
                <button
                  onClick={() => onSortChange('created_desc')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-quicksand font-bold transition-all cursor-pointer ${
                    sortBy === 'created_desc' ? 'text-cyan-300 font-bold bg-cyan-500/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  ✨ Newest first
                </button>
                <button
                  onClick={() => onSortChange('updated_desc')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-quicksand font-bold transition-all cursor-pointer ${
                    sortBy === 'updated_desc' ? 'text-purple-300 font-bold bg-purple-500/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  ⚡ Recently edited
                </button>
                <button
                  onClick={() => onSortChange('title_asc')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-quicksand font-bold transition-all cursor-pointer ${
                    sortBy === 'title_asc' ? 'text-amber-300 font-bold bg-amber-500/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  🔤 Alphabetical (A - Z)
                </button>
              </div>
            </div>

            {/* Quick New Note */}
            <button
              onClick={() => onNewNote(activeFolder || undefined)}
              title={activeFolder ? `New note in ${activeFolder}` : "Make a new note"}
              className="btn-bouncy p-2 rounded-2xl text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.4)]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Clean Search Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-cyan-300 pointer-events-none" />
          <input
            id="notes-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search doodles & tags..."
            className="w-full bg-[#121324]/90 border border-white/15 focus:border-cyan-400 rounded-2xl pl-9 pr-16 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-hidden transition-all font-nunito focus:ring-2 focus:ring-cyan-400/20"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onOpenCommandPalette}
              title="Search shortcut"
              className="absolute right-2.5 px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[10px] font-mono text-cyan-300 hover:text-white transition-colors"
            >
              ⌘K
            </button>
          )}
        </div>

        {/* Active Filter Badges */}
        {(activeTag || activeFolder || searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {activeFolder && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-200 text-[11px] font-quicksand font-bold border border-purple-500/30">
                <span>{folderIcon} {activeFolder}</span>
                <button onClick={onClearFolder} className="hover:text-rose-400 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeTag && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-200 text-[11px] font-quicksand font-bold border border-cyan-500/30">
                <span>#{activeTag}</span>
                <button onClick={onClearTag} className="hover:text-rose-400 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 text-[11px] font-quicksand font-bold border border-amber-500/30">
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button onClick={() => onSearchChange('')} className="hover:text-rose-400 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notes List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3 scrollbar-thin">
        {notes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center px-4">
            {activeFolder ? (
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-3 animate-float">
                {folderIcon}
              </div>
            ) : (
              <div className="mb-3">
                <BrandLogo size="lg" />
              </div>
            )}
            <h3 className="font-fredoka text-base font-bold text-white">
              {activeFolder ? `No doodles in ${activeFolder} yet!` : 'No doodles here yet!'}
            </h3>
            <p className="font-quicksand text-xs font-semibold text-slate-300 mt-1 max-w-[240px] leading-relaxed">
              {searchQuery || activeTag
                ? 'Try searching for something else or clear your filter.'
                : activeFolder
                ? `Create a note in ${activeFolder} to keep your ideas organized.`
                : 'Tap below to start your colorful journey! ✨'}
            </p>
            <button
              onClick={() => onNewNote(activeFolder || undefined)}
              className="btn-bouncy mt-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 font-fredoka font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              {activeFolder ? `Add in ${activeFolder} ✨` : 'New Doodle ✨'}
            </button>
          </div>
        ) : (
          <>
            {/* STARRED NOTES SECTION */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-fredoka text-[11px] font-bold uppercase tracking-widest text-amber-300/90">
                    Starred Favorites ({pinnedNotes.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {pinnedNotes.map((note) => {
                    const colorStyle = NOTE_COLORS[note.color_tag as NoteColor] || NOTE_COLORS.cyan || NOTE_COLORS.default;
                    const isActive = activeNoteId === note.id;

                    return (
                      <div
                        key={note.id}
                        onClick={() => onSelectNote(note)}
                        className={`group relative p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border backdrop-blur-xl ${
                          isActive
                            ? 'bg-[#1A1B2F] border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.3)] ring-2 ring-cyan-400/40 translate-x-1'
                            : 'bg-[#1A1B2F]/60 hover:bg-[#1A1B2F] border-white/10 hover:border-cyan-400/40 hover:-translate-y-0.5 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: colorStyle.primary }}
                            />
                            <h4 className="font-fredoka text-sm font-bold text-white truncate group-hover:text-cyan-200 transition-colors">
                              {note.title || 'Untitled Doodle'}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(note.id, true);
                              }}
                              title="Unstar note"
                              className="p-1.5 rounded-xl text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(note);
                              }}
                              title="Delete note"
                              className="md:opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {note.body && (
                          <p className="font-nunito text-xs text-slate-300/90 line-clamp-2 mt-1.5 leading-relaxed">
                            {note.body.replace(/[#*`_~]/g, '')}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
                          <span className="font-quicksand text-[10px] font-bold text-purple-300">
                            {note.folder || 'Personal'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">
                            {formatRelativeTime(note.updated_at || note.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ALL NOTES SECTION */}
            <div className="space-y-2">
              {pinnedNotes.length > 0 && regularNotes.length > 0 && (
                <div className="flex items-center gap-1.5 px-1.5 pt-2">
                  <span className="font-fredoka text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    All Doodles ({regularNotes.length})
                  </span>
                </div>
              )}

              {regularNotes.map((note) => {
                const colorStyle = NOTE_COLORS[note.color_tag as NoteColor] || NOTE_COLORS.cyan || NOTE_COLORS.default;
                const isActive = activeNoteId === note.id;

                if (viewStyle === 'compact') {
                  return (
                    <div
                      key={note.id}
                      onClick={() => onSelectNote(note)}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#1A1B2F] border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/40'
                          : 'bg-[#1A1B2F]/40 hover:bg-[#1A1B2F]/80 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: colorStyle.primary }}
                        />
                        <span className="font-fredoka text-xs font-bold text-slate-200 truncate group-hover:text-white">
                          {note.title || 'Untitled Doodle'}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                        {formatRelativeTime(note.updated_at || note.created_at)}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    className={`group relative p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border backdrop-blur-xl ${
                      isActive
                        ? 'bg-[#1A1B2F] border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.3)] ring-2 ring-cyan-400/40 translate-x-1'
                        : 'bg-[#1A1B2F]/60 hover:bg-[#1A1B2F] border-white/10 hover:border-cyan-400/30 hover:-translate-y-0.5 shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: colorStyle.primary }}
                        />
                        <h4 className="font-fredoka text-sm font-bold text-slate-100 truncate group-hover:text-cyan-200 transition-colors">
                          {note.title || 'Untitled Doodle'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(note.id, false);
                          }}
                          title="Star note"
                          className="md:opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note);
                          }}
                          title="Delete note"
                          className="md:opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {note.body && (
                      <p className="font-nunito text-xs text-slate-300/90 line-clamp-2 mt-1.5 leading-relaxed">
                        {note.body.replace(/[#*`_~]/g, '')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
                      <span className="font-quicksand text-[10px] font-bold text-purple-300">
                        {note.folder || 'Personal'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(note.updated_at || note.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

