import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onCancel}
    >
      <div
        id="confirm-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#1a1d2e] border border-slate-700 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isDestructive
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-fredoka font-bold text-white mb-1.5">
              {title}
            </h3>
            <p className="text-xs sm:text-sm font-quicksand text-slate-300 leading-relaxed mb-6">
              {message}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-quicksand font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-action-button"
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-xs font-quicksand font-bold rounded-xl transition-colors cursor-pointer ${
                  isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-sky-500 hover:bg-sky-400 text-white'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

