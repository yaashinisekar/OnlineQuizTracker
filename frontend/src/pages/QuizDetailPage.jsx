import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizApi } from '../api';
import { 
  Clock, 
  Target, 
  HelpCircle, 
  ShieldAlert, 
  AlertTriangle, 
  Shuffle, 
  CheckCircle, 
  ArrowLeft, 
  Play,
  FileCheck2
} from 'lucide-react';

export default function QuizDetailPage() {
  const { slug } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = isNaN(slug)
          ? await quizApi.getQuizBySlug(slug)
          : await quizApi.getQuizById(slug);
        setQuiz(res.data);
      } catch (err) {
        setError("Quiz not found or currently unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error || "Quiz not found"}</h2>
        <Link to="/quizzes" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
          Return to Quiz Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <Link
        to="/quizzes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>

      {/* Main Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm"
            style={{ backgroundColor: quiz.categoryColor || '#6366f1' }}
          >
            {quiz.categoryName}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {quiz.difficulty} Level
          </span>
          {quiz.negativeMarking && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              Negative Marking (-{quiz.negativeMarkingDeduction})
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {quiz.title}
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {quiz.description}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
          <div>
            <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <div className="text-xs text-slate-400 uppercase font-bold">Duration</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">{quiz.durationMinutes} Mins</div>
          </div>
          <div>
            <HelpCircle className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <div className="text-xs text-slate-400 uppercase font-bold">Questions</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">{quiz.questionCount || 10} Items</div>
          </div>
          <div>
            <Target className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <div className="text-xs text-slate-400 uppercase font-bold">Pass Mark</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">{quiz.passPercentage}%</div>
          </div>
          <div>
            <ShieldAlert className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <div className="text-xs text-slate-400 uppercase font-bold">Max Violations</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">{quiz.maxViolationsAllowed || 3} Strikes</div>
          </div>
        </div>

        {/* Important Rules Checklist */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Assessment Guidelines & Integrity Rules
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Auto-Save Enabled:</strong> Answers are immediately synced to server memory as you select them. Refreshing or accidental browser closing retains your work.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Anti-Cheat Security:</strong> Leaving the active exam window or switching browser tabs registers a violation strike. Exceeding {quiz.maxViolationsAllowed || 3} strikes auto-locks the test.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Server Evaluated:</strong> Scores, percentage, and certificates are strictly validated on the backend.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <FileCheck2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <span><strong>Official Diploma:</strong> Scoring {quiz.passPercentage}% or above grants an official downloadable PDF certificate.</span>
            </li>
          </ul>
        </div>

        {/* CTA Launch Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <Link
            to={`/quizzes/attempt/${quiz.id}`}
            className="w-full py-4 rounded-2xl font-bold text-base text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Assessment Now</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
