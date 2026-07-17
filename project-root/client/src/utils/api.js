import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
          storage.setItem('access_token', data.access_token);
          storage.setItem('refresh_token', data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/api/auth/signup', { name, email, password }),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  verifyOTP: (mfa_token, code) => api.post('/api/auth/verify-otp', { mfa_token, code }),
  resendOTP: (mfa_token) => api.post('/api/auth/resend-otp', { mfa_token }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, new_password) => api.post('/api/auth/reset-password', { token, new_password }),
  oauthToken: (provider, code) => api.post('/api/auth/oauth/token', { provider, code }),
  updateProfile: (data) => api.patch('/api/users/me', data),
};

// ── Files ─────────────────────────────────────────────────────────────────
export const filesAPI = {
  list: (folderId) => api.get('/api/files/', { params: { folder_id: folderId } }),
  upload: (formData, onProgress) =>
    api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  get: (id) => api.get(`/api/files/${id}`),
  download: (id) =>
    api.get(`/api/files/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/api/files/${id}`),
};

// ── Folders ───────────────────────────────────────────────────────────────
export const foldersAPI = {
  list: (parentId) => api.get('/api/folders/', { params: { parent_id: parentId } }),
  create: (name, parentId) => api.post('/api/folders/', { name, parent_id: parentId }),
  delete: (id) => api.delete(`/api/folders/${id}`),
};

// ── Shares ────────────────────────────────────────────────────────────────
export const sharesAPI = {
  list: () => api.get('/api/shares/'),
  create: (data) => api.post('/api/shares/', data),
  revoke: (id) => api.delete(`/api/shares/${id}`),
  access: (token, password) => api.get(`/api/shares/access/${token}`, { params: { password } }),
};

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get('/api/notifications/'),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllRead: () => api.patch('/api/notifications/read-all'),
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────
export const analyticsAPI = {
  summary: () => api.get('/api/analytics/summary'),
};

export const dashboardAPI = {
  get: () => api.get('/api/dashboard/'),
};

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  listUsers: () => api.get('/api/admin/users'),
  updateUser: (id, data) => api.patch(`/api/admin/users/${id}`, data),
};

// ── Audit ─────────────────────────────────────────────────────────────────
export const auditAPI = {
  list: (limit = 50) => api.get('/api/audit/', { params: { limit } }),
};

// ── Search ───────────────────────────────────────────────────────────────

export const searchAPI = {
  search: (query) =>
    api.get("/api/search/", {
      params: { q: query },
    }),
};

export default api;
