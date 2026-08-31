import React, { useState } from 'react';
import { Note, NOTE_COLORS, NoteColor } from '../types';
import { Pin, Pencil, Trash2, Copy, Check, Clock, CloudOff } from 'lucide-react';

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

  const colorConfig = NOTE_COLORS[(note.color_tag as NoteColor) || 'default'] || NOTE_COLORS.default;

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
      className={`group relative rounded-xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between ${
        colorConfig.cardBg
      } ${colorConfig.border} ${
        note.is_pinned ? 'ring-1 ring-amber-400/60 dark:ring-amber-500/40 shadow-xs' : ''
      } ${isListView ? 'sm:flex-row sm:items-center sm:gap-6' : ''}`}
    >
      <div className={`${isListView ? 'flex-1 min-w-0' : ''}`}>
        {/* Top bar: Pin indicator + Action icons */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {note.is_pinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/50 px-2 py-0.5 rounded-md">
                <Pin className="w-3 h-3 fill-current" />
                Pinned
              </span>
            )}
            {note._syncStatus === 'pending' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                <CloudOff className="w-2.5 h-2.5" />
                Saved locally
              </span>
            )}
          </div>

          {/* Quick Action buttons (hover or mobile tap) */}
          <div
            className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pin Toggle */}
            <button
              onClick={() => onTogglePin(note.id)}
              title={note.is_pinned ? 'Unpin note' : 'Pin note to top'}
              className={`p-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                note.is_pinned ? 'text-amber-600 dark:text-amber-400' : ''
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-current' : ''}`} />
            </button>

            {/* Copy Content */}
            <button
              onClick={handleCopy}
              title="Copy note content"
              className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(note)}
              title="Edit note"
              className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(note)}
              title="Delete note"
              className="p-1.5 rounded-md text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1.5 line-clamp-1 break-words">
          {note.title || <span className="italic text-stone-400 dark:text-stone-500 font-normal">Untitled Note</span>}
        </h3>

        {/* Note Body Preview */}
        <p className={`text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap break-words ${isListView ? 'line-clamp-2' : 'line-clamp-4'} mb-3`}>
          {note.body || <span className="italic text-stone-400 dark:text-stone-500">No content</span>}
        </p>

        {/* Tags list */}
        {Array.isArray(note.tags) && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta: Created Date */}
      <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-stone-400" />
          <span>Created {formatDate(note.created_at)}</span>
        </span>
        <span className="text-[10px] text-stone-400 dark:text-stone-500">
          {note.body ? `${note.body.trim().split(/\s+/).filter(Boolean).length} words` : '0 words'}
        </span>
      </div>
    </article>
  );
};
