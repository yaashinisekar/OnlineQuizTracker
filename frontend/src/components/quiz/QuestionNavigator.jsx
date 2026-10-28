import React from 'react';
import { Bookmark, CheckCircle2, Circle } from 'lucide-react';

export default function QuestionNavigator({
  questions,
  currentIndex,
  onSelectQuestion,
  savedAnswers,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
        Question Navigator
      </h4>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 gap-2.5 mb-6 overflow-y-auto max-h-60 sm:max-h-80 pr-1">
        {questions.map((q, idx) => {
          const ans = savedAnswers[q.id];
          const hasAnswered = ans && ans.selectedOptionIds && ans.selectedOptionIds.length > 0;
          const isMarked = ans && ans.isMarkedForReview;
          const isCurrent = currentIndex === idx;

          let btnClass = "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600";
          if (isMarked) {
            btnClass = "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/30";
          } else if (hasAnswered) {
            btnClass = "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30";
          }

          if (isCurrent) {
            btnClass += " ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900";
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`h-10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center relative ${btnClass}`}
              title={`Question ${idx + 1}`}
            >
              {idx + 1}
              {isMarked && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-2 text-xs text-slate-600 dark:text-slate-300 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-emerald-600" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-amber-500" />
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded border-2 border-indigo-500" />
          <span>Current Active</span>
        </div>
      </div>
    </div>
  );
}
