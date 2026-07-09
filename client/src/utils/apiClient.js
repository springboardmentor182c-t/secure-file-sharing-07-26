import { API_BASE_URL } from "../data/constants";

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken() {
  // De-dupe concurrent refresh calls if multiple requests 401 at once
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends the httpOnly refresh cookie
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        accessToken = data.access_token;
        return accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: any, skipAuth?: boolean }} options
 */
export async function apiRequest(path, options = {}) {
  const { method = "GET", body, skipAuth = false } = options;

  const doFetch = async (token) => {
    const headers = { "Content-Type": "application/json" };
    if (token && !skipAuth) headers["Authorization"] = `Bearer ${token}`;

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch(accessToken);

  // Access token expired - try one silent refresh, then retry the original request
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const errBody = await res.json();
      detail = errBody.detail || detail;
    } catch {
      /* no JSON body */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined;
  return res.json();
}
