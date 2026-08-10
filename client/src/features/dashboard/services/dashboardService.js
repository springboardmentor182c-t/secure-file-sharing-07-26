const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export const getDashboardStats = () =>
  fetch(`${API_BASE_URL}/api/dashboard/stats`).then(handleResponse).catch(() => ({ total_users: 1, active_users: 1, total_storage_gb: 0, total_storage_limit_gb: 1000, files_this_month: 0, active_share_links: 0 }));

export const getStorageByUser = () =>
  fetch(`${API_BASE_URL}/api/dashboard/storage-by-user`).then(handleResponse).catch(() => []);

export const getUsers = () =>
  fetch(`${API_BASE_URL}/api/dashboard/users`).then(handleResponse).catch(() => []);

export const getMonitoring = () =>
  fetch(`${API_BASE_URL}/api/dashboard/monitoring`).then(handleResponse).catch(() => []);

export const inviteUser = (payload) =>
  fetch(`${API_BASE_URL}/api/dashboard/users/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updateUser = (userId, payload) =>
  fetch(`${API_BASE_URL}/api/dashboard/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const deleteUser = (userId) =>
  fetch(`${API_BASE_URL}/api/dashboard/users/${userId}`, {
    method: "DELETE",
  }).then(handleResponse);