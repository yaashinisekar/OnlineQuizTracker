import React, { useState, useEffect } from 'react';
import { adminApi, quizApi } from '../api';
import Modal from '../components/common/Modal';
import { CardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton';
import { 
  Shield, 
  Users, 
  Compass, 
  Award, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  FileSpreadsheet, 
  CheckCircle2,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
  HelpCircle
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'quizzes' | 'import' | 'users' | 'reports'
  const [dashboardData, setDashboardData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Quiz Form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    categoryId: 1,
    description: '',
    difficulty: 'MEDIUM',
    durationMinutes: 15,
    passPercentage: 60.0,
    negativeMarking: false,
    negativeMarkingDeduction: 0.25,
    perQuestionTimerSeconds: 0,
    isPublished: true,
    maxViolationsAllowed: 3,
    tagNames: 'React, Fullstack',
  });

  // Question Form state
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'SINGLE',
    marks: 1.0,
    explanation: '',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  });

  // Bulk Import state
  const [selectedImportQuizId, setSelectedImportQuizId] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

  // Initial fetch
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, quizRes, catRes, usersRes, reportsRes] = await Promise.all([
        adminApi.getDashboard(),
        quizApi.getQuizzes({ size: 100 }),
        quizApi.getCategories(),
        adminApi.getUsers({ size: 50 }),
        adminApi.getQuizReports(),
      ]);

      setDashboardData(dashRes.data);
      setQuizzes(quizRes.data.content || []);
      setCategories(catRes.data || []);
      setUsers(usersRes.data.content || []);
      setReports(reportsRes.data || []);
      if (quizRes.data.content?.length > 0) {
        setSelectedImportQuizId(quizRes.data.content[0].id);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Toggle publish quiz
  const handleTogglePublish = async (quizId) => {
    try {
      await adminApi.togglePublish(quizId);
      fetchAdminData();
    } catch (err) {
      alert("Failed to toggle publish status.");
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz and all its questions?")) return;
    try {
      await adminApi.deleteQuiz(quizId);
      fetchAdminData();
    } catch (err) {
      alert("Failed to delete quiz.");
    }
  };

  // Save Quiz (Create or Update)
  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...quizForm,
        categoryId: Number(quizForm.categoryId),
        durationMinutes: Number(quizForm.durationMinutes),
        passPercentage: Number(quizForm.passPercentage),
        negativeMarkingDeduction: Number(quizForm.negativeMarkingDeduction),
        maxViolationsAllowed: Number(quizForm.maxViolationsAllowed),
        tagNames: quizForm.tagNames.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (selectedQuiz) {
        await adminApi.updateQuiz(selectedQuiz.id, payload);
      } else {
        await adminApi.createQuiz(payload);
      }

      setShowQuizModal(false);
      setSelectedQuiz(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save quiz.");
    }
  };

  // Open Question Manager
  const handleOpenQuestions = async (quiz) => {
    setSelectedQuiz(quiz);
    try {
      const res = await adminApi.getQuestions(quiz.id);
      setQuizQuestions(res.data || []);
      setShowQuestionModal(true);
    } catch (err) {
      alert("Failed to load quiz questions.");
    }
  };

  // Save Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    try {
      await adminApi.createQuestion(selectedQuiz.id, {
        questionText: questionForm.questionText,
        questionType: questionForm.questionType,
        marks: Number(questionForm.marks),
        explanation: questionForm.explanation,
        options: questionForm.options,
      });

      // Refresh question list
      const res = await adminApi.getQuestions(selectedQuiz.id);
      setQuizQuestions(res.data || []);

      // Reset question form
      setQuestionForm({
        questionText: '',
        questionType: 'SINGLE',
        marks: 1.0,
        explanation: '',
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add question.");
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await adminApi.deleteQuestion(questionId);
      const res = await adminApi.getQuestions(selectedQuiz.id);
      setQuizQuestions(res.data || []);
      fetchAdminData();
    } catch (err) {
      alert("Failed to delete question.");
    }
  };

  // Bulk Import
  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!importFile || !selectedImportQuizId) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await adminApi.importQuestions(selectedImportQuizId, formData);
      setImportResult(res.data);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Bulk import failed.");
    } finally {
      setImporting(false);
    }
  };

  // User status update
  const handleToggleUserBlock = async (user) => {
    try {
      await adminApi.updateUserStatus(user.id, { isBlocked: !user.isBlocked });
      const usersRes = await adminApi.getUsers({ size: 50 });
      setUsers(usersRes.data.content || []);
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this candidate account?")) return;
    try {
      await adminApi.deleteUser(userId);
      const usersRes = await adminApi.getUsers({ size: 50 });
      setUsers(usersRes.data.content || []);
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Master Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            QuizTrack Control Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage quizzes, questions, batch CSV imports, candidate moderation, and platform reports.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold overflow-x-auto self-start sm:self-center shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'quizzes'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Quizzes & Questions
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'import'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Bulk Import
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'users'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'reports'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Reports & CSV
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW METRICS                                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{dashboardData?.totalUsers || 0}</h3>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quizzes Published</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {dashboardData?.publishedQuizzes || 0} / {dashboardData?.totalQuizzes || 0}
                </h3>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Attempts</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{dashboardData?.totalAttempts || 0}</h3>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Avg</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{dashboardData?.averagePlatformScore || 0}%</h3>
              </div>
            </div>
          </div>

          {/* Most Missed Questions Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Most Challenging / Missed Questions Across Platform
            </h3>
            <div className="space-y-3">
              {dashboardData?.mostMissedQuestions?.map((q) => (
                <div key={q.questionId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      {q.quizTitle}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {q.questionText}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-1 rounded-md">
                      {q.wrongPercentage}% Failed ({q.timesWrong}/{q.timesAttempted})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: QUIZZES & QUESTIONS CRUD                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quiz Catalog Management
            </h2>
            <button
              onClick={() => {
                setSelectedQuiz(null);
                setQuizForm({
                  title: '',
                  categoryId: categories[0]?.id || 1,
                  description: '',
                  difficulty: 'MEDIUM',
                  durationMinutes: 15,
                  passPercentage: 60.0,
                  negativeMarking: false,
                  negativeMarkingDeduction: 0.25,
                  perQuestionTimerSeconds: 0,
                  isPublished: true,
                  maxViolationsAllowed: 3,
                  tagNames: '',
                });
                setShowQuizModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Pass %</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {quizzes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {q.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {q.categoryName}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {q.difficulty}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {q.durationMinutes}m
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {q.passPercentage}%
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePublish(q.id)}
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            q.isPublished
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {q.isPublished ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{q.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenQuestions(q)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                          title="Manage Questions"
                        >
                          Questions ({q.questionCount || 0})
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuiz(q);
                            setQuizForm({
                              title: q.title,
                              categoryId: q.categoryId,
                              description: q.description || '',
                              difficulty: q.difficulty,
                              durationMinutes: q.durationMinutes,
                              passPercentage: q.passPercentage,
                              negativeMarking: q.negativeMarking || false,
                              negativeMarkingDeduction: q.negativeMarkingDeduction || 0.25,
                              perQuestionTimerSeconds: q.perQuestionTimerSeconds || 0,
                              isPublished: q.isPublished,
                              maxViolationsAllowed: 3,
                              tagNames: q.tags?.join(', ') || '',
                            });
                            setShowQuizModal(true);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                          title="Edit Quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(q.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: BULK IMPORT QUESTIONS                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'import' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              <span>Bulk Question Import (CSV / Excel)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload multiple questions with 4 choices and explanations directly to a selected quiz.
            </p>
          </div>

          <form onSubmit={handleBulkImport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Quiz
              </label>
              <select
                value={selectedImportQuizId}
                onChange={(e) => setSelectedImportQuizId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.categoryName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Upload File (.csv or .xlsx)
              </label>
              <input
                type="file"
                required
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="w-full px-3 py-2 border rounded-xl text-sm border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={importing || !importFile}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {importing ? (
                <span>Parsing & Importing Questions...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Execute Bulk Import</span>
                </>
              )}
            </button>
          </form>

          {/* Import Result Feedback */}
          {importResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <h5 className="font-bold flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Import Operation Completed</span>
              </h5>
              <p>• Total Rows Processed: <strong>{importResult.totalRowsProcessed}</strong></p>
              <p>• Successfully Imported: <strong>{importResult.totalImported} questions</strong></p>
              {importResult.failedCount > 0 && (
                <p className="text-rose-600">• Failed Rows: {importResult.failedCount}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: USERS MODERATION                                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            User Accounts & Moderation
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Roles</th>
                    <th className="py-3.5 px-4">Level & XP</th>
                    <th className="py-3.5 px-4">Attempts</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {u.fullName}
                        </span>
                        <span className="text-xs text-slate-400">{u.email}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {u.roles?.join(', ')}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold">
                        Lvl {u.currentLevel} • {u.xpPoints} XP
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {u.attemptsCount || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          u.isBlocked
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserBlock(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            u.isBlocked
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block User'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          title="Delete user account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: REPORTS & CSV EXPORT                                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Platform Performance Telemetry
              </h2>
              <p className="text-xs text-slate-400">Aggregate statistics per quiz topic</p>
            </div>

            <a
              href={adminApi.exportCsvUrl()}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Telemetry to CSV</span>
            </a>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Quiz Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Total Attempts</th>
                    <th className="py-3.5 px-4">Avg Score</th>
                    <th className="py-3.5 px-4">Pass Rate</th>
                    <th className="py-3.5 px-4">Highest</th>
                    <th className="py-3.5 px-4">Lowest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {reports.map((r) => (
                    <tr key={r.quizId} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {r.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-500">
                        {r.categoryName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {r.totalAttempts}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {r.averageScore}%
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {r.passRate}%
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {r.highestScore}%
                      </td>
                      <td className="py-3.5 px-4 text-xs text-rose-500">
                        {r.lowestScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT QUIZ                                      */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        title={selectedQuiz ? 'Edit Quiz Configuration' : 'Create New Assessment Quiz'}
      >
        <form onSubmit={handleSaveQuiz} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              required
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={quizForm.categoryId}
                onChange={(e) => setQuizForm({ ...quizForm, categoryId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={quizForm.difficulty}
                onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                required
                value={quizForm.durationMinutes}
                onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Pass Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={quizForm.passPercentage}
                onChange={(e) => setQuizForm({ ...quizForm, passPercentage: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={quizForm.negativeMarking}
                onChange={(e) => setQuizForm({ ...quizForm, negativeMarking: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Enable Negative Marking (-0.25)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={quizForm.isPublished}
                onChange={(e) => setQuizForm({ ...quizForm, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Publish Immediately</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowQuizModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
              Save Quiz
            </button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: QUESTIONS MANAGER                                       */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title={`Questions: ${selectedQuiz?.title || ''}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          
          {/* List of current questions */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {quizQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No questions authored yet.</p>
            ) : (
              quizQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-start gap-3">
                  <div>
                    <span className="font-bold text-indigo-500">#{idx + 1}.</span> {q.questionText}
                    <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                      <span>{q.marks} Mark</span> • <span>{q.questionType}</span> • <span>{q.options?.length} Options</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Question Form */}
          <form onSubmit={handleSaveQuestion} className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Add New Question
            </h4>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  required
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder="e.g. What is the complexity of Binary Search?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Type
                </label>
                <select
                  value={questionForm.questionType}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
                  className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                >
                  <option value="SINGLE">Single Choice</option>
                  <option value="MULTI">Multi Select</option>
                </select>
              </div>
            </div>

            {/* 4 Options */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                Options & Correct Answer Checkbox
              </label>
              {questionForm.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={opt.isCorrect}
                    onChange={(e) => {
                      const updated = [...questionForm.options];
                      updated[oIdx].isCorrect = e.target.checked;
                      setQuestionForm({ ...questionForm, options: updated });
                    }}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                    title="Mark as correct choice"
                  />
                  <input
                    type="text"
                    required
                    value={opt.optionText}
                    onChange={(e) => {
                      const updated = [...questionForm.options];
                      updated[oIdx].optionText = e.target.value;
                      setQuestionForm({ ...questionForm, options: updated });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Explanation
              </label>
              <textarea
                rows={2}
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                placeholder="Explain why the marked answer is correct..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                Add Question
              </button>
            </div>
          </form>

        </div>
      </Modal>

    </div>
  );
}
