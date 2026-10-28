import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (data) => apiClient.post('/auth/register', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  getMe: () => apiClient.get('/auth/me'),
};

export const userApi = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  changePassword: (data) => apiClient.post('/users/change-password', data),
};

export const quizApi = {
  getQuizzes: (params) => apiClient.get('/quizzes', { params }),
  getQuizBySlug: (slug) => apiClient.get(`/quizzes/${slug}`),
  getQuizById: (id) => apiClient.get(`/quizzes/id/${id}`),
  getCategories: () => apiClient.get('/categories'),
};

export const attemptApi = {
  startAttempt: (quizId) => apiClient.post(`/attempts/start/${quizId}`),
  saveAnswer: (attemptId, data) => apiClient.post(`/attempts/${attemptId}/answer`, data),
  recordViolation: (attemptId, data) => apiClient.post(`/attempts/${attemptId}/violation`, data),
  submitAttempt: (attemptId, data) => apiClient.post(`/attempts/${attemptId}/submit`, data),
  getResult: (attemptId) => apiClient.get(`/attempts/${attemptId}/result`),
  getReview: (attemptId) => apiClient.get(`/attempts/${attemptId}/review`),
  getHistory: (params) => apiClient.get('/attempts/history', { params }),
  verifyCertificate: (code) => apiClient.get(`/attempts/verify/${code}`),
};

export const leaderboardApi = {
  getGlobal: (limit = 20) => apiClient.get('/leaderboard', { params: { limit } }),
  getQuizLeaderboard: (quizId, limit = 10) => apiClient.get(`/leaderboard/quiz/${quizId}`, { params: { limit } }),
  getScoped: (period = 'weekly', limit = 20) => apiClient.get('/leaderboard/scoped', { params: { period, limit } }),
};

export const analyticsApi = {
  getDashboardAnalytics: () => apiClient.get('/analytics/dashboard'),
};

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getQuizReports: () => apiClient.get('/admin/reports/quizzes'),
  exportCsvUrl: () => `${apiClient.defaults.baseURL}/admin/reports/export-csv`,
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserStatus: (userId, data) => apiClient.patch(`/admin/users/${userId}/status`, data),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  createQuiz: (data) => apiClient.post('/admin/quizzes', data),
  updateQuiz: (id, data) => apiClient.put(`/admin/quizzes/${id}`, data),
  deleteQuiz: (id) => apiClient.delete(`/admin/quizzes/${id}`),
  togglePublish: (id) => apiClient.patch(`/admin/quizzes/${id}/publish`),
  getQuestions: (quizId) => apiClient.get(`/admin/quizzes/${quizId}/questions`),
  createQuestion: (quizId, data) => apiClient.post(`/admin/quizzes/${quizId}/questions`, data),
  updateQuestion: (id, data) => apiClient.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => apiClient.delete(`/admin/questions/${id}`),
  importQuestions: (quizId, formData) => apiClient.post(`/admin/quizzes/${quizId}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
