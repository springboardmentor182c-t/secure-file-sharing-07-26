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
 * POST /auth/login
 * Expected success shapes from the backend:
 *   { data: { mfa_required: false, token, user } }
 *   { data: { mfa_required: true, mfa_token } }   // password ok, code needed next
 */
export async function login({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function loginWithOAuth(provider) {
  // Full-page redirect into the backend's OAuth flow - backend redirects
  // back to the app with a session once Google/Microsoft confirm.
  window.location.href = `${API_BASE_URL}/auth/oauth/${provider}`;
}