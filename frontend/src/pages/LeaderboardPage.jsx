import React, { useState, useEffect } from 'react';
import { leaderboardApi } from '../api';
import { Trophy, Medal, Award, Flame, Star, Sparkles } from 'lucide-react';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [scope, setScope] = useState('global'); // 'global' | 'weekly' | 'monthly'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        let res;
        if (scope === 'global') {
          res = await leaderboardApi.getGlobal(20);
        } else {
          res = await leaderboardApi.getScoped(scope, 20);
        }
        setEntries(res.data || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [scope]);

  const top3 = entries.slice(0, 3);
  const remainingEntries = entries.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Competitive Rankings</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            QuizTrack Leaderboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compete with top engineers globally, maintain streaks, and climb the XP ranks.
          </p>
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold self-start sm:self-center shadow-sm">
          <button
            onClick={() => setScope('global')}
            className={`px-4 py-2 rounded-xl transition-all ${
              scope === 'global'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All-Time Global
          </button>
          <button
            onClick={() => setScope('weekly')}
            className={`px-4 py-2 rounded-xl transition-all ${
              scope === 'weekly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setScope('monthly')}
            className={`px-4 py-2 rounded-xl transition-all ${
              scope === 'monthly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : entries.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400">
          No rankings recorded for this time range yet.
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
              
              {/* 2nd Place (Silver) */}
              {top3[1] && (
                <div className="order-2 md:order-1 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-300 dark:border-slate-700 shadow-md text-center flex flex-col items-center relative">
                  <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-300 text-slate-800 text-[11px] font-extrabold uppercase tracking-wider">
                    2nd Place
                  </div>
                  <img
                    src={top3[1].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[1].email}`}
                    alt={top3[1].fullName}
                    className="w-16 h-16 rounded-2xl border-2 border-slate-300 dark:border-slate-600 shadow-md object-cover my-2"
                  />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {top3[1].fullName}
                  </h4>
                  <p className="text-xs text-slate-400">Level {top3[1].currentLevel || 1} • {top3[1].currentStreak}d Streak</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 w-full flex justify-between text-xs">
                    <span className="text-slate-400">Avg Score:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{top3[1].averageScore}%</strong>
                  </div>
                  <div className="w-full flex justify-between text-xs mt-1">
                    <span className="text-slate-400">Total XP:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{top3[1].xpPoints} XP</strong>
                  </div>
                </div>
              )}

              {/* 1st Place (Gold Champion) */}
              {top3[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-800 rounded-3xl p-8 border-2 border-amber-400 shadow-xl text-center flex flex-col items-center relative transform md:-translate-y-4">
                  <div className="absolute -top-4 px-4 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
                    <span>Grand Champion</span>
                  </div>
                  <div className="relative my-2">
                    <img
                      src={top3[0].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[0].email}`}
                      alt={top3[0].fullName}
                      className="w-20 h-20 rounded-2xl border-4 border-amber-400 shadow-xl object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-400 text-amber-950 shadow-md">
                      <Trophy className="w-4 h-4 fill-amber-950" />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    {top3[0].fullName}
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    Level {top3[0].currentLevel || 1} • {top3[0].currentStreak}d Hot Streak
                  </p>
                  <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-900/40 w-full flex justify-between text-xs">
                    <span className="text-slate-500">Platform Average:</span>
                    <strong className="text-emerald-600 font-extrabold">{top3[0].averageScore}%</strong>
                  </div>
                  <div className="w-full flex justify-between text-xs mt-1">
                    <span className="text-slate-500">Experience Points:</span>
                    <strong className="text-amber-600 dark:text-amber-400 font-extrabold">{top3[0].xpPoints} XP</strong>
                  </div>
                </div>
              )}

              {/* 3rd Place (Bronze) */}
              {top3[2] && (
                <div className="order-3 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-amber-600/40 dark:border-amber-800/40 shadow-md text-center flex flex-col items-center relative">
                  <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-700 text-white text-[11px] font-extrabold uppercase tracking-wider">
                    3rd Place
                  </div>
                  <img
                    src={top3[2].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[2].email}`}
                    alt={top3[2].fullName}
                    className="w-16 h-16 rounded-2xl border-2 border-amber-700/50 shadow-md object-cover my-2"
                  />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {top3[2].fullName}
                  </h4>
                  <p className="text-xs text-slate-400">Level {top3[2].currentLevel || 1} • {top3[2].currentStreak}d Streak</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 w-full flex justify-between text-xs">
                    <span className="text-slate-400">Avg Score:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{top3[2].averageScore}%</strong>
                  </div>
                  <div className="w-full flex justify-between text-xs mt-1">
                    <span className="text-slate-400">Total XP:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{top3[2].xpPoints} XP</strong>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Full Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-6 w-16">Rank</th>
                    <th className="py-3.5 px-6">Candidate</th>
                    <th className="py-3.5 px-6">Level</th>
                    <th className="py-3.5 px-6">Streak</th>
                    <th className="py-3.5 px-6">Quizzes</th>
                    <th className="py-3.5 px-6">Avg Score</th>
                    <th className="py-3.5 px-6 text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {entries.map((entry) => (
                    <tr key={entry.userId} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-sm text-slate-500">
                        {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : `#${entry.rank}`}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.email}`}
                            alt={entry.fullName}
                            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 object-cover bg-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {entry.fullName}
                            </span>
                            <span className="text-xs text-slate-400">{entry.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold">
                        Lvl {entry.currentLevel || 1}
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-orange-500">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-orange-500" />
                          {entry.currentStreak || 0}d
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold">
                        {entry.totalQuizzesTaken || 0}
                      </td>
                      <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                        {entry.averageScore}%
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                        {entry.xpPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
