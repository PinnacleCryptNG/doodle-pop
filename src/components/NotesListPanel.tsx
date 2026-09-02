import React from 'react';
import { Note, SortOption, NOTE_COLORS, NoteColor, FolderItem, DEFAULT_FOLDERS, getThemeConfig } from '../types';
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
  pageTheme?: NoteColor;
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
  pageTheme = 'obsidian',
}) => {
  const themeConfig = getThemeConfig(pageTheme);
  const [viewStyle, setViewStyle] = React.useState<'preview' | 'compact'>('preview');

  const currentFolderObj = folders.find((f) => f.id === activeFolder);

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
      className="w-full md:w-80 lg:w-96 h-full bg-[#151722] border-r border-slate-800 flex flex-col shrink-0 select-none overflow-hidden"
    >
      {/* Top Header & Search Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800 space-y-3 bg-[#181a27] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {onOpenSidebarMobile && (
              <button
                type="button"
                onClick={onOpenSidebarMobile}
                title="Open categories and folders"
                className="md:hidden p-2 -ml-1 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Menu className="w-5 h-5" style={{ color: themeConfig.primaryHover }} />
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
                    className="w-4 h-4 shrink-0"
                  />
                  <h2
                    className="font-fredoka text-base sm:text-lg font-bold tracking-tight truncate transition-colors text-white"
                  >
                    {activeFolder}
                  </h2>
                </div>
              ) : activeTag ? (
                <h2 className="font-fredoka text-base sm:text-lg font-bold text-white tracking-tight truncate transition-colors">
                  #{activeTag}
                </h2>
              ) : (
                <h2 className="font-fredoka text-base sm:text-lg font-bold text-white tracking-tight truncate transition-colors">
                  Notes
                </h2>
              )}
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {notes.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View style toggle */}
            <button
              onClick={() => setViewStyle(viewStyle === 'preview' ? 'compact' : 'preview')}
              title={viewStyle === 'preview' ? 'Show compact list' : 'Show preview cards'}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
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
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-colors cursor-pointer flex items-center justify-center min-h-[36px] min-w-[36px]"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1d2e] border border-slate-700 rounded-xl shadow-xl p-1.5 z-50 hidden group-hover:block">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Sort Order
                </div>
                <button
                  onClick={() => onSortChange('created_desc')}
                  style={sortBy === 'created_desc' ? { color: themeConfig.primaryHover } : undefined}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                    sortBy === 'created_desc'
                      ? 'font-bold bg-slate-800'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Newest first
                </button>
                <button
                  onClick={() => onSortChange('updated_desc')}
                  style={sortBy === 'updated_desc' ? { color: themeConfig.primaryHover } : undefined}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                    sortBy === 'updated_desc'
                      ? 'font-bold bg-slate-800'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Recently edited
                </button>
                <button
                  onClick={() => onSortChange('title_asc')}
                  style={sortBy === 'title_asc' ? { color: themeConfig.primaryHover } : undefined}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                    sortBy === 'title_asc'
                      ? 'font-bold bg-slate-800'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Alphabetical (A - Z)
                </button>
              </div>
            </div>

            {/* Quick New Note Button */}
            <button
              onClick={() => onNewNote(activeFolder || undefined)}
              title={activeFolder ? `New note in ${activeFolder}` : 'Create note'}
              style={{ backgroundColor: themeConfig.primary }}
              className="p-2 rounded-xl text-slate-950 hover:opacity-90 transition-opacity cursor-pointer shadow-sm min-h-[36px] min-w-[36px] flex items-center justify-center font-bold"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="notes-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes & tags..."
            className="w-full bg-[#12131c] border border-slate-700/80 rounded-xl pl-9 pr-14 py-2 text-xs text-white placeholder-slate-500 font-nunito transition-colors theme-ring-focus"
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
              className="absolute right-2.5 px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 hover:text-white transition-colors"
            >
              ⌘K
            </button>
          )}
        </div>

        {/* Active Filter Badges */}
        {(activeTag || activeFolder || searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {activeFolder && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-quicksand font-semibold border border-slate-700">
                <FolderIcon icon={currentFolderObj?.icon} className="w-3 h-3 text-slate-400" />
                <span>{activeFolder}</span>
                <button onClick={onClearFolder} className="hover:text-rose-400 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeTag && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-quicksand font-semibold border border-slate-700">
                <span>#{activeTag}</span>
                <button onClick={onClearTag} className="hover:text-rose-400 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-quicksand font-semibold border border-slate-700">
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {notes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center px-4">
            <div
              className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3"
              style={{ color: themeConfig.primaryHover }}
            >
              <FolderIcon icon={currentFolderObj?.icon || 'folder'} className="w-6 h-6" />
            </div>
            <h3 className="font-fredoka text-sm font-bold text-white">
              {activeFolder ? `No notes in ${activeFolder}` : 'No notes found'}
            </h3>
            <p className="font-quicksand text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
              {searchQuery || activeTag
                ? 'Try adjusting your search query or clear the filter.'
                : activeFolder
                ? `Create a note in ${activeFolder} to start writing.`
                : 'Click below to create your first note.'}
            </p>
            <button
              onClick={() => onNewNote(activeFolder || undefined)}
              style={{ backgroundColor: themeConfig.primary }}
              className="mt-3 px-4 py-2 rounded-xl text-slate-950 font-quicksand font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
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
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="font-quicksand text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Starred ({pinnedNotes.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {pinnedNotes.map((note) => {
                    const colorStyle = NOTE_COLORS[note.color_tag as NoteColor] || NOTE_COLORS.obsidian || NOTE_COLORS.default;
                    const isActive = activeNoteId === note.id;

                    return (
                      <div
                        key={note.id}
                        onClick={() => onSelectNote(note)}
                        style={
                          isActive
                            ? {
                                borderColor: themeConfig.primary,
                                backgroundColor: '#202436',
                              }
                            : undefined
                        }
                        className={`group relative p-3 rounded-xl transition-all duration-150 cursor-pointer border ${
                          isActive
                            ? 'shadow-sm'
                            : 'bg-[#1a1d2e] hover:bg-[#202436] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: colorStyle.primary }}
                            />
                            <h4 className="font-fredoka text-xs sm:text-sm font-bold text-white truncate transition-colors">
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
                              className="p-1 rounded-md text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(note);
                              }}
                              title="Delete note"
                              className="md:opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {note.body && (
                          <p className="font-nunito text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                            {note.body.replace(/[#*`_~]/g, '')}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 font-quicksand">
                          <span>{note.folder || 'Personal'}</span>
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
                  <span className="font-quicksand text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    All Notes ({regularNotes.length})
                  </span>
                </div>
              )}

              {regularNotes.map((note) => {
                const colorStyle = NOTE_COLORS[note.color_tag as NoteColor] || NOTE_COLORS.obsidian || NOTE_COLORS.default;
                const isActive = activeNoteId === note.id;

                if (viewStyle === 'compact') {
                  return (
                    <div
                      key={note.id}
                      onClick={() => onSelectNote(note)}
                      style={
                        isActive
                          ? {
                              borderColor: themeConfig.primary,
                              backgroundColor: '#202436',
                            }
                          : undefined
                      }
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                        isActive
                          ? 'text-white'
                          : 'bg-[#1a1d2e] hover:bg-[#202436] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: colorStyle.primary }}
                        />
                        <span className="font-fredoka text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                          {note.title || 'Untitled Note'}
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
                    style={
                      isActive
                        ? {
                            borderColor: themeConfig.primary,
                            backgroundColor: '#202436',
                          }
                        : undefined
                    }
                    className={`group relative p-3 rounded-xl transition-all duration-150 cursor-pointer border ${
                      isActive
                        ? 'shadow-sm'
                        : 'bg-[#1a1d2e] hover:bg-[#202436] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: colorStyle.primary }}
                        />
                        <h4 className="font-fredoka text-xs sm:text-sm font-bold text-slate-200 truncate transition-colors">
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
                          className="md:opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note);
                          }}
                          title="Delete note"
                          className="md:opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {note.body && (
                      <p className="font-nunito text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {note.body.replace(/[#*`_~]/g, '')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 font-quicksand">
                      <span>{note.folder || 'Personal'}</span>
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
