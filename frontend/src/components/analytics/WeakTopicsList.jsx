import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';

export default function WeakTopicsList({ weakTopics }) {
  if (!weakTopics || weakTopics.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
          No Critical Knowledge Gaps Detected!
        </h4>
        <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
          You are currently maintaining &ge; 70% proficiency across all attempted quizzes. Keep up the high standards!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weakTopics.map((topic) => (
        <div
          key={topic.quizId}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-amber-400 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {topic.categoryName}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Avg: {topic.averagePercentage}%
                </span>
              </div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {topic.quizTitle}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {topic.recommendationReason}
              </p>
            </div>
          </div>

          <Link
            to={`/quizzes/id/${topic.quizId}`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shrink-0 shadow-sm shadow-indigo-600/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Topic</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
