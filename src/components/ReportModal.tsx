import React, { useState } from 'react';
import { Flag, X, Check } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReport: (reason: string) => void;
  strangerName?: string;
}

const REPORT_REASONS = [
  'Inappropriate or adult sexual content',
  'Underage participant suspected',
  'Harassment, bullying, or hate speech',
  'Spam, advertising, or bot behavior',
  'Threats, violence, or dangerous behavior',
  'Camera pointed at empty room or recorded screen',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onConfirmReport,
  strangerName = 'Stranger',
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playSkip();
    onConfirmReport(selectedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close report dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Report {strangerName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submitting a report will immediately disconnect and find a new stranger.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            Select Violation Reason:
          </span>
          {REPORT_REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <label
                key={reason}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={isSelected}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-red-500"
                  />
                  <span>{reason}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-red-500 shrink-0" />}
              </label>
            );
          })}

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
            >
              Submit Report & Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
