import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptApi } from '../api';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Award, 
  Download, 
  RotateCcw, 
  FileText, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function ResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await attemptApi.getResult(attemptId);
        setResult(res.data);

        // Confetti burst if passed!
        if (res.data.isPassed) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
          });
        }
      } catch (err) {
        console.error("Failed to load attempt result:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  // Generate and download verified certificate PDF
  const downloadCertificatePdf = () => {
    if (!result || !result.isPassed) return;
    setDownloadingCert(true);

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Certificate Background & Borders
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, width, height, 'F');

      // Outer Gold / Navy Border
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(4);
      doc.rect(10, 10, width - 20, height - 20);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(1);
      doc.rect(14, 14, width - 28, height - 28);

      // Header Brand
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(26);
      doc.text('CERTIFICATE OF ACHIEVEMENT', width / 2, 45, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(13);
      doc.text('THIS IS PROUDLY PRESENTED TO', width / 2, 58, { align: 'center' });

      // User Line
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(28);
      doc.text('HONORED CANDIDATE', width / 2, 75, { align: 'center' });

      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.5);
      doc.line(width / 2 - 60, 80, width / 2 + 60, 80);

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(13);
      doc.text(`for successfully demonstrating mastery and passing the rigorous exam`, width / 2, 95, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(18);
      doc.text(`"${result.quizTitle}"`, width / 2, 108, { align: 'center' });

      // Score pill in certificate
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(14);
      doc.text(`Final Score: ${result.percentage}% (${result.scoreObtained} / ${result.totalMarks} Marks)`, width / 2, 122, { align: 'center' });

      // Verification Code & Footer Seal
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(10);
      doc.text(`Certificate Code: ${result.certificateCode || 'QT-CERT-VERIFIED'}`, 25, height - 25);
      doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 25, height - 20);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text('QuizTrack Verification Authority', width - 25, height - 25, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text('Authorized Digital Credential', width - 25, height - 20, { align: 'right' });

      doc.save(`QuizTrack_Certificate_${result.certificateCode || 'Diploma'}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setDownloadingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Evaluating answers with server precision...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p>Result not available.</p>
        <Link to="/quizzes" className="text-indigo-600 underline">Browse Quizzes</Link>
      </div>
    );
  }

  const isPassed = result.isPassed;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* 1. Main Score Card */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-6">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
          {isPassed ? (
            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assessment Passed</span>
            </span>
          ) : (
            <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Passing Score Not Met</span>
            </span>
          )}
        </div>

        {/* Quiz Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white max-w-xl mx-auto">
          {result.quizTitle}
        </h1>

        {/* Big Circular Score Display */}
        <div className="my-6">
          <div className="inline-flex flex-col items-center justify-center w-36 h-36 rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-indigo-600/30 shadow-inner">
            <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {result.percentage}%
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-0.5">
              {result.scoreObtained} / {result.totalMarks} Marks
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Target Pass Mark: <strong className="text-slate-800 dark:text-slate-200">{result.passPercentage}%</strong>
          </p>
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Correct</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">
              {result.correctCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Wrong</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-extrabold text-rose-800 dark:text-rose-200 mt-1">
              {result.wrongCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Skipped</span>
              <MinusCircle className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">
              {result.skippedCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Time Taken</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-extrabold text-indigo-800 dark:text-indigo-200 mt-1">
              {Math.floor(result.totalTimeSeconds / 60)}m {result.totalTimeSeconds % 60}s
            </div>
          </div>
        </div>

        {/* XP Award Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>Experience Points Gained</span>
          </div>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
            +{result.xpAwarded} XP
          </span>
        </div>

        {/* Newly Unlocked Badges */}
        {result.newlyEarnedBadges && result.newlyEarnedBadges.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 max-w-2xl mx-auto space-y-1">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" />
              <span>New Badges Unlocked!</span>
            </span>
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              {result.newlyEarnedBadges.map((badgeName, idx) => (
                <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 shadow-sm border border-amber-300 dark:border-amber-700">
                  {badgeName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <Link
            to={`/review/${result.attemptId}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Review Answers</span>
          </Link>

          {isPassed && (
            <button
              onClick={downloadCertificatePdf}
              disabled={downloadingCert}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingCert ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
            </button>
          )}

          <Link
            to={`/quizzes/id/${result.quizId}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
