import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, attemptApi } from '../api';
import { 
  Trophy, 
  Target, 
  Flame, 
  Award, 
  Clock, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  BarChart2,
  Calendar
} from 'lucide-react';
import { CardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton';
import WeakTopicsList from '../components/analytics/WeakTopicsList';

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          analyticsApi.getDashboardAnalytics(),
          attemptApi.getHistory({ page: 0, size: 5 }),
        ]);
        setAnalytics(analyticsRes.data);
        setRecentAttempts(historyRes.data.content || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const badges = analytics?.badges || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. Header Hero Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl border border-indigo-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email}`}
              alt={user?.firstName}
              className="w-20 h-20 rounded-2xl border-2 border-indigo-400/50 shadow-md object-cover bg-slate-800 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Level {analytics?.currentLevel || user?.currentLevel || 1} Scholar
                </span>
                <span className="text-xs text-slate-300">
                  Total XP: <strong className="text-white">{analytics?.totalXp || user?.xpPoints || 0}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-sm text-slate-300 max-w-xl mt-1">
                Ready to push your skills forward? Keep your {analytics?.currentStreak || 0}-day streak alive with today's quiz.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/quizzes"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-indigo-900 bg-white hover:bg-slate-100 shadow-md transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Browse Quiz Library</span>
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Full Analytics</span>
            </Link>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
            <span>Level {analytics?.currentLevel || 1} Progress</span>
            <span>{Math.round(analytics?.levelProgressPercentage || 0)}% towards Level {(analytics?.currentLevel || 1) + 1}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 transition-all duration-500"
              style={{ width: `${analytics?.levelProgressPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quizzes Taken</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{analytics?.quizzesTaken || 0}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Score</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{analytics?.averageScore || 0}%</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Best Score</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{analytics?.bestScore || 0}%</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Streak</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{analytics?.currentStreak || 0} Days</h3>
          </div>
        </div>
      </div>

      {/* 3. Weak Topics Recommendation Alert Banner */}
      {analytics?.weakTopics && analytics.weakTopics.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Targeted Weak Topics Identified For You
            </h3>
          </div>
          <WeakTopicsList weakTopics={analytics.weakTopics} />
        </div>
      )}

      {/* 4. Recent Quiz Attempts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Quiz Attempts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review answers, retake tests, and check certificate codes.
            </p>
          </div>
          <Link
            to="/history"
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <Compass className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm">You haven't completed any quizzes yet.</p>
            <Link
              to="/quizzes"
              className="inline-block px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              Browse Available Quizzes
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Quiz Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {recentAttempts.map((att) => (
                  <tr key={att.attemptId} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {att.quizTitle}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {att.categoryName}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {att.percentage}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        att.isPassed
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {att.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {Math.floor((att.totalTimeSeconds || 0) / 60)}m {(att.totalTimeSeconds || 0) % 60}s
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/review/${att.attemptId}`}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                      >
                        Review
                      </Link>
                      <Link
                        to={`/quizzes/id/${att.quizId}`}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                      >
                        Retake
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Gamification Badges Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            <span>Badges & Achievements</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Earn experience rewards and unlock collector badges as you hit exam milestones.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                badge.isUnlocked
                  ? 'bg-gradient-to-b from-indigo-50/70 to-white dark:from-indigo-950/40 dark:to-slate-800 border-indigo-200 dark:border-indigo-800/60 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-50 grayscale'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-sm ${
                badge.isUnlocked ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                <Award className="w-6 h-6" />
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {badge.title}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {badge.description}
              </p>
              <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                badge.isUnlocked 
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {badge.isUnlocked ? `+${badge.xpReward} XP` : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
