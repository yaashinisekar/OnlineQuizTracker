import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attemptApi } from '../api';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import Modal from '../components/common/Modal';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  SlidersHorizontal,
  Scale,
  Award
} from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PASSED' | 'FAILED'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await attemptApi.getHistory({ page: 0, size: 50 });
        setHistory(res.data.content || []);
      } catch (err) {
        console.error("Failed to load attempt history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleToggleCompare = (attempt) => {
    if (selectedForCompare.some((a) => a.attemptId === attempt.attemptId)) {
      setSelectedForCompare((prev) => prev.filter((a) => a.attemptId !== attempt.attemptId));
    } else {
      if (selectedForCompare.length >= 2) {
        // replace second
        setSelectedForCompare([selectedForCompare[0], attempt]);
      } else {
        setSelectedForCompare((prev) => [...prev, attempt]);
      }
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'PASSED') return item.isPassed;
    if (filter === 'FAILED') return !item.isPassed;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Attempt Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Attempt History & Comparison
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your exam results over time and compare attempts to measure score and speed gains.
          </p>
        </div>

        {/* Compare Trigger Button */}
        {selectedForCompare.length === 2 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
          >
            <Scale className="w-4 h-4" />
            <span>Compare 2 Selected Attempts</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Records ({history.length})
        </button>
        <button
          onClick={() => setFilter('PASSED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'PASSED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Passed Attempts
        </button>
        <button
          onClick={() => setFilter('FAILED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'FAILED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Failed Attempts
        </button>
      </div>

      {/* History Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No attempts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try choosing a different filter, or launch a new quiz from the catalog.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Compare</th>
                  <th className="py-3.5 px-4">Quiz Title</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Accuracy</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Time Spent</th>
                  <th className="py-3.5 px-4">Certificate</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredHistory.map((item) => {
                  const isChecked = selectedForCompare.some((a) => a.attemptId === item.attemptId);
                  return (
                    <tr
                      key={item.attemptId}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors ${
                        isChecked ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCompare(item)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          title="Select to compare"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.quizTitle}
                        </span>
                        <span className="text-xs text-slate-400">
                          {item.categoryName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {item.scoreObtained} / {item.totalMarks}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                        {item.percentage}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          item.isPassed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {item.isPassed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {Math.floor((item.totalTimeSeconds || 0) / 60)}m {(item.totalTimeSeconds || 0) % 60}s
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {item.certificateCode ? (
                          <Link
                            to={`/verify/${item.certificateCode}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                            title="Verify digital certificate"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>{item.certificateCode}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          to={`/result/${item.attemptId}`}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 inline-block"
                        >
                          Result
                        </Link>
                        <Link
                          to={`/review/${item.attemptId}`}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 inline-block"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attempt Comparison Modal */}
      {selectedForCompare.length === 2 && (
        <Modal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          title="Attempt Comparison Analysis"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              {selectedForCompare.map((att, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                    Attempt #{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {att.quizTitle}
                  </h4>
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {att.percentage}%
                  </div>
                  <div className="text-xs text-slate-500">
                    Score: {att.scoreObtained} / {att.totalMarks}
                  </div>
                  <div className="text-xs text-slate-500">
                    Time: {Math.floor(att.totalTimeSeconds / 60)}m {att.totalTimeSeconds % 60}s
                  </div>
                  <div className="pt-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      att.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {att.isPassed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Delta calculation */}
            {(() => {
              const diffScore = (selectedForCompare[1].percentage - selectedForCompare[0].percentage).toFixed(1);
              const diffTime = selectedForCompare[1].totalTimeSeconds - selectedForCompare[0].totalTimeSeconds;
              return (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 space-y-2">
                  <h5 className="font-bold flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span>Progress Difference Summary:</span>
                  </h5>
                  <p>
                    • Score Delta:{' '}
                    <strong className={Number(diffScore) >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {Number(diffScore) >= 0 ? `+${diffScore}%` : `${diffScore}%`}
                    </strong>
                  </p>
                  <p>
                    • Time Delta:{' '}
                    <strong>
                      {diffTime < 0 ? `${Math.abs(diffTime)}s faster` : `${diffTime}s longer`}
                    </strong>
                  </p>
                </div>
              );
            })()}

            <div className="flex justify-end">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
