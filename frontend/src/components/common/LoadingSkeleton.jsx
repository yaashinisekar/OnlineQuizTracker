import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-md" />
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 border-b border-slate-100 dark:border-slate-700/50 flex items-center px-6 gap-4">
          <div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
