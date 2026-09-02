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
      className={`group relative rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden ${
        colorConfig.cardBg
      } ${colorConfig.border} ${
        note.is_pinned ? 'ring-1.5 ring-amber-400/80' : ''
      } ${isListView ? 'sm:flex-row sm:items-center sm:gap-6' : ''}`}
    >
      <div className={`relative z-10 ${isListView ? 'flex-1 min-w-0' : ''}`}>
        {/* Top bar: Pin indicator + Action icons */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {note.is_pinned && (
              <span className="inline-flex items-center gap-1 text-[10px] font-fredoka font-bold text-amber-950 bg-amber-400 px-2 py-0.5 rounded-md shadow-xs">
                <Pin className="w-2.5 h-2.5 fill-current" />
                Pinned
              </span>
            )}
            {note._syncStatus === 'pending' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-quicksand font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                <CloudOff className="w-2.5 h-2.5 text-amber-400" />
                Local
              </span>
            )}
          </div>

          {/* Quick Action buttons */}
          <div
            className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pin Toggle */}
            <button
              onClick={() => onTogglePin(note.id)}
              title={note.is_pinned ? 'Unpin note' : 'Pin note to top'}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer ${
                note.is_pinned ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' : ''
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-current' : ''}`} />
            </button>

            {/* Copy Content */}
            <button
              onClick={handleCopy}
              title="Copy note text"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(note)}
              title="Edit note"
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(note)}
              title="Delete note"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="font-fredoka text-base font-bold text-white mb-1.5 line-clamp-1 break-words tracking-tight group-hover:text-sky-200 transition-colors">
          {note.title || <span className="italic text-slate-400 font-normal">Untitled Note</span>}
        </h3>

        {/* Note Body Preview */}
        <p className={`font-nunito text-xs sm:text-sm text-slate-300 whitespace-pre-wrap break-words leading-relaxed ${isListView ? 'line-clamp-2' : 'line-clamp-4'} mb-3`}>
          {note.body || <span className="italic text-slate-500">No notes written yet...</span>}
        </p>

        {/* Tags list */}
        {Array.isArray(note.tags) && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-quicksand font-semibold bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700"
              >
                <Hash className="w-2.5 h-2.5 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta: Date & Word Count */}
      <div className="relative z-10 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-quicksand font-medium">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{formatDate(note.created_at)}</span>
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-slate-300">
          {note.body ? `${note.body.trim().split(/\s+/).filter(Boolean).length} words` : '0 words'}
        </span>
      </div>
    </article>
  );
};
