import React from 'react';
import { NotebookPen, Plus, SearchX, Compass, FileText } from 'lucide-react';

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
      <div className="relative overflow-hidden text-center py-16 px-6 bg-[#161824] rounded-2xl border border-slate-800 my-6 shadow-xl">
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 text-sky-400 flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-7 h-7 text-sky-400" />
          </div>

          <h3 className="font-fredoka text-lg font-bold text-white mb-2 tracking-tight">
            No matching notes found
          </h3>

          <p className="font-quicksand text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed font-medium">
            {searchQuery ? (
              <>
                No notes matched <span className="text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-500/30 font-semibold">&ldquo;{searchQuery}&rdquo;</span>.
              </>
            ) : (
              'Try adjusting your search query or removing the active filters.'
            )}
          </p>

          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-quicksand font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Show All Notes</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden text-center py-16 px-6 bg-[#161824] rounded-2xl border border-dashed border-slate-800 my-6 shadow-xl">
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 mx-auto mb-4">
          <FileText className="w-7 h-7 text-sky-400" />
        </div>

        <h3 className="font-fredoka text-xl font-bold text-white mb-2 tracking-tight">
          Your workspace is empty
        </h3>

        <p className="font-quicksand text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed font-medium">
          Create structured notes, documentation, research logs, and markdown files. Everything is automatically synchronized.
        </p>

        <button
          id="empty-create-note-button"
          onClick={onNewNote}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-fredoka font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Note</span>
        </button>
      </div>
    </div>
  );
};
