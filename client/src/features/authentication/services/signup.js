const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function handleResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body
  }
  if (!res.ok) {
    const message = body?.message || body?.detail || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return body?.data ?? body;
}

/**
 * POST /auth/signup
 * Expected: { data: { token, user } }
 */
export async function signup({ fullName, email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, email, password }),
  });
  return handleResponse(res);
}