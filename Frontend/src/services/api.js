import axios from 'axios';

const DEFAULT_API_BASE_URL = 'https://backende-su97.onrender.com';

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.replace(/\/+$/, '');
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL);
const API_PREFIX = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';
const UPLOADS_PREFIX = API_BASE_URL || '';

const API = axios.create({
  baseURL: API_PREFIX
});

const getApiOrigin = () => {
  const baseURL = API.defaults.baseURL || '';

  if (/^https?:\/\//i.test(baseURL)) {
    try {
      return new URL(baseURL).origin;
    } catch (error) {
      return '';
    }
  }

  if (typeof window === 'undefined') return '';
  return API_BASE_URL || window.location.origin;
};

export const resolveMediaUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  if (/^(data:|blob:)/i.test(value)) return value;

  try {
    return new URL(value, UPLOADS_PREFIX || getApiOrigin() || window.location.origin).toString();
  } catch (error) {
    return value;
  }
};

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_PREFIX}${normalizedPath}`;
};

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  registerInit: (data) => API.post('/auth/register-init', data),
  verifyEmail: (data) => API.post('/auth/verify-email', data),
  checkApproval: (identifier) => API.get(`/auth/check-approval/${identifier}`),
  stats: () => API.get('/auth/stats')
};

export const adminAPI = {
  getUsers: (params) => API.get('/admin/users', { params }),
  approveUser: (id) => API.post(`/admin/users/${id}/approve`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getStats: () => API.get('/admin/dashboard-stats'),
  getExams: (params) => API.get('/admin/exams', { params }),
  getExam: (id) => API.get(`/admin/exams/${id}`),
  createExam: (data) => API.post('/admin/exams', data),
  updateExam: (id, data) => API.put(`/admin/exams/${id}`, data),
  deleteExam: (id) => API.delete(`/admin/exams/${id}`),
  submitExam: (data) => API.post("/admin/exams/submit", data),
getExamResults: () => API.get("/admin/exams/results"),
getExamById: (id) => API.get(`/admin/exams/${id}`),
  // ===== Courses Management =====
  getCourses: () => API.get('/admin/courses'),
  addCourse: (courseData) => API.post('/admin/courses', courseData),
  updateCourse: (courseId, courseData) => API.put(`/admin/courses/${courseId}`, courseData),
  deleteCourse: (courseId) => API.delete(`/admin/courses/${courseId}`),

  // ===== Chapters Management =====
  getChapters: (courseId) => API.get(`/admin/courses/${courseId}/chapters`),
  addChapter: (courseId, chapterData) => API.post(`/admin/courses/${courseId}/chapters`, chapterData),
  // ✅ FIXED: Added /courses/ to match backend route
  updateChapter: (chapterId, chapterData) => API.put(`/admin/courses/chapters/${chapterId}`, chapterData),
  deleteChapter: (chapterId) => API.delete(`/admin/courses/chapters/${chapterId}`),

  // Optional file upload for a chapter
  uploadChapterFiles: (chapterId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    // ✅ FIXED: Added /courses/ to match backend route
    return API.post(`/admin/courses/chapters/${chapterId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteChapterFile: (chapterId, filename) =>
    API.delete(`/admin/courses/chapters/${chapterId}/files/${encodeURIComponent(filename)}`)
};

export const coursesAPI = {
  getVideos: (course) => API.get(`/courses/${course}`)
};

export const studentAPI = {
  getPublishedCourses: () => API.get('/student/courses'),
  getCourseChapters: (courseId) => API.get(`/student/courses/${courseId}/chapters`),
  getPublishedExams: (params) => API.get('/student/exams', { params }),
  getPublishedExamById: (id) => API.get(`/student/exams/${id}`),
  submitExam: (data) => API.post('/student/exams/submit', data),
  submitExamWithFile: ({ examId, answers, score, submissionFile }) => {
    const formData = new FormData();
    formData.append('examId', examId);
    formData.append('answers', JSON.stringify(answers || {}));
    formData.append('score', String(score || 0));
    if (submissionFile) {
      formData.append('submissionFile', submissionFile);
    }
    return API.post('/student/exams/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const contactAPI = {
  submit: (data) => API.post('/contact', data)
};

export default API;
