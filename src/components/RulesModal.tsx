import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, EyeOff } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close rules modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Omegle Community Guidelines</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Keep random video chats fun, safe, and respectful</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Age Requirement</span>
              You must be at least 18 years old, or 13+ with parental consent, to use Omegle Web.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Zero Tolerance for Inappropriate Content</span>
              Nudity, sexual harassment, hate speech, threats, and illegal activity are strictly forbidden and will result in an immediate permanent ban.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <EyeOff className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Protect Your Privacy</span>
              Never share real personal identifiers (home address, phone number, financial details, passwords) with strangers.
            </div>
          </div>

          <div className="p-3 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl">
            <p>
              Chats are anonymous unless you choose to reveal yourself. Use the <strong>Report</strong> button at any time to instantly skip and flag suspicious behavior.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
