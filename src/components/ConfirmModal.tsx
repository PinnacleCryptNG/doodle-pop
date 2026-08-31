import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        id="confirm-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-full shrink-0 ${
              isDestructive
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
              {title}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-action-button"
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-xs font-medium rounded-lg text-white transition-all shadow-xs cursor-pointer ${
                  isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                    : 'bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 active:scale-95'
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
