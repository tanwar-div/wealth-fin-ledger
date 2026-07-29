import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach the JWT (kept in localStorage as a fallback to the httpOnly cookie)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fhb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages so components can just read err.message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ---- Auth ----
export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateMe: (payload) => api.put('/auth/me', payload).then((r) => r.data),
};

// ---- Income ----
export const incomeApi = {
  list: (params) => api.get('/income', { params }).then((r) => r.data),
  create: (payload) => api.post('/income', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/income/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/income/${id}`).then((r) => r.data),
};

// ---- Expenses ----
export const expenseApi = {
  list: (params) => api.get('/expenses', { params }).then((r) => r.data),
  create: (payload) => api.post('/expenses', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/expenses/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/expenses/${id}`).then((r) => r.data),
};

// ---- Habits ----
export const habitApi = {
  list: () => api.get('/habits').then((r) => r.data),
  create: (payload) => api.post('/habits', payload).then((r) => r.data),
  complete: (id) => api.patch(`/habits/${id}/complete`).then((r) => r.data),
  skip: (id) => api.patch(`/habits/${id}/skip`).then((r) => r.data),
  update: (id, payload) => api.put(`/habits/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/habits/${id}`).then((r) => r.data),
};

// ---- Savings Goals ----
export const goalApi = {
  list: () => api.get('/goals').then((r) => r.data),
  create: (payload) => api.post('/goals', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/goals/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/goals/${id}`).then((r) => r.data),
};

// ---- Assets ----
export const assetApi = {
  list: () => api.get('/assets').then((r) => r.data),
  create: (payload) => api.post('/assets', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/assets/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/assets/${id}`).then((r) => r.data),
};

// ---- Dashboard ----
export const dashboardApi = {
  summary: () => api.get('/dashboard').then((r) => r.data),
  analytics: () => api.get('/dashboard/analytics').then((r) => r.data),
};

// ---- Feedback ----
export const feedbackApi = {
  submit: (payload) => api.post('/feedback', payload).then((r) => r.data),
};

// ---- Admin ----
export const adminApi = {
  users: () => api.get('/admin/users').then((r) => r.data),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  stats: () => api.get('/admin/stats').then((r) => r.data),
  feedback: () => api.get('/admin/feedback').then((r) => r.data),
  updateFeedbackStatus: (id, status) => api.patch(`/admin/feedback/${id}`, { status }).then((r) => r.data),
};
