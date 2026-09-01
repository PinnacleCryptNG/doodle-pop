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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#1A1B2F]/95 border border-white/15 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#20223D]/80">
          <Search className="w-5 h-5 text-cyan-300 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search doodles or pick an action..."
            className="w-full bg-transparent border-none text-sm font-fredoka text-white placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Commands List */}
        <div className="max-h-96 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
          {!query && (
            <div className="px-3 py-1 text-[11px] font-fredoka uppercase tracking-wider text-cyan-300 font-bold">
              Quick Magic Actions
            </div>
          )}

          {!query && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onNewNote();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-cyan-500/15 border border-transparent hover:border-cyan-500/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-sm">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-fredoka text-sm font-bold text-white group-hover:text-cyan-200">
                      Create a fresh new doodle
                    </span>
                    <p className="text-xs font-quicksand font-semibold text-slate-300">Start typing a blank colorful note</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-cyan-300 px-2 py-0.5 rounded-lg bg-white/10">
                  ⌘N
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onFilterPinned();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-amber-500/15 border border-transparent hover:border-amber-500/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-sm">
                    <Star className="w-4 h-4 fill-amber-300" />
                  </div>
                  <div>
                    <span className="font-fredoka text-sm font-bold text-white group-hover:text-amber-200">
                      View Starred Favorites
                    </span>
                    <p className="text-xs font-quicksand font-semibold text-slate-300">Check out your most loved notes</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onForceSync();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-purple-500/15 border border-transparent hover:border-purple-500/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-400/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-sm">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-fredoka text-sm font-bold text-white group-hover:text-purple-200">
                      Save & Sync all notes
                    </span>
                    <p className="text-xs font-quicksand font-semibold text-slate-300">Instant cloud & local synchronization</p>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Note Search Results */}
          {filteredNotes.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1 text-[11px] font-fredoka uppercase tracking-wider text-purple-300 font-bold">
                Matching Doodles ({filteredNotes.length})
              </div>
              {filteredNotes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    onSelectNote(n);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-[#20223D] border border-transparent hover:border-white/10 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span className="font-fredoka text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {n.title || 'Untitled Doodle'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {query && filteredNotes.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 font-quicksand font-semibold">
              No matching doodles found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-3.5 bg-[#141525] border-t border-white/10 flex items-center justify-between text-xs font-quicksand font-bold text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑ ↓ navigate</span>
            <span>↵ choose</span>
            <span>Esc dismiss</span>
          </div>
          <span className="text-cyan-300 font-fredoka flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> DoodlePop Search
          </span>
        </div>
      </div>
    </div>
  );
};

