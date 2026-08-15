import { getOrCreateCurrentUserId } from "./currentUser";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function authHeaders() {
  const userId = await getOrCreateCurrentUserId(API);
  return {
    "X-User-Id": userId,
    "Content-Type": "application/json",
  };
}

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.detail || "Request failed";
    throw new Error(message);
  }

  return data;
}

export const getNotifications = async () => {
  const headers = await authHeaders();
  const response = await fetch(`${API}/notifications`, {
    headers,
  });

  return handleResponse(response);
};

export const markNotificationRead = async (id) => {
  const headers = await authHeaders();
  const response = await fetch(`${API}/notifications/${id}/read`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  return handleResponse(response);
};
