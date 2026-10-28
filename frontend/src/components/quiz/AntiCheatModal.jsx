import React from 'react';
import Modal from '../common/Modal';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AntiCheatModal({ isOpen, onClose, violationCount, maxViolations }) {
  const remaining = Math.max(0, maxViolations - violationCount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Security Warning: Anti-Cheat Breach">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Tab Switch / Focus Loss Detected!
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Navigating away from the exam window or switching browser tabs is strictly monitored to preserve test integrity.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
          <div className="font-semibold flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Violation Strike: {violationCount} / {maxViolations}</span>
          </div>
          <p className="text-xs mt-1 text-amber-700 dark:text-amber-400">
            {remaining > 0
              ? `You have ${remaining} warning${remaining > 1 ? 's' : ''} left before your attempt is automatically locked and submitted with zero marks.`
              : 'Maximum violations reached. This attempt is being locked.'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all"
        >
          I Understand, Return to Assessment
        </button>
      </div>
    </Modal>
  );
}
