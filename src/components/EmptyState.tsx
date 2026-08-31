import React from 'react';
import { NotebookPen, Plus, SearchX } from 'lucide-react';

interface EmptyStateProps {
  isSearch: boolean;
  searchQuery?: string;
  onNewNote: () => void;
  onClearSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearch,
  searchQuery,
  onNewNote,
  onClearSearch,
}) => {
  if (isSearch) {
    return (
      <div className="text-center py-16 px-4 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 my-4">
        <div className="w-12 h-12 rounded-2xl bg-stone-200/60 dark:bg-stone-800 text-stone-500 flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
          No matching notes found
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-6">
          {searchQuery ? `We couldn't find any note matching "${searchQuery}".` : 'Try adjusting your search query or filters.'}
        </p>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-4 py-2 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Clear Search Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-20 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 my-4">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
        <NotebookPen className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
        No notes yet
      </h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
        Capture thoughts, to-do lists, and ideas. Everything saves automatically and stays in sync across your devices.
      </p>
      <button
        id="empty-create-note-button"
        onClick={onNewNote}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Create Your First Note</span>
      </button>
    </div>
  );
};
