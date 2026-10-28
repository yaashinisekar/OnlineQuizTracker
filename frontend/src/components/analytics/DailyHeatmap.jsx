import React from 'react';

export default function DailyHeatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-400 text-sm italic">
        No activity logs recorded yet.
      </div>
    );
  }

  const getColorClass = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50';
    if (count === 1) return 'bg-indigo-300 dark:bg-indigo-900 border-indigo-400 dark:border-indigo-700';
    if (count === 2) return 'bg-indigo-500 dark:bg-indigo-700 border-indigo-600 dark:border-indigo-500';
    return 'bg-indigo-600 dark:bg-indigo-500 border-indigo-700 dark:border-indigo-400 shadow-sm shadow-indigo-500/40';
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-start items-center">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] border transition-transform hover:scale-125 cursor-pointer relative group ${getColorClass(item.count)}`}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
              <div className="bg-slate-900 text-white text-[11px] rounded-md px-2 py-1 shadow-lg whitespace-nowrap">
                <span className="font-semibold">{item.date}</span>: {item.count} quiz{item.count === 1 ? '' : 'zes'}
                {item.count > 0 && ` (avg ${item.averageScore}%)`}
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span>60 days ago</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[3px] bg-slate-100 dark:bg-slate-800" />
          <div className="w-3 h-3 rounded-[3px] bg-indigo-300 dark:bg-indigo-900" />
          <div className="w-3 h-3 rounded-[3px] bg-indigo-500 dark:bg-indigo-700" />
          <div className="w-3 h-3 rounded-[3px] bg-indigo-600 dark:bg-indigo-500" />
          <span>More</span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}
