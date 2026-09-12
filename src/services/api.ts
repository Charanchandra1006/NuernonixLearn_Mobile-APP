import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Base URL ─────────────────────────────────────────────────────────────────
// In development use the local backend, in production use env variable
const BASE_URL = 'https://nueronixlearn-bn.vercel.app/api';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // 120s — AI calls can take time
});

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 + silent refresh ───────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(undefined));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest)).catch(e => Promise.reject(e));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { timeout: 15000 });
          const newToken = res.data.token;
          await AsyncStorage.setItem('token', newToken);
          processQueue(null);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          await AsyncStorage.multiRemove(['token', 'adminToken']);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        await AsyncStorage.multiRemove(['token', 'adminToken']);
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: {
    name: string; email: string; password: string;
    role?: string; phone?: string;
    learningPace?: 'slow' | 'moderate' | 'fast';
    experienceLevel?: 'beginner' | 'intermediate' | 'professional';
    subjects?: string[];
  }) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updateAvatar: (avatar: string) => api.put('/auth/avatar', { avatar }),
  completeOnboarding: (data: any) => api.put('/auth/complete-onboarding', data),
  sendOTP: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOTPRegister: (data: { email: string; otp: string; name: string; password: string; role: string; phone?: string }) =>
    api.post('/auth/verify-otp-register', data),
  sendLoginOTP: (email: string) => api.post('/auth/send-login-otp', { email }),
  verifyOTPLogin: (email: string, otp: string) => api.post('/auth/verify-otp-login', { email, otp }),
  updatePhone: (phone: string) => api.put('/auth/phone', { phone }),
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const coursesAPI = {
  getAll: (params?: { category?: string; difficulty?: string; search?: string; page?: number; sort?: string }) =>
    api.get('/courses', { params }),
  getFeatured: () => api.get('/courses/featured'),
  getCategories: () => api.get('/courses/categories'),
  getMyCourses: () => api.get('/courses/my-courses'),
  getTeacherCourses: () => api.get('/courses/teacher'),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
  review: (id: string, data: any) => api.post(`/courses/${id}/review`, data),
};

// ─── Learning ─────────────────────────────────────────────────────────────────
export const learningAPI = {
  getNextModule: (courseId: string) => api.get(`/learn/next/${courseId}`),
  updateProgress: (data: { courseId: string; moduleId: string; completed?: boolean; timeSpent?: number }) =>
    api.post('/learn/progress', data),
  submitAnswer: (data: { courseId: string; assessmentId: string; questionId: string; answer: string }) =>
    api.post('/learn/submit-answer', data),
  getProgress: (courseId: string) => api.get(`/learn/progress/${courseId}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPerformance: () => api.get('/analytics/performance'),
  getCognitiveLoad: () => api.get('/analytics/cognitive-load'),
  getDailyProgress: () => api.get('/analytics/daily-progress'),
};

// ─── ML ───────────────────────────────────────────────────────────────────────
export const mlAPI = {
  getRecommendations: () => api.get('/ml/recommendations'),
  submitFeedback: (data: { feedback: string; type: string; courseId?: string }) =>
    api.post('/ml/feedback', data),
  getIntent: () => api.get('/ml/intent'),
  uploadPDF: (formData: FormData) => api.post('/ml/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCognitiveLoad: (data: { courseId: string; metrics: any }) => api.post('/ml/cognitive-load', data),
};

// ─── AI (Gemini) ──────────────────────────────────────────────────────────────
export const aiAPI = {
  getRecommendation: () => api.get('/ai/recommendation'),
  getProfile: () => api.get('/ai/profile'),
  updateProfile: (data: any) => api.put('/ai/profile', data),
  updateTopicProgress: (data: any) => api.post('/ai/topic-progress', data),
  getLearningTwin: () => api.get('/ai/learning-twin'),
};

// ─── Exams ────────────────────────────────────────────────────────────────────
export const examsAPI = {
  getAll: () => api.get('/exams'),
  getById: (id: string) => api.get(`/exams/${id}`),
  create: (data: any) => api.post('/exams', data),
  update: (id: string, data: any) => api.put(`/exams/${id}`, data),
  publish: (id: string) => api.post(`/exams/${id}/publish`),
  start: (id: string) => api.post(`/exams/${id}/start`),
  submit: (id: string, data: any) => api.post(`/exams/${id}/submit`, data),
  getResults: (id: string) => api.get(`/exams/${id}/results`),
};

// ─── Diary ────────────────────────────────────────────────────────────────────
export const diaryAPI = {
  getEntries: (params?: any) => api.get('/diary/entries', { params }),
  getEntry: (id: string) => api.get(`/diary/entries/${id}`),
  createEntry: (data: any) => api.post('/diary/entries', data),
  updateEntry: (id: string, data: any) => api.put(`/diary/entries/${id}`, data),
  deleteEntry: (id: string) => api.delete(`/diary/entries/${id}`),
  lock: (password: string) => api.post('/diary/lock', { password }),
  unlock: (password: string) => api.post('/diary/unlock', { password }),
  getStatus: () => api.get('/diary/status'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/diary/change-password', { currentPassword, newPassword }),
};

// ─── Chatbot ──────────────────────────────────────────────────────────────────
export const chatbotAPI = {
  getGreeting: () => api.get('/chatbot/greeting'),
  chat: (message: string) => api.post('/chatbot/chat', { message }),
  getSuggestion: () => api.get('/chatbot/suggestion'),
  getContext: () => api.get('/chatbot/context'),
  clearContext: () => api.post('/chatbot/clear-context'),
  getWeakTopics: () => api.get('/chatbot/weak-topics'),
  addWeakTopic: (topic: string, subject: string) => api.post('/chatbot/add-weak-topic', { topic, subject }),
  updateWeakTopic: (id: string, completed: boolean) => api.put(`/chatbot/weak-topics/${id}`, { completed }),
  deleteWeakTopic: (id: string) => api.delete(`/chatbot/weak-topics/${id}`),
  getWeakTopicVideos: (id: string) => api.get(`/chatbot/weak-topics/${id}/videos`),
  generateTodo: (id: string) => api.post(`/chatbot/weak-topics/${id}/generate-todo`, {}),
  getTodos: () => api.get('/chatbot/todos'),
  completeTodo: (id: string) => api.put(`/chatbot/todos/${id}/complete`, {}),
  getNextVideo: () => api.get('/chatbot/next-video'),
};

// ─── Topics / Study Plan ──────────────────────────────────────────────────────
export const topicsAPI = {
  addSubject: (subject: string) => api.post('/topics/add-subject', { subject }),
  getSubjects: () => api.get('/topics/subjects'),
  getRoadmap: (subject: string) => api.get(`/topics/roadmap/${subject}`),
  completeTopic: (subject: string, topicTitle: string) =>
    api.post('/topics/complete-topic', { subject, topicTitle }),
  completeSubtopic: (subject: string, topicTitle: string, subtopicTitle: string) =>
    api.post('/topics/complete-subtopic', { subject, topicTitle, subtopicTitle }),
  getNextTopic: (subject: string) => api.get(`/topics/next/${subject}`),
  getSubtopics: (subject: string, topicTitle: string) =>
    api.get(`/topics/subtopics/${subject}/${encodeURIComponent(topicTitle)}`),
  getResources: (subject: string, topic: string, type?: string) =>
    api.get(`/topics/resources/${subject}/${topic}`, { params: { type } }),
  getSubtopicResources: (subject: string, topicTitle: string, subtopicTitle: string) =>
    api.get(`/topics/resources/subtopic/${encodeURIComponent(subject)}/${encodeURIComponent(topicTitle)}/${encodeURIComponent(subtopicTitle)}`),
  deleteSubject: (id: string) => api.delete(`/topics/subject/${id}`),
  initializeFromWeakAreas: () => api.post('/topics/initialize-from-weak-areas', {}),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  login: (username: string, password: string) => api.post('/admin/login', { username, password }),
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  blockUser: (id: string, blocked: boolean) => api.put(`/admin/users/${id}/block`, { blocked }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getCourses: (params?: any) => api.get('/admin/courses', { params }),
  updateCourseFeatured: (id: string, featured: boolean) => api.put(`/admin/courses/${id}/featured`, { featured }),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),
  getExams: (params?: any) => api.get('/admin/exams', { params }),
  deleteExam: (id: string) => api.delete(`/admin/exams/${id}`),
  getAnalytics: (days?: number) => api.get('/admin/analytics', { params: { days } }),
};

export default api;
