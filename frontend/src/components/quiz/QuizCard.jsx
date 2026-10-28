import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, Target, AlertTriangle, ArrowRight } from 'lucide-react';

export default function QuizCard({ quiz }) {
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'HARD':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'MEDIUM':
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span 
            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow-sm"
            style={{ backgroundColor: quiz.categoryColor || '#6366f1' }}
          >
            {quiz.categoryName}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getDifficultyBadge(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {quiz.description || "Challenge your knowledge with this comprehensive assessment."}
        </p>

        {/* Meta info pills */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{quiz.durationMinutes} mins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>{quiz.questionCount || 10} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>Pass: {quiz.passPercentage}%</span>
          </div>
          {quiz.negativeMarking ? (
            <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>-{quiz.negativeMarkingDeduction || 0.25} Deduct</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span>No Negative Mark</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {quiz.tags && quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {quiz.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action CTA */}
      <Link
        to={`/quizzes/${quiz.slug || quiz.id}`}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-sm shadow-indigo-600/30 transition-all"
      >
        <span>View Details</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
