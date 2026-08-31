import React, { useState, useEffect, useRef } from 'react';
import { Note, NOTE_COLORS, NoteColor } from '../types';
import { X, Pin, Tag, Palette, Check, Save } from 'lucide-react';

interface NoteEditorProps {
  note: Partial<Note> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: {
    id?: string;
    title: string;
    body: string;
    is_pinned: boolean;
    color_tag: string;
    tags: string[];
  }) => Promise<void>;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [colorTag, setColorTag] = useState<string>('default');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync state when note prop changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setBody(note.body || '');
      setIsPinned(Boolean(note.is_pinned));
      setColorTag(note.color_tag || 'default');
      setTags(note.tags ? [...note.tags] : []);
    } else {
      setTitle('');
      setBody('');
      setIsPinned(false);
      setColorTag('default');
      setTags([]);
    }
    setTagInput('');
  }, [note, isOpen]);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close, Cmd/Ctrl + Enter/S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'Enter')) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, body, isPinned, colorTag, tags]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: note?.id,
        title,
        body,
        is_pinned: isPinned,
        color_tag: colorTag,
        tags,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentColor = NOTE_COLORS[(colorTag as NoteColor) || 'default'] || NOTE_COLORS.default;
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = body.length;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        id="note-editor-modal"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl rounded-2xl border shadow-xl flex flex-col max-h-[90vh] overflow-hidden transition-colors ${currentColor.cardBg} ${currentColor.border}`}
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/70 dark:border-stone-800/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {note?.id ? 'Edit Note' : 'Create New Note'}
            </span>
            <button
              type="button"
              id="note-pin-toggle"
              onClick={() => setIsPinned(!isPinned)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                isPinned
                  ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Pin className={`w-3 h-3 ${isPinned ? 'fill-current' : ''}`} />
              <span>{isPinned ? 'Pinned' : 'Pin to Top'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Form & Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {/* Title input */}
            <div>
              <input
                ref={titleInputRef}
                id="note-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 placeholder-stone-400 bg-transparent border-0 focus:outline-none focus:ring-0 px-0"
              />
            </div>

            {/* Body textarea */}
            <div>
              <textarea
                id="note-body-input"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your note here..."
                rows={10}
                className="w-full text-sm sm:text-base text-stone-800 dark:text-stone-200 placeholder-stone-400 bg-transparent border-0 focus:outline-none focus:ring-0 px-0 resize-none leading-relaxed min-h-[180px]"
              />
            </div>

            {/* Color Palette Picker */}
            <div className="pt-3 border-t border-stone-200/50 dark:border-stone-800/50 flex flex-col gap-2">
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Color Theme:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(Object.keys(NOTE_COLORS) as NoteColor[]).map((key) => {
                  const c = NOTE_COLORS[key];
                  const isSelected = colorTag === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColorTag(key)}
                      className={`h-7 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        c.badge
                      } ${isSelected ? 'ring-2 ring-stone-900 dark:ring-stone-100 shadow-xs' : 'opacity-80 hover:opacity-100'}`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags section */}
            <div className="pt-2 flex flex-col gap-2">
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Tags:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag (press Enter)"
                  className="px-3 py-1.5 text-xs bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 text-xs font-medium bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 rounded-lg text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls & Stats */}
          <div className="px-5 py-3.5 border-t border-stone-200/70 dark:border-stone-800/70 bg-stone-100/50 dark:bg-stone-900/50 flex items-center justify-between gap-3">
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              <span className="hidden sm:inline text-stone-400">• Ctrl+S to save</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="note-save-submit-button"
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Save Note'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
