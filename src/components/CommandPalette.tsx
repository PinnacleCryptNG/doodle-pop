import React, { useState, useEffect } from 'react';
import { Note, ThemeMode } from '../types';
import {
  Search,
  Plus,
  Star,
  FileText,
  RefreshCw,
  ArrowRight,
  X,
  Sun,
  Moon
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onFilterPinned: () => void;
  onForceSync: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onNewNote,
  onFilterPinned,
  onForceSync,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const isDark = themeMode === 'dark';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery('');
        }
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotes = query.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.body.toLowerCase().includes(query.toLowerCase()) ||
          (Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
      )
    : notes.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          isDark ? 'bg-[#1a1d2e] border-slate-700' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div
          className={`p-3.5 border-b flex items-center gap-2.5 ${
            isDark ? 'border-slate-800 bg-[#141620]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4 text-amber-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, tags, or commands..."
            className={`w-full bg-transparent border-none text-xs sm:text-sm font-quicksand focus:outline-hidden ${
              isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Commands List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {!query && (
            <div
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Quick Actions
            </div>
          )}

          {!query && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onNewNote();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors group cursor-pointer ${
                  isDark ? 'hover:bg-slate-800/80 text-white' : 'hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-quicksand text-xs font-bold group-hover:text-amber-500 transition-colors">
                      Create new note
                    </span>
                    <p className={`text-[11px] font-quicksand ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Start writing a new note
                    </p>
                  </div>
                </div>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md border ${
                    isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  ⌘N
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onFilterPinned();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors group cursor-pointer ${
                  isDark ? 'hover:bg-slate-800/80 text-white' : 'hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                  </div>
                  <div>
                    <span className="font-quicksand text-xs font-bold group-hover:text-amber-500 transition-colors">
                      View Starred
                    </span>
                    <p className={`text-[11px] font-quicksand ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      See your pinned notes
                    </p>
                  </div>
                </div>
              </button>

              {onToggleTheme && (
                <button
                  onClick={() => {
                    onClose();
                    onToggleTheme();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors group cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/80 text-white' : 'hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="font-quicksand text-xs font-bold group-hover:text-indigo-400 transition-colors">
                        Toggle Theme ({isDark ? 'Switch to Light' : 'Switch to Dark'})
                      </span>
                      <p className={`text-[11px] font-quicksand ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Change between dark and light appearance
                      </p>
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onForceSync();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors group cursor-pointer ${
                  isDark ? 'hover:bg-slate-800/80 text-white' : 'hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-quicksand text-xs font-bold group-hover:text-emerald-500 transition-colors">
                      Sync notes
                    </span>
                    <p className={`text-[11px] font-quicksand ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Save and synchronize offline changes
                    </p>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Note Search Results */}
          {filteredNotes.length > 0 && (
            <div className="pt-1">
              <div
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Notes ({filteredNotes.length})
              </div>
              {filteredNotes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    onSelectNote(n);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors group cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/80 text-white' : 'hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-quicksand text-xs font-semibold truncate group-hover:text-amber-500 transition-colors">
                      {n.title || 'Untitled Note'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {query && filteredNotes.length === 0 && (
            <div className={`py-6 text-center text-xs font-quicksand ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No matching notes found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div
          className={`p-2.5 border-t flex items-center justify-between text-[11px] font-quicksand ${
            isDark ? 'bg-[#141620] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <span>↑ ↓ navigate</span>
            <span>↵ choose</span>
            <span>Esc dismiss</span>
          </div>
          <span className="font-medium">Command Menu</span>
        </div>
      </div>
    </div>
  );
};
