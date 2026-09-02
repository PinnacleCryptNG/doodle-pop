import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import {
  Search,
  Plus,
  Star,
  FileText,
  RefreshCw,
  ArrowRight,
  X,
  Sparkles,
  Zap
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onFilterPinned: () => void;
  onForceSync: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onNewNote,
  onFilterPinned,
  onForceSync,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery('');
          setSelectedIndex(0);
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#1a1d2e] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-2.5 bg-[#141620]">
          <Search className="w-4 h-4 text-sky-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search notes or select action..."
            className="w-full bg-transparent border-none text-xs sm:text-sm font-quicksand text-white placeholder-slate-500 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Commands List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {!query && (
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 border border-transparent text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-300">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-quicksand text-xs font-bold text-white group-hover:text-sky-300">
                      Create new note
                    </span>
                    <p className="text-[11px] font-quicksand text-slate-400">Start writing a new note</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-800">
                  ⌘N
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onFilterPinned();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 border border-transparent text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                  </div>
                  <div>
                    <span className="font-quicksand text-xs font-bold text-white group-hover:text-amber-300">
                      View Starred
                    </span>
                    <p className="text-[11px] font-quicksand text-slate-400">See your pinned notes</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onForceSync();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 border border-transparent text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-quicksand text-xs font-bold text-white group-hover:text-indigo-300">
                      Sync notes
                    </span>
                    <p className="text-[11px] font-quicksand text-slate-400">Save and synchronize offline changes</p>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Note Search Results */}
          {filteredNotes.length > 0 && (
            <div className="pt-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Notes ({filteredNotes.length})
              </div>
              {filteredNotes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    onSelectNote(n);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="font-quicksand text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {n.title || 'Untitled Note'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {query && filteredNotes.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400 font-quicksand">
              No matching notes found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-2.5 bg-[#141620] border-t border-slate-800 flex items-center justify-between text-[11px] font-quicksand text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑ ↓ navigate</span>
            <span>↵ choose</span>
            <span>Esc dismiss</span>
          </div>
          <span className="text-slate-400 font-medium">
            Search
          </span>
        </div>
      </div>
    </div>
  );
};

