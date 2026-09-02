import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const uploadMaterialAndGenerateMcqs = async (formData) => {
  const res = await axios.post(`${API_BASE_URL}/assessments/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const submitQuizAnswers = async (assessmentId, officerId, answers) => {
  const res = await api.post(`/assessments/${assessmentId}/submit`, {
    officer_id: officerId,
    answers: answers,
  });
  return res.data;
};

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

export default api;
