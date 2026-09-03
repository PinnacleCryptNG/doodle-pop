import React from 'react';
import { Note, SortOption, FolderItem, DEFAULT_FOLDERS, ThemeMode } from '../types';
import { FolderIcon } from './FolderIcon';
import {
  Search,
  Star,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  X,
  Menu
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
  onOpenSidebarMobile?: () => void;
  onGoHome?: () => void;
  folders?: FolderItem[];
  themeMode?: ThemeMode;
  pageTheme?: any;
}

export const NotesListPanel: React.FC<NotesListPanelProps> = ({
  notes,
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
  onGoHome,
  folders = DEFAULT_FOLDERS,
  themeMode = 'dark',
}) => {
  const [viewStyle, setViewStyle] = React.useState<'preview' | 'compact'>('preview');

  const isDark = themeMode === 'dark';
  const currentFolderObj = folders.find((f) => f.id === activeFolder);

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const regularNotes = notes.filter((n) => !n.is_pinned);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - d.getTime()) / 1000);

      if (diffSecs < 60) return 'Just now';
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleTitleClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      if (onClearFolder) onClearFolder();
      if (onClearTag) onClearTag();
    }
  };

  return (
    <div
      id="notes-list-panel"
      className={`w-full md:w-80 lg:w-96 h-full border-r flex flex-col shrink-0 select-none overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#151722] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      {/* Top Header & Search Bar */}
      <div
        className={`p-3.5 sm:p-4 border-b space-y-3 shrink-0 ${
          isDark ? 'border-slate-800 bg-[#181a27]' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {onOpenSidebarMobile && (
              <button
                type="button"
                onClick={onOpenSidebarMobile}
                title="Open categories and folders"
                className={`md:hidden p-2 -ml-1 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isDark
                    ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
                    : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Menu className="w-5 h-5 text-amber-500" />
              </button>
            )}
            <div
              onClick={handleTitleClick}
              role="button"
              tabIndex={0}
              title="Click to view all notes (Home)"
              className="flex items-center gap-2 cursor-pointer group truncate"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTitleClick();
                }
              }}
            >
              {activeFolder ? (
                <div className="flex items-center gap-1.5 truncate">
                  <FolderIcon
                    icon={currentFolderObj?.icon}
                    className="w-4 h-4 shrink-0 text-amber-500"
                  />
                  <h2
                    className={`font-fredoka text-base sm:text-lg font-bold tracking-tight truncate transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {activeFolder}
                  </h2>
                </div>
              ) : activeTag ? (
                <h2
                  className={`font-fredoka text-base sm:text-lg font-bold tracking-tight truncate transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  #{activeTag}
                </h2>
              ) : (
                <h2
                  className={`font-fredoka text-base sm:text-lg font-bold tracking-tight truncate transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Notes
                </h2>
              )}
            </div>
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded-md border font-semibold ${
                isDark
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {notes.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View style toggle */}
            <button
              onClick={() => setViewStyle(viewStyle === 'preview' ? 'compact' : 'preview')}
              title={viewStyle === 'preview' ? 'Show compact list' : 'Show preview cards'}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isDark
                  ? 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700/60'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
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
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center min-h-[36px] min-w-[36px] ${
                  isDark
                    ? 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700/60'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-xl p-1.5 z-50 hidden group-hover:block animate-in fade-in ${
                  isDark ? 'bg-[#1a1d2e] border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <div
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
                    isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
                  }`}
                >
                  Sort Order
                </div>
                <button
                  onClick={() => onSortChange('created_desc')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                    sortBy === 'created_desc'
                      ? isDark
                        ? 'font-bold bg-slate-800 text-amber-400'
                        : 'font-bold bg-amber-50 text-amber-900'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Newest first
                </button>
                <button
                  onClick={() => onSortChange('updated_desc')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                    sortBy === 'updated_desc'
                      ? isDark
                        ? 'font-bold bg-slate-800 text-amber-400'
                        : 'font-bold bg-amber-50 text-amber-900'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Recently edited
                </button>
                <button
                  onClick={() => onSortChange('title_asc')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                    sortBy === 'title_asc'
                      ? isDark
                        ? 'font-bold bg-slate-800 text-amber-400'
                        : 'font-bold bg-amber-50 text-amber-900'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Title (A-Z)
                </button>
              </div>
            </div>

            {/* Quick New Note Button */}
            <button
              onClick={() => onNewNote(activeFolder || undefined)}
              title="New note"
              className={`p-1.5 rounded-xl font-fredoka font-bold transition-opacity cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs ${
                isDark
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="notes-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, tags (#), contents..."
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-quicksand border focus:outline-hidden transition-all ${
              isDark
                ? 'bg-slate-800/90 text-white placeholder-slate-400 border-slate-700/80 focus:border-amber-400'
                : 'bg-slate-100 text-slate-900 placeholder-slate-400 border-slate-200 focus:border-amber-500'
            }`}
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onOpenCommandPalette}
              title="Open command palette (Cmd+K)"
              className={`absolute right-2 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isDark
                  ? 'bg-slate-900 text-slate-400 border-slate-700'
                  : 'bg-white text-slate-500 border-slate-200 shadow-2xs'
              }`}
            >
              ⌘K
            </button>
          )}
        </div>

        {/* Active Filter Badges */}
        {(activeTag || activeFolder || searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {activeFolder && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-quicksand font-semibold border ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <FolderIcon icon={currentFolderObj?.icon} className="w-3 h-3 text-amber-500" />
                <span>{activeFolder}</span>
                <button onClick={onClearFolder} className="hover:text-rose-500 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeTag && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-quicksand font-semibold border ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <span>#{activeTag}</span>
                <button onClick={onClearTag} className="hover:text-rose-500 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-quicksand font-semibold border ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button onClick={() => onSearchChange('')} className="hover:text-rose-500 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notes List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {notes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center px-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-400'
                  : 'bg-white border-slate-200 text-amber-600 shadow-2xs'
              }`}
            >
              <FolderIcon icon={currentFolderObj?.icon || 'folder'} className="w-6 h-6" />
            </div>
            <h3 className={`font-fredoka text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeFolder ? `No notes in ${activeFolder}` : 'No notes found'}
            </h3>
            <p className={`font-quicksand text-xs mt-1 max-w-[220px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {searchQuery || activeTag
                ? 'Try adjusting your search query or clear the filter.'
                : activeFolder
                ? `Create a note in ${activeFolder} to start writing.`
                : 'Click below to create your first note.'}
            </p>
            <button
              onClick={() => onNewNote(activeFolder || undefined)}
              className={`mt-3 px-4 py-2 rounded-xl font-quicksand font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer hover:opacity-90 transition-opacity ${
                isDark
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{activeFolder ? `Add in ${activeFolder}` : 'New Note'}</span>
            </button>
          </div>
        ) : (
          <>
            {/* STARRED NOTES SECTION */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 px-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="font-quicksand text-[11px] font-bold uppercase tracking-wider text-amber-500">
                    Starred ({pinnedNotes.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {pinnedNotes.map((note) => {
                    const isActive = activeNoteId === note.id;

                    return (
                      <div
                        key={note.id}
                        onClick={() => onSelectNote(note)}
                        className={`group relative p-3 rounded-xl transition-all duration-150 cursor-pointer border ${
                          isActive
                            ? isDark
                              ? 'bg-[#202436] border-amber-400/80 shadow-xs'
                              : 'bg-amber-50/90 border-amber-400 shadow-xs'
                            : isDark
                            ? 'bg-[#1a1d2e] hover:bg-[#202436] border-slate-800 hover:border-slate-700'
                            : 'bg-white hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`font-fredoka text-xs sm:text-sm font-bold truncate transition-colors ${
                                isActive
                                  ? isDark ? 'text-white' : 'text-amber-950'
                                  : isDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
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
                              className="p-1 rounded-md text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(note);
                              }}
                              title="Delete note"
                              className="md:opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {note.body && (
                          <p
                            className={`font-nunito text-xs line-clamp-2 mt-1 leading-relaxed ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {note.body.replace(/[#*`_~]/g, '')}
                          </p>
                        )}

                        <div
                          className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[10px] font-quicksand ${
                            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="font-medium">{note.folder || 'Personal'}</span>
                          <span className="font-mono">{formatRelativeTime(note.updated_at || note.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ALL NOTES SECTION */}
            <div className="space-y-1.5">
              {pinnedNotes.length > 0 && regularNotes.length > 0 && (
                <div className="flex items-center gap-1.5 px-1 pt-1.5">
                  <span
                    className={`font-quicksand text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    All Notes ({regularNotes.length})
                  </span>
                </div>
              )}

              {regularNotes.map((note) => {
                const isActive = activeNoteId === note.id;

                if (viewStyle === 'compact') {
                  return (
                    <div
                      key={note.id}
                      onClick={() => onSelectNote(note)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                        isActive
                          ? isDark
                            ? 'bg-[#202436] border-amber-400/80 text-white'
                            : 'bg-amber-50/90 border-amber-400 text-amber-950'
                          : isDark
                          ? 'bg-[#1a1d2e] hover:bg-[#202436] border-slate-800 hover:border-slate-700 text-slate-200'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <span className="font-fredoka text-xs font-semibold truncate group-hover:text-amber-500 transition-colors">
                        {note.title || 'Untitled Note'}
                      </span>
                      <span
                        className={`font-mono text-[10px] shrink-0 ml-2 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
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
                        ? isDark
                          ? 'bg-[#202436] border-amber-400/80 shadow-xs'
                          : 'bg-amber-50/90 border-amber-400 shadow-xs'
                        : isDark
                        ? 'bg-[#1a1d2e] hover:bg-[#202436] border-slate-800 hover:border-slate-700'
                        : 'bg-white hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`font-fredoka text-xs sm:text-sm font-bold truncate transition-colors ${
                            isActive
                              ? isDark ? 'text-white' : 'text-amber-950'
                              : isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
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
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isDark
                              ? 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note);
                          }}
                          title="Delete note"
                          className="md:opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {note.body && (
                      <p
                        className={`font-nunito text-xs line-clamp-2 mt-1 leading-relaxed ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {note.body.replace(/[#*`_~]/g, '')}
                      </p>
                    )}

                    <div
                      className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[10px] font-quicksand ${
                        isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="font-medium">{note.folder || 'Personal'}</span>
                      <span className="font-mono">{formatRelativeTime(note.updated_at || note.created_at)}</span>
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
