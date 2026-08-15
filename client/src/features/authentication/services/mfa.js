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
 * POST /auth/mfa/verify   { mfa_token, code } -> { data: { token, user } }
 */
export async function verifyMfaCode({ mfaToken, code }) {
  const res = await fetch(`${API_BASE_URL}/auth/mfa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mfa_token: mfaToken, code }),
  });
  return handleResponse(res);
}

/**
 * POST /auth/mfa/recovery   { mfa_token, recovery_code } -> { data: { token, user } }
 */
export async function verifyRecoveryCode({ mfaToken, recoveryCode }) {
  const res = await fetch(`${API_BASE_URL}/auth/mfa/recovery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mfa_token: mfaToken, recovery_code: recoveryCode }),
  });
  return handleResponse(res);
}