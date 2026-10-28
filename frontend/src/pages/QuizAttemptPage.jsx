import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptApi } from '../api';
import CountdownTimer from '../components/quiz/CountdownTimer';
import QuestionNavigator from '../components/quiz/QuestionNavigator';
import AntiCheatModal from '../components/quiz/AntiCheatModal';
import Modal from '../components/common/Modal';
import { 
  Bookmark, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Square,
  CheckCircle2,
  Circle
} from 'lucide-react';

export default function QuizAttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attemptData, setAttemptData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('synced'); // 'synced' | 'saving'
  const [violations, setViolations] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeSpentOnQuestion, setTimeSpentOnQuestion] = useState(0);

  const attemptIdRef = useRef(null);
  const maxViolationsRef = useRef(3);

  // Initialize attempt
  useEffect(() => {
    const initAttempt = async () => {
      try {
        const res = await attemptApi.startAttempt(id);
        const data = res.data;
        setAttemptData(data);
        attemptIdRef.current = data.attemptId;
        maxViolationsRef.current = data.maxViolationsAllowed || 3;
        setViolations(data.currentViolations || 0);

        if (data.savedAnswers) {
          setSavedAnswers(data.savedAnswers);
        }
      } catch (err) {
        console.error("Failed to start attempt:", err);
        alert(err.response?.data?.message || "Could not start quiz attempt.");
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    initAttempt();
  }, [id, navigate]);

  // Anti-Cheat: Tab switch & Window blur detection
  const handleViolation = useCallback(async (type) => {
    if (!attemptIdRef.current || submitting) return;

    try {
      await attemptApi.recordViolation(attemptIdRef.current, {
        violationType: type,
        details: `Detected focus loss / tab switch via ${type}`,
      });
      setViolations((prev) => {
        const next = prev + 1;
        if (next >= maxViolationsRef.current) {
          alert("Maximum anti-cheat strikes exceeded! Your assessment has been auto-submitted.");
          navigate(`/result/${attemptIdRef.current}`);
        } else {
          setShowViolationModal(true);
        }
        return next;
      });
    } catch (err) {
      console.warn("Violation error:", err);
    }
  }, [submitting, navigate]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('TAB_SWITCH');
      }
    };

    const onBlur = () => {
      handleViolation('WINDOW_BLUR');
    };

    const preventContext = (e) => e.preventDefault();
    const preventCopy = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
    };
  }, [handleViolation]);

  // Question Timer Tracker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpentOnQuestion((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const questions = attemptData?.questions || [];
  const currentQuestion = questions[currentIndex];

  // Auto-Save answer to backend
  const triggerAutoSave = async (questionId, newSelectedIds, isMarked) => {
    setSaveStatus('saving');
    try {
      await attemptApi.saveAnswer(attemptData.attemptId, {
        questionId,
        selectedOptionIds: newSelectedIds,
        isMarkedForReview: isMarked,
        timeSpentSeconds: timeSpentOnQuestion,
      });
      setSaveStatus('synced');
    } catch (err) {
      console.error("Auto-save failed:", err);
      setSaveStatus('synced');
    }
  };

  // Option selection
  const handleSelectOption = (optionId) => {
    if (!currentQuestion) return;

    const currentAnswer = savedAnswers[currentQuestion.id] || {
      selectedOptionIds: [],
      isMarkedForReview: false,
    };

    let newSelectedIds;
    if (currentQuestion.questionType === 'MULTI') {
      // Toggle in list
      const exists = currentAnswer.selectedOptionIds.includes(optionId);
      newSelectedIds = exists
        ? currentAnswer.selectedOptionIds.filter((oid) => oid !== optionId)
        : [...currentAnswer.selectedOptionIds, optionId];
    } else {
      // Single choice
      newSelectedIds = [optionId];
    }

    const updated = {
      ...currentAnswer,
      questionId: currentQuestion.id,
      selectedOptionIds: newSelectedIds,
    };

    setSavedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updated,
    }));

    triggerAutoSave(currentQuestion.id, newSelectedIds, currentAnswer.isMarkedForReview);
  };

  // Mark for review toggle
  const toggleMarkForReview = () => {
    if (!currentQuestion) return;

    const currentAnswer = savedAnswers[currentQuestion.id] || {
      selectedOptionIds: [],
      isMarkedForReview: false,
    };

    const newMarkedState = !currentAnswer.isMarkedForReview;
    const updated = {
      ...currentAnswer,
      questionId: currentQuestion.id,
      isMarkedForReview: newMarkedState,
    };

    setSavedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updated,
    }));

    triggerAutoSave(currentQuestion.id, currentAnswer.selectedOptionIds, newMarkedState);
  };

  // Clear answer
  const clearSelection = () => {
    if (!currentQuestion) return;

    const currentAnswer = savedAnswers[currentQuestion.id] || {
      selectedOptionIds: [],
      isMarkedForReview: false,
    };

    const updated = {
      ...currentAnswer,
      questionId: currentQuestion.id,
      selectedOptionIds: [],
    };

    setSavedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updated,
    }));

    triggerAutoSave(currentQuestion.id, [], currentAnswer.isMarkedForReview);
  };

  // Final submit
  const handleSubmitAttempt = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowSubmitConfirm(false);

    try {
      const res = await attemptApi.submitAttempt(attemptData.attemptId);
      navigate(`/result/${attemptData.attemptId}`, { replace: true });
    } catch (err) {
      console.error("Submission failed:", err);
      alert(err.response?.data?.message || "Failed to submit attempt.");
      setSubmitting(false);
    }
  };

  if (loading || !attemptData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Preparing assessment environment...</p>
        </div>
      </div>
    );
  }

  const currentAnswer = currentQuestion ? savedAnswers[currentQuestion.id] : null;
  const selectedOptionIds = currentAnswer?.selectedOptionIds || [];
  const isMarked = currentAnswer?.isMarkedForReview || false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 no-select pb-20">
      
      {/* 1. Sticky Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Title & Domain */}
          <div className="flex items-center gap-3 truncate">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {attemptData.categoryName}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {attemptData.quizTitle}
              </h2>
            </div>
          </div>

          {/* Center: Auto-Save Status & Anti-cheat strikes */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {saveStatus === 'saving' ? (
                <span className="flex items-center gap-1 text-amber-500 animate-pulse font-medium">
                  Saving answer...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" /> Progress Synced
                </span>
              )}
            </div>

            {violations > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Violations: {violations}/{maxViolationsRef.current}</span>
              </div>
            )}
          </div>

          {/* Right: Countdown Timer & Submit Button */}
          <div className="flex items-center gap-3 shrink-0">
            <CountdownTimer
              initialSeconds={attemptData.remainingSeconds || attemptData.durationMinutes * 60}
              onExpire={handleSubmitAttempt}
            />

            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Question Viewport (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
              
              {/* Question Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                    {currentQuestion?.marks || 1} mark{currentQuestion?.marks > 1 ? 's' : ''}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    currentQuestion?.questionType === 'MULTI'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  }`}>
                    {currentQuestion?.questionType === 'MULTI' ? 'Multi-Select' : 'Single Select'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMarkForReview}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isMarked
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isMarked ? 'fill-white' : ''}`} />
                    <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  {selectedOptionIds.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-xs text-rose-500 hover:underline px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQuestion?.questionText}
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQuestion?.options.map((opt, optIdx) => {
                  const isSelected = selectedOptionIds.includes(opt.id);
                  const isMulti = currentQuestion.questionType === 'MULTI';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`group flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 dark:border-indigo-500 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {/* Checkbox / Radio Icon */}
                      <div className="pt-0.5 shrink-0">
                        {isMulti ? (
                          isSelected ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 group-hover:text-slate-500" />
                          )
                        ) : (
                          isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 group-hover:text-slate-500" />
                          )
                        )}
                      </div>

                      {/* Option Text */}
                      <div className="flex-1 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-normal">
                        <span className="font-bold text-slate-400 mr-2">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt.optionText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Exam</span>
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Right Sidebar: Question Navigator (1 Col) */}
          <div className="lg:col-span-1">
            <QuestionNavigator
              questions={questions}
              currentIndex={currentIndex}
              onSelectQuestion={setCurrentIndex}
              savedAnswers={savedAnswers}
            />
          </div>

        </div>
      </main>

      {/* Anti-Cheat Warning Modal */}
      <AntiCheatModal
        isOpen={showViolationModal}
        onClose={() => setShowViolationModal(false)}
        violationCount={violations}
        maxViolations={maxViolationsRef.current}
      />

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        title="Confirm Exam Submission"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to finalize and submit your assessment? Once submitted, your answers will be evaluated immediately.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <strong className="text-slate-900 dark:text-white">{questions.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Answered:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {Object.values(savedAnswers).filter(a => a.selectedOptionIds && a.selectedOptionIds.length > 0).length}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Marked for Review:</span>
              <strong className="text-amber-500">
                {Object.values(savedAnswers).filter(a => a.isMarkedForReview).length}
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setShowSubmitConfirm(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Keep Answering
            </button>
            <button
              onClick={handleSubmitAttempt}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Yes, Submit Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
