import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attemptApi } from '../api';
import { Award, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, Calendar, Trophy } from 'lucide-react';

export default function CertificateVerifyPage() {
  const { code } = useParams();
  const [certCode, setCertCode] = useState(code || '');
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify.trim()) return;
    setLoading(true);
    setError('');
    setCertData(null);

    try {
      const res = await attemptApi.verifyCertificate(codeToVerify.trim());
      setCertData(res.data);
    } catch (err) {
      setError("No valid authenticated certificate was found matching this code.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      verifyCode(code);
    }
  }, [code]);

  const handleSearch = (e) => {
    e.preventDefault();
    verifyCode(certCode);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-md">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Digital Certificate Verification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Verify the authenticity of a QuizTrack assessment credential directly against server records.
        </p>
      </div>

      {/* Code Input Form */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <input
          type="text"
          value={certCode}
          onChange={(e) => setCertCode(e.target.value)}
          placeholder="e.g. QT-CERT-ALICE-1001"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all shrink-0 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm max-w-xl mx-auto flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Verified Certificate Card */}
      {certData && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 border-emerald-400 shadow-xl max-w-xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Credential</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              {certData.certificateCode}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
              {certData.categoryName}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {certData.quizTitle}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
            <div>
              <span className="text-xs text-slate-400">Final Score:</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {certData.percentage}%
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400">Status:</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {certData.isPassed ? 'PASSED' : 'FAILED'}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Completion: {new Date(certData.completedAt).toLocaleDateString()}</span>
            </span>
            <span>QuizTrack Authority Verified</span>
          </div>
        </div>
      )}

      <div className="text-center">
        <Link to="/quizzes" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
          Return to Quiz Library
        </Link>
      </div>

    </div>
  );
}
