import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api';
import ScoreTrendChart from '../components/analytics/ScoreTrendChart';
import CategoryRadarChart from '../components/analytics/CategoryRadarChart';
import AccuracySpeedScatter from '../components/analytics/AccuracySpeedScatter';
import DailyHeatmap from '../components/analytics/DailyHeatmap';
import WeakTopicsList from '../components/analytics/WeakTopicsList';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { 
  BarChart3, 
  LineChart, 
  Radar, 
  Activity, 
  Calendar, 
  AlertTriangle, 
  Sparkles,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getDashboardAnalytics();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load progress analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Skill Diagnostics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Progress & Competency Tracker
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Deep telemetry on your technical evolution, retention patterns, speed efficiency, and focus areas.
        </p>
      </div>

      {/* Top 2 Charts: Score Trend & Category Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Score Trend Line */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Score Progression Over Time</span>
              </h3>
              <p className="text-xs text-slate-400">Chronological accuracy trajectory across all taken assessments</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              Avg: {data?.averageScore || 0}%
            </span>
          </div>

          <ScoreTrendChart data={data?.scoreTrend || []} />
        </div>

        {/* Chart 2: Category Radar */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-500" />
                <span>Domain Strength & Weakness Radar</span>
              </h3>
              <p className="text-xs text-slate-400">Multi-axis proficiency mapping across tech specializations</p>
            </div>
          </div>

          <CategoryRadarChart data={data?.categoryRadar || []} />
        </div>

      </div>

      {/* Second Row: Accuracy vs Speed & 60-Day Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 3: Accuracy vs Speed */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Accuracy vs. Completion Speed</span>
              </h3>
              <p className="text-xs text-slate-400">Correlation between minutes spent and accuracy percentage</p>
            </div>
          </div>

          <AccuracySpeedScatter data={data?.accuracySpeed || []} />
        </div>

        {/* Chart 4: Daily Heatmap */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Daily Practice Activity (Last 60 Days)</span>
              </h3>
              <p className="text-xs text-slate-400">Consistency heatmap tracking test frequency</p>
            </div>
            <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
              {data?.currentStreak || 0} Day Streak
            </span>
          </div>

          <DailyHeatmap data={data?.dailyHeatmap || []} />
        </div>

      </div>

      {/* Third Row: Weak Topics Action Center */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Targeted Weak Topics & Retake Recommendations</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent suggestions based on quiz scores that fell below 70% threshold.
          </p>
        </div>

        <WeakTopicsList weakTopics={data?.weakTopics || []} />
      </div>

    </div>
  );
}
