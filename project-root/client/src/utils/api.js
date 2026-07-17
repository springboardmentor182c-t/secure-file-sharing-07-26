import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Files ─────────────────────────────────────────────────────────────────
export const filesAPI = {
  list: (folderId) => api.get('/api/files/', { params: { folder_id: folderId } }),
  upload: (formData, folderId, encrypted, mimetype, onProgress) =>
    api.post('/api/files/upload', formData, {
      params: { folder_id: folderId, encrypted, mimetype },
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  get: (id) => api.get(`/api/files/${id}`),
  download: (id) =>
    api.get(`/api/files/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/api/files/${id}`),
  toggleEncrypt: (id) => api.patch(`/api/files/${id}/encrypt`),
};

// ── Folders ───────────────────────────────────────────────────────────────
export const foldersAPI = {
  list: (parentId) => api.get('/api/folders/', { params: { parent_id: parentId } }),
  create: (name, parentId) => api.post('/api/folders/', { name, parent_id: parentId }),
  delete: (id) => api.delete(`/api/folders/${id}`),
};

export default api;
