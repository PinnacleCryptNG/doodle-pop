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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      onClick={onCancel}
    >
      <div
        id="confirm-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#1B1C33]/95 border border-white/15 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3.5 rounded-2xl shrink-0 ${
              isDestructive
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            }`}
          >
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-fredoka font-bold text-white mb-1.5">
              {title}
            </h3>
            <p className="text-sm font-quicksand font-semibold text-slate-300 leading-relaxed mb-6">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-quicksand font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-action-button"
                type="button"
                onClick={onConfirm}
                className={`btn-bouncy px-5 py-2.5 text-xs font-fredoka font-bold rounded-2xl text-white transition-all shadow-lg cursor-pointer ${
                  isDestructive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 hover:from-cyan-300 hover:to-purple-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
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

