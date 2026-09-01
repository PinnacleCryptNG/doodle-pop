import React from 'react';
import { NotebookPen, Plus, SearchX, Sparkles, Wand2, Compass } from 'lucide-react';

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
      <div className="relative overflow-hidden text-center py-16 px-6 glass-panel rounded-3xl border border-white/10 my-6 shadow-xl">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#38BDF8]/20 to-[#C084FC]/20 border border-white/20 text-[#38BDF8] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(56,189,248,0.25)] animate-float">
            <SearchX className="w-8 h-8 text-[#38BDF8]" />
          </div>

          <h3 className="font-fredoka text-xl font-bold text-white mb-2 tracking-tight">
            No doodle magic found! 🔍
          </h3>

          <p className="font-quicksand text-sm font-semibold text-slate-300 max-w-sm mx-auto mb-6 leading-relaxed">
            {searchQuery ? (
              <>
                We couldn&apos;t find anything matching <span className="text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30 font-bold">&ldquo;{searchQuery}&rdquo;</span>.
              </>
            ) : (
              'Try adjusting your search terms or clearing your folder filter.'
            )}
          </p>

          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="btn-bouncy inline-flex items-center gap-2 px-5 py-2.5 text-xs font-quicksand font-bold bg-[#241B3F]/90 hover:bg-[#34245E] text-white rounded-2xl border border-[#C084FC]/40 shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-purple-300" />
              <span>Show All Notes</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden text-center py-20 px-6 glass-panel rounded-3xl border-2 border-dashed border-white/15 my-6 shadow-2xl">
      {/* Background glow orbs */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#C084FC]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Floating icon with sparkle */}
        <div className="relative inline-block mx-auto mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#38BDF8] via-[#818CF8] to-[#C084FC] p-[2px] shadow-[0_0_35px_rgba(56,189,248,0.4)] animate-float">
            <div className="w-full h-full bg-[#1A1B2F] rounded-[22px] flex items-center justify-center text-cyan-300">
              <NotebookPen className="w-10 h-10 text-[#38BDF8]" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#FACC15] text-slate-950 p-1.5 rounded-full shadow-lg border border-white/40 animate-bounce">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
        </div>

        <h3 className="font-fredoka text-2xl font-bold text-white mb-2 tracking-tight">
          Your Canvas is Ready! 🎨
        </h3>

        <p className="font-quicksand text-sm font-semibold text-slate-300 max-w-md mx-auto mb-7 leading-relaxed">
          Create colorful notes, to-do checklists, sketches, and stories. Everything syncs instantly with fun cosmic themes!
        </p>

        <button
          id="empty-create-note-button"
          onClick={onNewNote}
          className="btn-bouncy inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] hover:from-[#0284C7] hover:to-[#9333EA] text-white font-fredoka font-bold text-base shadow-[0_0_30px_rgba(56,189,248,0.45)] hover:shadow-[0_0_40px_rgba(192,132,252,0.65)] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Create My First Note</span>
          <Wand2 className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
};

