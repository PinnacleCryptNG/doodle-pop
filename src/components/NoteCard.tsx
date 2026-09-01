import React, { useState } from 'react';
import { Note, NOTE_COLORS, NoteColor } from '../types';
import { Pin, Pencil, Trash2, Copy, Check, Clock, CloudOff, Hash } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  viewMode: 'grid' | 'list';
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  viewMode,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const [copied, setCopied] = useState(false);

  const colorConfig = NOTE_COLORS[(note.color_tag as NoteColor) || 'cyan'] || NOTE_COLORS.cyan || NOTE_COLORS.default;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = `${note.title}\n\n${note.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'Recent';
    }
  };

  const isListView = viewMode === 'list';

  return (
    <article
      id={`note-card-${note.id}`}
      onClick={() => onEdit(note)}
      className={`group relative rounded-3xl backdrop-blur-xl border p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] cursor-pointer flex flex-col justify-between overflow-hidden ${
        colorConfig.cardBg
      } ${colorConfig.border} ${
        note.is_pinned ? 'ring-2 ring-amber-400/80 shadow-[0_0_25px_rgba(250,204,21,0.25)]' : ''
      } ${isListView ? 'sm:flex-row sm:items-center sm:gap-6' : ''}`}
    >
      {/* Subtle top-corner decorative highlight */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />

      <div className={`relative z-10 ${isListView ? 'flex-1 min-w-0' : ''}`}>
        {/* Top bar: Pin indicator + Action icons */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {note.is_pinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-fredoka font-bold text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse-glow">
                <Pin className="w-3 h-3 fill-current stroke-[2.5]" />
                Pinned
              </span>
            )}
            {note._syncStatus === 'pending' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-quicksand font-bold text-slate-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                <CloudOff className="w-2.5 h-2.5 text-amber-400" />
                Local
              </span>
            )}
          </div>

          {/* Quick Action buttons */}
          <div
            className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pin Toggle */}
            <button
              onClick={() => onTogglePin(note.id)}
              title={note.is_pinned ? 'Unpin note' : 'Pin note to top'}
              className={`p-1.5 rounded-xl text-slate-400 hover:text-white bg-black/30 hover:bg-black/60 border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                note.is_pinned ? 'text-amber-400 border-amber-400/40 bg-amber-400/15' : ''
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-current' : ''}`} />
            </button>

            {/* Copy Content */}
            <button
              onClick={handleCopy}
              title="Copy note text"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-black/30 hover:bg-black/60 border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(note)}
              title="Edit note"
              className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 bg-black/30 hover:bg-black/60 border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(note)}
              title="Delete note"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 bg-black/30 hover:bg-rose-950/60 border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="font-fredoka text-lg font-bold text-white mb-2 line-clamp-1 break-words tracking-tight group-hover:text-cyan-200 transition-colors">
          {note.title || <span className="italic text-slate-400 font-normal">Untitled Doodle</span>}
        </h3>

        {/* Note Body Preview */}
        <p className={`font-nunito text-xs sm:text-sm text-slate-200/90 whitespace-pre-wrap break-words leading-relaxed ${isListView ? 'line-clamp-2' : 'line-clamp-4'} mb-4`}>
          {note.body || <span className="italic text-slate-400/80">No notes written yet...</span>}
        </p>

        {/* Tags list */}
        {Array.isArray(note.tags) && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-quicksand font-bold bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-0.5 rounded-xl border border-white/10 transition-all"
              >
                <Hash className="w-2.5 h-2.5 text-cyan-300" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta: Date & Word Count */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300/80 font-quicksand font-semibold">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-cyan-300" />
          <span>{formatDate(note.created_at)}</span>
        </span>
        <span className="px-2 py-0.5 rounded-lg bg-black/30 border border-white/5 text-[10px] font-mono text-slate-300">
          {note.body ? `${note.body.trim().split(/\s+/).filter(Boolean).length} words` : '0 words'}
        </span>
      </div>
    </article>
  );
};
