const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export const getDashboardStats = () =>
  fetch(`${API_BASE_URL}/dashboard/stats`).then(handleResponse);

export const getStorageByUser = () =>
  fetch(`${API_BASE_URL}/dashboard/storage-by-user`).then(handleResponse);

export const getUsers = () =>
  fetch(`${API_BASE_URL}/dashboard/users`).then(handleResponse);

export const getMonitoring = () =>
  fetch(`${API_BASE_URL}/dashboard/monitoring`).then(handleResponse);

export const inviteUser = (payload) =>
  fetch(`${API_BASE_URL}/dashboard/users/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);