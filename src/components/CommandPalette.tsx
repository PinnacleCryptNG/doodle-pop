import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import {
  Search,
  Plus,
  Star,
  FileText,
  RefreshCw,
  ArrowRight,
  X
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#181824] border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3 bg-[#1E1E2E]">
          <Search className="w-5 h-5 text-[#2DD4BF] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search notes or choose an action..."
            className="w-full bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-hidden font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Commands List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {!query && (
            <div className="px-3 py-1 text-[10px] font-cabinet font-bold uppercase tracking-wider text-slate-400">
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
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#2DD4BF]/10 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#2DD4BF]/15 flex items-center justify-center text-[#2DD4BF]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-outfit text-xs font-semibold text-white group-hover:text-[#2DD4BF]">
                      Make a new note
                    </span>
                    <p className="text-[10px] text-slate-400">Start typing a fresh blank note</p>
                  </div>
                </div>
                <span className="font-jetbrains text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.06]">
                  ⌘N
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onFilterPinned();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <span className="font-outfit text-xs font-semibold text-white group-hover:text-amber-300">
                      View Starred Notes
                    </span>
                    <p className="text-[10px] text-slate-400">See all your favorite notes</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onForceSync();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center text-[#2DD4BF]">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-outfit text-xs font-semibold text-white group-hover:text-[#2DD4BF]">
                      Save and sync all notes
                    </span>
                    <p className="text-[10px] text-slate-400">Check for latest updates and save changes</p>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Note Search Results */}
          {filteredNotes.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1 text-[10px] font-cabinet font-bold uppercase tracking-wider text-slate-400">
                Notes ({filteredNotes.length})
              </div>
              {filteredNotes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    onSelectNote(n);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1E1E2E] text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                    <span className="font-outfit text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {n.title || 'Untitled Note'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2DD4BF] shrink-0" />
                </button>
              ))}
            </div>
          )}

          {query && filteredNotes.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 font-sans">
              No matching notes found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-3 bg-[#121216] border-t border-white/[0.06] flex items-center justify-between text-[10px] font-jetbrains text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑ ↓ to move</span>
            <span>↵ to pick</span>
            <span>Esc to close</span>
          </div>
          <span className="text-[#2DD4BF] font-semibold">✨ DoodlePop Search</span>
        </div>
      </div>
    </div>
  );
};
