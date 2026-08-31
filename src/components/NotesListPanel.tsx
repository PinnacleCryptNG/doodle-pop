import React from 'react';
import { Note, SortOption, NOTE_COLORS, NoteColor } from '../types';
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
  FileText
} from 'lucide-react';

interface NotesListPanelProps {
  notes: Note[];
  allNotesCount: number;
  activeNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
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
}) => {
  const [viewStyle, setViewStyle] = React.useState<'preview' | 'compact'>('preview');

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
      className="w-80 sm:w-96 h-screen bg-[#141414] border-r border-white/[0.08] flex flex-col shrink-0 select-none"
    >
      {/* Top Header & Search Bar */}
      <div className="p-3.5 border-b border-white/[0.06] space-y-3 bg-[#161618]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-outfit text-base font-bold text-white tracking-tight">
              {activeFolder ? activeFolder : activeTag ? `#${activeTag}` : 'All Notes'}
            </h2>
            <span className="font-jetbrains text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-[#2DD4BF] font-semibold">
              {notes.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* View style toggle */}
            <button
              onClick={() => setViewStyle(viewStyle === 'preview' ? 'compact' : 'preview')}
              title={viewStyle === 'preview' ? 'Show simple list' : 'Show preview cards'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              {viewStyle === 'preview' ? (
                <ListIcon className="w-3.5 h-3.5" />
              ) : (
                <LayoutGrid className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative group">
              <button
                title="Sort notes"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-[#1E1E2E] border border-white/[0.1] rounded-xl shadow-xl py-1 z-50 hidden group-hover:block backdrop-blur-md">
                <button
                  onClick={() => onSortChange('created_desc')}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    sortBy === 'created_desc' ? 'text-[#2DD4BF] font-semibold bg-[#2DD4BF]/10' : 'text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  Newest first
                </button>
                <button
                  onClick={() => onSortChange('updated_desc')}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    sortBy === 'updated_desc' ? 'text-[#2DD4BF] font-semibold bg-[#2DD4BF]/10' : 'text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  Recently edited
                </button>
                <button
                  onClick={() => onSortChange('title_asc')}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    sortBy === 'title_asc' ? 'text-[#2DD4BF] font-semibold bg-[#2DD4BF]/10' : 'text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  Alphabetical (A - Z)
                </button>
              </div>
            </div>

            {/* Quick New Note */}
            <button
              onClick={onNewNote}
              title="Make a new note"
              className="p-1.5 rounded-lg text-slate-900 bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Clean Search Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            id="notes-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your notes..."
            className="w-full bg-[#121212] border border-white/[0.08] focus:border-[#2DD4BF]/50 rounded-xl pl-9 pr-16 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={onOpenCommandPalette}
              title="Search shortcut"
              className="absolute right-2.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-jetbrains text-slate-400 hover:text-slate-200 transition-colors"
            >
              ⌘K
            </button>
          )}
        </div>

        {/* Active Filter Badges */}
        {(activeTag || activeFolder || searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {activeFolder && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] text-white text-[11px] font-medium border border-white/[0.08]">
                <span>📁 {activeFolder}</span>
                <button onClick={onClearFolder} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeTag && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2DD4BF]/10 text-[#2DD4BF] text-[11px] font-medium border border-[#2DD4BF]/20">
                <span>#{activeTag}</span>
                <button onClick={onClearTag} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 text-[11px] font-medium border border-white/[0.08]">
                <span>"{searchQuery}"</span>
                <button onClick={() => onSearchChange('')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notes List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {notes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#2DD4BF]/30 mb-3 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              <img
                src="/src/assets/images/doodlepop_logo_1788192753040.jpg"
                alt="DoodlePop"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="font-outfit text-sm font-bold text-slate-200">No notes here yet!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              {searchQuery || activeTag
                ? 'Try searching for something else or clear your search.'
                : 'Tap below to make your first fun note! ✨'}
            </p>
            <button
              onClick={onNewNote}
              className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#2DD4BF] text-slate-950 font-outfit font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:bg-[#5EEAD4] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              New Note ✨
            </button>
          </div>
        ) : (
          <>
            {/* STARRED NOTES SECTION */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-cabinet text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Starred Notes ({pinnedNotes.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {pinnedNotes.map((note) => {
                    const colorStyle = NOTE_COLORS[note.color_tag as NoteColor] || NOTE_COLORS.default;
                    const isActive = activeNoteId === note.id;

                    return (
                      <div
                        key={note.id}
                        onClick={() => onSelectNote(note)}
                        className={`group relative p-3 rounded-xl transition-all duration-200 cursor-pointer border shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.08)] ${
                          isActive
                            ? 'bg-[#1E1E2E] border-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.15)] ring-1 ring-[#2DD4BF]/50'
                            : 'bg-[#181822] hover:bg-[#1E1E2E] border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                note.color_tag === 'teal' ? 'bg-[#2DD4BF]' : colorStyle.dot
                              }`}
                            />
                            <h4 className="font-outfit text-xs font-bold text-white truncate group-hover:text-[#2DD4BF] transition-colors">
                              {note.title || 'Untitled Note'}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(note.id, true);
                              }}
                              title="Unstar note"
                              className="p-1 rounded text-amber-400 hover:bg-white/[0.08] transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(note);
                              }}
                              title="Delete note"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {note.body && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                            {note.body.replace(/[#*`_~]/g, '')}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.04]">
                          <div className="flex items-center gap-1 overflow-hidden">
                            {note.tags && note.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="font-cabinet text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.06] truncate"
                              >
                                #{tag}
                              </span>
                            ))}
                            {note.tags && note.tags.length > 2 && (
                              <span className="text-[9px] text-slate-400 font-jetbrains">
                                +{note.tags.length - 2}
                              </span>
                            )}
                          </div>

                          <span className="font-jetbrains text-[10px] text-slate-400 shrink-0">
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
            <div className="space-y-1">
              {pinnedNotes.length > 0 && regularNotes.length > 0 && (
                <div className="flex items-center gap-1.5 px-1.5 pt-2">
                  <span className="font-cabinet text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    All Notes ({regularNotes.length})
                  </span>
                </div>
              )}

              {regularNotes.map((note) => {
                const colorStyle = NOTE_COLORS[note.color_tag as NoteColor] || NOTE_COLORS.default;
                const isActive = activeNoteId === note.id;

                if (viewStyle === 'compact') {
                  return (
                    <div
                      key={note.id}
                      onClick={() => onSelectNote(note)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#1E1E2E] border-[#2DD4BF]/50 text-white shadow-xs'
                          : 'bg-[#16161C] hover:bg-[#1C1C26] border-white/[0.04] hover:border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            note.color_tag === 'teal' ? 'bg-[#2DD4BF]' : colorStyle.dot
                          }`}
                        />
                        <span className="font-outfit text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                          {note.title || 'Untitled Note'}
                        </span>
                      </div>
                      <span className="font-jetbrains text-[10px] text-slate-400 shrink-0 ml-2">
                        {formatRelativeTime(note.updated_at || note.created_at)}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    className={`group relative p-3 rounded-xl transition-all duration-150 cursor-pointer border ${
                      isActive
                        ? 'bg-[#1E1E2E] border-[#2DD4BF]/60 shadow-[0_0_15px_rgba(45,212,191,0.12)]'
                        : 'bg-[#16161E] hover:bg-[#1A1A26] border-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            note.color_tag === 'teal' ? 'bg-[#2DD4BF]' : colorStyle.dot
                          }`}
                        />
                        <h4 className="font-outfit text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                          {note.title || 'Untitled Note'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(note.id, false);
                          }}
                          title="Star note"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-white/[0.06] transition-all cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note);
                          }}
                          title="Delete note"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {note.body && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed font-sans">
                        {note.body.replace(/[#*`_~]/g, '')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {note.tags && note.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="font-cabinet text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.05] truncate"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <span className="font-jetbrains text-[10px] text-slate-400 shrink-0">
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
