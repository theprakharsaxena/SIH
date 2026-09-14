import axios from 'axios';

let getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }
  return 'https://mospi-api.duckdns.org';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({ baseURL: API_BASE_URL });

/* ── Inject JWT token on every request & enforce HTTPS for non-localhost ── */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (config.baseURL && config.baseURL.startsWith('http:') && !config.baseURL.includes('localhost') && !config.baseURL.includes('127.0.0.1')) {
      config.baseURL = config.baseURL.replace('http:', 'https:');
    }
    if (config.url && config.url.startsWith('http:') && !config.url.includes('localhost') && !config.url.includes('127.0.0.1')) {
      config.url = config.url.replace('http:', 'https:');
    }
  }
  const token = localStorage.getItem('sip_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Auth ── */
export const loginUser = async (email, password) => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const baseUrl = getBaseUrl();
  const res = await axios.post(`${baseUrl}/auth/login`, form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
};

export const registerUser = async (payload) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateMe = async (payload) => {
  const res = await api.put('/auth/me', payload);
  return res.data;
};

/* ── Roles ── */
export const fetchRoles = async () => {
  const res = await api.get('/competencies/roles');
  return res.data;
};

/* ── Officers ── */
export const fetchOfficers = async () => {
  const res = await api.get('/officers');
  return res.data;
};

export const fetchOfficerDetails = async (officerId) => {
  const res = await api.get(`/officers/${officerId}`);
  return res.data;
};

export const fetchGapAnalysis = async (officerId, payload = null) => {
  if (payload) {
    const res = await api.post(`/officers/${officerId}/gap-analysis`, payload);
    return res.data;
  }
  const res = await api.get(`/officers/${officerId}/gap-analysis`);
  return res.data;
};

export const fetchRecommendations = async (officerId, topN = 10) => {
  const res = await api.get(`/officers/${officerId}/recommendations?top_n=${topN}`);
  return res.data;
};

export const extractProfileLLM = async (profileText, roleCode = 'SSO') => {
  const res = await api.post('/officers/extract-profile', {
    role_code: roleCode,
    profile_text: profileText,
  });
  return res.data;
};

export const getDemoProfileText = async () => {
  const res = await api.get('/officers/demo-profile');
  return res.data;
};

/* ── Assessments ── */
export const uploadMaterialAndGenerateMcqs = async (formData) => {
  const token = localStorage.getItem('sip_token');
  const res = await axios.post(`${API_BASE_URL}/assessments/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
};

export const submitQuizAnswers = async (assessmentId, officerId, answers) => {
  const res = await api.post(`/assessments/${assessmentId}/submit`, {
    officer_id: officerId,
    answers,
  });
  return res.data;
};

export const submitCourseQuiz = async (officerId, competencyCode, scorePercent) => {
  const res = await api.post('/assessments/submit-course-quiz', {
    officer_id: officerId,
    competency_code: competencyCode,
    score_percent: scorePercent,
  });
  return res.data;
};

export const fetchCourseQuiz = async (payload) => {
  const res = await api.post('/assessments/generate-course-quiz', payload);
  return res.data;
};

export const fetchDiagnosticQuiz = async (payload) => {
  const res = await api.post('/officers/generate-diagnostic-quiz', payload);
  return res.data;
};

/* ── Admin ── */
export const fetchWorkforceReadiness = async () => {
  const res = await api.get('/admin/workforce-readiness');
  return res.data;
};

export const fetchWorkforceHeatmap = async () => {
  const res = await api.get('/admin/workforce-heatmap');
  return res.data;
};

export const fetchAdminStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const fetchAdminOfficers = async (skip = 0, limit = 50) => {
  const res = await api.get(`/admin/officers?skip=${skip}&limit=${limit}`);
  return res.data;
};

export const deleteAdminOfficer = async (officerId) => {
  const res = await api.delete(`/admin/officers/${officerId}`);
  return res.data;
};

export const fetchAssessmentResults = async (skip = 0, limit = 50) => {
  const res = await api.get(`/admin/assessment-results?skip=${skip}&limit=${limit}`);
  return res.data;
};

export const fetchFutureReadinessSignals = async () => {
  const res = await api.get('/admin/future-readiness');
  return res.data;
};

export const updateFutureReadinessSignal = async (code, payload) => {
  const res = await api.put(`/admin/future-readiness/${code}`, payload);
  return res.data;
};

export const suggestFutureReadinessSignal = async (documentText) => {
  const res = await api.post('/admin/future-readiness/suggest-signal', { document_text: documentText });
  return res.data;
};

export const fetchTrainingEffectiveness = async () => {
  const res = await api.get('/admin/training-effectiveness');
  return res.data;
};

export const fetchIntegrationStatus = async () => {
  const res = await api.get('/admin/integration-status');
  return res.data;
};

export const fetchProgressHistory = async (officerId) => {
  const res = await api.get(`/officers/${officerId}/progress-history`);
  return res.data;
};

export const fetchLearnerFutureReadiness = async () => {
  const res = await api.get('/future-readiness');
  return res.data;
};

export const fetchReferenceMaterials = async () => {
  const res = await api.get('/admin/materials');
  return res.data;
};

export const uploadReferenceMaterial = async (filename, roleCode) => {
  const res = await api.post(`/admin/materials/upload?filename=${encodeURIComponent(filename)}&role_code=${encodeURIComponent(roleCode)}`);
  return res.data;
};

export const uploadReferenceMaterialFile = async (file, roleCode, courseId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('role_code', roleCode);
  if (courseId) formData.append('course_id', courseId);

  const res = await api.post('/admin/materials/upload-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const fetchMaterialDetails = async (materialId) => {
  const res = await api.get(`/admin/materials/${materialId}/details`);
  return res.data;
};

export default api;
