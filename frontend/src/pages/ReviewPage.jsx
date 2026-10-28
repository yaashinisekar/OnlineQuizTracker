import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attemptApi } from '../api';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  HelpCircle, 
  FileText, 
  Check, 
  X,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function ReviewPage() {
  const { attemptId } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await attemptApi.getReview(attemptId);
        setReview(res.data);
      } catch (err) {
        console.error("Failed to load attempt review:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p>Review data unavailable.</p>
        <Link to="/history" className="text-indigo-600 underline">Back to History</Link>
      </div>
    );
  }

  const questions = review.questions || [];
  const filteredQuestions = questions.filter((q) => {
    if (filter === 'CORRECT') return q.isCorrect;
    if (filter === 'WRONG') return !q.isCorrect && !q.isSkipped;
    if (filter === 'SKIPPED') return q.isSkipped;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Attempt History</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Review: {review.quizTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Final Score: <strong className="text-indigo-600 dark:text-indigo-400">{review.percentage}%</strong> ({review.scoreObtained}/{review.totalMarks} Marks) • {review.isPassed ? 'PASSED' : 'FAILED'}
          </p>
        </div>

        <Link
          to={`/quizzes/id/${review.quizId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0 self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Quiz</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All ({questions.length})
        </button>
        <button
          onClick={() => setFilter('CORRECT')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filter === 'CORRECT'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Correct ({review.correctCount})
        </button>
        <button
          onClick={() => setFilter('WRONG')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filter === 'WRONG'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Wrong ({review.wrongCount})
        </button>
        <button
          onClick={() => setFilter('SKIPPED')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filter === 'SKIPPED'
              ? 'bg-slate-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Skipped ({review.skippedCount})
        </button>
      </div>

      {/* Question Review Cards */}
      <div className="space-y-6">
        {filteredQuestions.map((q, idx) => {
          return (
            <div
              key={q.questionId}
              className={`bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border shadow-sm space-y-5 transition-colors ${
                q.isCorrect
                  ? 'border-emerald-200 dark:border-emerald-900/60'
                  : q.isSkipped
                  ? 'border-slate-200 dark:border-slate-700'
                  : 'border-rose-200 dark:border-rose-900/60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Question #{q.orderIndex || idx + 1}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-semibold text-slate-500 dark:text-slate-400">
                    {q.marks} mark{q.marks > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Question Status Tag */}
                {q.isCorrect ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marksAwarded})
                  </span>
                ) : q.isSkipped ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MinusCircle className="w-3.5 h-3.5" /> Skipped (0)
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Wrong ({q.marksAwarded})
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {q.questionText}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {q.options.map((opt, oIdx) => {
                  const wasChosenByUser = q.userSelectedOptionIds.includes(opt.id);
                  const isCorrectAnswer = Boolean(opt.isCorrect);

                  let optClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300";
                  if (isCorrectAnswer) {
                    optClass = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold";
                  } else if (wasChosenByUser && !isCorrectAnswer) {
                    optClass = "border-rose-500 bg-rose-50/70 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold";
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border-2 text-sm ${optClass}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-bold opacity-60">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <span>{opt.optionText}</span>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold">
                        {wasChosenByUser && (
                          <span className={`px-2 py-0.5 rounded ${
                            isCorrectAnswer
                              ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                              : 'bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100'
                          }`}>
                            Your Choice
                          </span>
                        )}
                        {isCorrectAnswer && (
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1">
                            <Check className="w-3 h-3" /> Correct Answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {q.explanation && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Explanation & Core Concept</span>
                  </div>
                  <p className="leading-relaxed pl-5">
                    {q.explanation}
                  </p>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
